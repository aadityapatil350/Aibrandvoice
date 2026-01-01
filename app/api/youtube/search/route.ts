import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

// Simple in-memory cache
const cache = new Map()
const CACHE_TTL = 3600000 // 1 hour

// Helper function to parse YouTube duration format (PT1H2M30S) to seconds
function parseYouTubeDuration(duration: string): number {
  if (!duration) return 0
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')
  return hours * 3600 + minutes * 60 + seconds
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'search'
    const maxResults = parseInt(searchParams.get('maxResults') || '12')
    const order = searchParams.get('order') || 'relevance'
    const regionCode = searchParams.get('regionCode') || 'IN'

    // Advanced filters
    const publishedAfter = searchParams.get('publishedAfter') || ''
    const videoDuration = searchParams.get('videoDuration') || 'any'
    const relevanceLanguage = searchParams.get('relevanceLanguage') || 'en'
    const viewsMin = parseInt(searchParams.get('viewsMin') || '0')
    const viewsMax = parseInt(searchParams.get('viewsMax') || '999999999999')
    const multiplierMin = parseFloat(searchParams.get('multiplierMin') || '0')
    const multiplierMax = parseFloat(searchParams.get('multiplierMax') || '999999')
    const subscribersMin = parseInt(searchParams.get('subscribersMin') || '0')
    const subscribersMax = parseInt(searchParams.get('subscribersMax') || '999999999999')
    const durationMin = parseInt(searchParams.get('durationMin') || '0')
    const durationMax = parseInt(searchParams.get('durationMax') || '999999999')

    if (!query && type === 'search') {
      return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 })
    }

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return NextResponse.json({
        error: 'YouTube API key not configured. Please add YOUTUBE_API_KEY to your .env file.',
        setupRequired: true
      }, { status: 500 })
    }

    // Check cache (include filters in cache key)
    const cacheKey = `${type}-${query}-${maxResults}-${order}-${regionCode}-${publishedAfter}-${videoDuration}-${relevanceLanguage}-${viewsMin}-${viewsMax}-${multiplierMin}-${multiplierMax}-${subscribersMin}-${subscribersMax}-${durationMin}-${durationMax}`
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey)
      if (Date.now() - cached.timestamp < CACHE_TTL) {
        return NextResponse.json({ ...cached.data, fromCache: true })
      }
    }

    let videos: any[] = []

    if (type === 'search') {
      // Step 1: Search for videos
      if (!query) {
        return NextResponse.json({ error: 'Query parameter required for search' }, { status: 400 })
      }
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
      searchUrl.searchParams.set('part', 'snippet')
      searchUrl.searchParams.set('q', query)
      searchUrl.searchParams.set('type', 'video')
      searchUrl.searchParams.set('maxResults', maxResults.toString())
      searchUrl.searchParams.set('order', order)
      searchUrl.searchParams.set('regionCode', regionCode)
      searchUrl.searchParams.set('relevanceLanguage', relevanceLanguage)
      if (publishedAfter) {
        searchUrl.searchParams.set('publishedAfter', publishedAfter)
      }
      if (videoDuration && videoDuration !== 'any') {
        searchUrl.searchParams.set('videoDuration', videoDuration)
      }
      searchUrl.searchParams.set('key', apiKey)

      const searchResponse = await fetch(searchUrl.toString())
      if (!searchResponse.ok) {
        const error = await searchResponse.json()
        return NextResponse.json({ error: error.error.message }, { status: searchResponse.status })
      }

      const searchData = await searchResponse.json()
      console.log(`[YouTube API] Search returned ${searchData.items?.length || 0} videos`)

      if (!searchData.items || searchData.items.length === 0) {
        return NextResponse.json({ videos: [], message: 'No videos found' })
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

      // Step 2: Get detailed statistics
      const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      videosUrl.searchParams.set('part', 'statistics,snippet,contentDetails')
      videosUrl.searchParams.set('id', videoIds)
      videosUrl.searchParams.set('key', apiKey)

      const videosResponse = await fetch(videosUrl.toString())
      const videosData = await videosResponse.json()

      // Step 3: Get channel statistics
      const uniqueChannelIds = [...new Set(videosData.items.map((video: any) => video.snippet.channelId))]
      const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
      channelsUrl.searchParams.set('part', 'statistics')
      channelsUrl.searchParams.set('id', uniqueChannelIds.join(','))
      channelsUrl.searchParams.set('key', apiKey)

      const channelsResponse = await fetch(channelsUrl.toString())
      const channelsData = await channelsResponse.json()

      // Create a map of channel stats
      const channelStatsMap = new Map()
      channelsData.items?.forEach((channel: any) => {
        channelStatsMap.set(channel.id, {
          subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
          videoCount: parseInt(channel.statistics.videoCount || '0'),
          viewCount: parseInt(channel.statistics.viewCount || '0'),
        })
      })

      videos = videosData.items.map((video: any) => {
        const stats = video.statistics
        const views = parseInt(stats.viewCount || '0')
        const likes = parseInt(stats.likeCount || '0')
        const comments = parseInt(stats.commentCount || '0')
        const engagement = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : '0'
        const duration = video.contentDetails?.duration || ''
        const durationInSeconds = parseYouTubeDuration(duration)

        const channelStats = channelStatsMap.get(video.snippet.channelId) || {}
        const avgViews = channelStats.videoCount > 0
          ? Math.round(channelStats.viewCount / channelStats.videoCount)
          : 0

        // Calculate multiplier: how many times this video exceeded channel average
        // If avgViews is 0 or very small, set multiplier to a high value so it passes filter
        const multiplier = avgViews > 0 ? views / avgViews : 999

        return {
          id: video.id,
          youtubeVideoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
          publishedAt: video.snippet.publishedAt,
          tags: video.snippet.tags || [],
          categoryId: video.snippet.categoryId,
          views,
          likes,
          comments,
          duration,
          durationInSeconds,
          engagementRate: parseFloat(engagement),
          url: `https://www.youtube.com/watch?v=${video.id}`,
          subscriberCount: channelStats.subscriberCount || 0,
          channelAvgViews: avgViews,
          multiplier,
        }
      })

      const beforeFilter = videos.length
      videos = videos.filter((video: any) => {
        // Apply client-side filters
        if (video.views < viewsMin || video.views > viewsMax) return false
        // Filter by multiplier only if we have valid channel data
        // Skip multiplier check for channels with no average data
        if (video.channelAvgViews > 0 && (video.multiplier < multiplierMin || video.multiplier > multiplierMax)) {
          return false
        }
        // Filter by subscribers
        if (video.subscriberCount < subscribersMin || video.subscriberCount > subscribersMax) {
          return false
        }
        // Filter by duration (in seconds)
        if (video.durationInSeconds < durationMin || video.durationInSeconds > durationMax) {
          return false
        }
        return true
      })

      console.log(`[YouTube API] Filters: ${beforeFilter} videos → ${videos.length} videos (${beforeFilter - videos.length} filtered out)`)
      console.log(`[YouTube API] Filter settings: views=${viewsMin}-${viewsMax}, multiplier=${multiplierMin}-${multiplierMax}, subscribers=${subscribersMin}-${subscribersMax}, duration=${durationMin}-${durationMax}s`)
    } else if (type === 'trending') {
      const categoryId = searchParams.get('categoryId') || ''

      const trendingUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      trendingUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
      trendingUrl.searchParams.set('chart', 'mostPopular')
      trendingUrl.searchParams.set('regionCode', regionCode)
      trendingUrl.searchParams.set('maxResults', maxResults.toString())
      if (categoryId) trendingUrl.searchParams.set('videoCategoryId', categoryId)
      trendingUrl.searchParams.set('key', apiKey)

      const trendingResponse = await fetch(trendingUrl.toString())
      if (!trendingResponse.ok) {
        const error = await trendingResponse.json()
        return NextResponse.json({ error: error.error.message }, { status: trendingResponse.status })
      }

      const trendingData = await trendingResponse.json()
      console.log(`[YouTube API] Trending returned ${trendingData.items?.length || 0} videos`)

      // Get channel statistics for trending videos
      const uniqueChannelIds = [...new Set(trendingData.items.map((video: any) => video.snippet.channelId))]
      const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
      channelsUrl.searchParams.set('part', 'statistics')
      channelsUrl.searchParams.set('id', uniqueChannelIds.join(','))
      channelsUrl.searchParams.set('key', apiKey)

      const channelsResponse = await fetch(channelsUrl.toString())
      const channelsData = await channelsResponse.json()

      // Create a map of channel stats
      const channelStatsMap = new Map()
      channelsData.items?.forEach((channel: any) => {
        channelStatsMap.set(channel.id, {
          subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
          videoCount: parseInt(channel.statistics.videoCount || '0'),
          viewCount: parseInt(channel.statistics.viewCount || '0'),
        })
      })

      videos = trendingData.items.map((video: any) => {
        const stats = video.statistics
        const views = parseInt(stats.viewCount || '0')
        const likes = parseInt(stats.likeCount || '0')
        const comments = parseInt(stats.commentCount || '0')
        const engagement = views > 0 ? ((likes + comments) / views * 100).toFixed(2) : '0'
        const duration = video.contentDetails?.duration || ''
        const durationInSeconds = parseYouTubeDuration(duration)

        const channelStats = channelStatsMap.get(video.snippet.channelId) || {}
        const avgViews = channelStats.videoCount > 0
          ? Math.round(channelStats.viewCount / channelStats.videoCount)
          : 0

        // Calculate multiplier: how many times this video exceeded channel average
        // If avgViews is 0 or very small, set multiplier to a high value so it passes filter
        const multiplier = avgViews > 0 ? views / avgViews : 999

        return {
          id: video.id,
          youtubeVideoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
          publishedAt: video.snippet.publishedAt,
          tags: video.snippet.tags || [],
          categoryId: video.snippet.categoryId,
          views,
          likes,
          comments,
          duration,
          durationInSeconds,
          engagementRate: parseFloat(engagement),
          url: `https://www.youtube.com/watch?v=${video.id}`,
          subscriberCount: channelStats.subscriberCount || 0,
          channelAvgViews: avgViews,
          multiplier,
        }
      })

      const beforeFilter = videos.length
      videos = videos.filter((video: any) => {
        // Apply client-side filters
        if (video.views < viewsMin || video.views > viewsMax) return false
        // Filter by multiplier only if we have valid channel data
        // Skip multiplier check for channels with no average data
        if (video.channelAvgViews > 0 && (video.multiplier < multiplierMin || video.multiplier > multiplierMax)) {
          return false
        }
        // Filter by subscribers
        if (video.subscriberCount < subscribersMin || video.subscriberCount > subscribersMax) {
          return false
        }
        // Filter by duration (in seconds)
        if (video.durationInSeconds < durationMin || video.durationInSeconds > durationMax) {
          return false
        }
        return true
      })

      console.log(`[YouTube API] Filters: ${beforeFilter} videos → ${videos.length} videos (${beforeFilter - videos.length} filtered out)`)
      console.log(`[YouTube API] Filter settings: views=${viewsMin}-${viewsMax}, multiplier=${multiplierMin}-${multiplierMax}, subscribers=${subscribersMin}-${subscribersMax}, duration=${durationMin}-${durationMax}s`)
    }

    // Generate analytics
    const analytics = generateAnalytics(videos)

    const result = {
      videos,
      count: videos.length,
      analytics
    }

    // Cache the result
    cache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('YouTube API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch YouTube data' },
      { status: 500 }
    )
  }
}

function generateAnalytics(videos: any[]) {
  if (videos.length === 0) return null

  const totalViews = videos.reduce((sum, v) => sum + v.views, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likes, 0)
  const avgViews = Math.round(totalViews / videos.length)
  const avgLikes = Math.round(totalLikes / videos.length)
  const avgEngagement = videos.reduce((sum, v) => sum + v.engagementRate, 0) / videos.length

  // Title length analysis
  const titleLengths = videos.map(v => v.title.length)
  const avgTitleLength = Math.round(titleLengths.reduce((a, b) => a + b, 0) / titleLengths.length)

  // Find patterns
  const allTitles = videos.map(v => v.title.toLowerCase())
  const hasNumbers = allTitles.filter(t => /\d/.test(t)).length
  const hasQuestions = allTitles.filter(t => t.includes('?')).length

  return {
    averageViews: avgViews,
    averageLikes: avgLikes,
    averageEngagement: parseFloat(avgEngagement.toFixed(2)),
    averageTitleLength: avgTitleLength,
    patterns: {
      numbersUsed: `${Math.round(hasNumbers / videos.length * 100)}%`,
      questionsUsed: `${Math.round(hasQuestions / videos.length * 100)}%`,
    },
    topPerformer: videos.reduce((max, v) => v.views > max.views ? v : max, videos[0])
  }
}
