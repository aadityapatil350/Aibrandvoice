import { NextRequest, NextResponse } from 'next/server'

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

/**
 * VidIQ-Style Trending/Outlier Videos API
 * GET /api/youtube/trending-analysis
 *
 * Fetches trending videos OR search results with pagination, filtering, and merit-based ranking
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || '' // Search query
    const regionCode = searchParams.get('regionCode') || 'IN'
    const maxResults = Math.min(parseInt(searchParams.get('maxResults') || '25'), 50) // Max 50 per page
    const pageToken = searchParams.get('pageToken') || ''
    const categoryId = searchParams.get('categoryId') || ''
    const order = searchParams.get('order') || 'viewCount' // by views by default

    // Filters (with smart defaults - more lenient for search)
    const isSearchMode = query && query.trim()
    const minEngagementRate = parseFloat(searchParams.get('minEngagementRate') || '0')
    const maxEngagementRate = parseFloat(searchParams.get('maxEngagementRate') || '100')
    const minViews = parseInt(searchParams.get('minViews') || (isSearchMode ? '0' : '1000'))
    const maxViews = parseInt(searchParams.get('maxViews') || '999999999999')
    const minSubscribers = parseInt(searchParams.get('minSubscribers') || '0')
    const maxSubscribers = parseInt(searchParams.get('maxSubscribers') || '999999999999')
    const minDuration = parseInt(searchParams.get('minDuration') || (isSearchMode ? '0' : '60')) // No min for search
    const maxDuration = parseInt(searchParams.get('maxDuration') || '36000') // 10 hours max
    const uploadedAfterDays = parseInt(searchParams.get('uploadedAfterDays') || (isSearchMode ? '30' : '7')) // Last 30 days for search

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey || apiKey === 'your_youtube_api_key_here') {
      return NextResponse.json({
        error: 'YouTube API key not configured',
        setupRequired: true
      }, { status: 500 })
    }

    // Calculate date for uploaded filter
    const uploadedAfterDate = new Date()
    uploadedAfterDate.setDate(uploadedAfterDate.getDate() - uploadedAfterDays)
    const publishedAfter = uploadedAfterDate.toISOString()

    let videoIds: string[] = []
    let nextPageToken: string | null = null
    let prevPageToken: string | null = null

    // Step 1: Fetch videos - either search or trending
    if (query && query.trim()) {
      // SEARCH MODE: Use YouTube search API
      console.log(`[Trending API] Search mode for query: "${query}"`)
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
      searchUrl.searchParams.set('part', 'snippet')
      searchUrl.searchParams.set('q', query)
      searchUrl.searchParams.set('type', 'video')
      searchUrl.searchParams.set('maxResults', maxResults.toString())
      searchUrl.searchParams.set('order', order)
      searchUrl.searchParams.set('regionCode', regionCode)
      searchUrl.searchParams.set('publishedAfter', publishedAfter)
      searchUrl.searchParams.set('key', apiKey)

      if (pageToken) searchUrl.searchParams.set('pageToken', pageToken)
      if (categoryId) searchUrl.searchParams.set('videoCategoryId', categoryId)

      const searchResponse = await fetch(searchUrl.toString())

      if (!searchResponse.ok) {
        const error = await searchResponse.json()
        console.error('[Trending API] YouTube Search API error:', error)
        return NextResponse.json({ error: error.error?.message || 'YouTube API error' }, { status: 500 })
      }

      const searchData = await searchResponse.json()
      videoIds = searchData.items?.map((item: any) => item.id.videoId) || []
      nextPageToken = searchData.nextPageToken || null
      prevPageToken = searchData.prevPageToken || null

      console.log(`[Trending API] Search returned ${videoIds.length} video IDs`)
    } else {
      // TRENDING MODE: Use mostPopular chart
      console.log(`[Trending API] Trending mode for region: ${regionCode}`)
      const trendingUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      trendingUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
      trendingUrl.searchParams.set('chart', 'mostPopular')
      trendingUrl.searchParams.set('regionCode', regionCode)
      trendingUrl.searchParams.set('maxResults', maxResults.toString())
      trendingUrl.searchParams.set('key', apiKey)

      if (categoryId) trendingUrl.searchParams.set('videoCategoryId', categoryId)
      if (pageToken) trendingUrl.searchParams.set('pageToken', pageToken)

      const trendingResponse = await fetch(trendingUrl.toString())

      if (!trendingResponse.ok) {
        const error = await trendingResponse.json()
        console.error('[Trending API] YouTube API error:', error)
        return NextResponse.json({ error: error.error?.message || 'YouTube API error' }, { status: 500 })
      }

      const trendingData = await trendingResponse.json()
      videoIds = trendingData.items?.map((item: any) => item.id) || []
      nextPageToken = trendingData.nextPageToken || null
      prevPageToken = trendingData.prevPageToken || null

      console.log(`[Trending API] Trending returned ${videoIds.length} videos`)
    }

    // If no videos found, return empty
    if (!videoIds || videoIds.length === 0) {
      return NextResponse.json({
        videos: [],
        pagination: { nextPageToken: null, prevPageToken: null, total: 0 },
        analytics: null
      })
    }

    // Step 2: Get full video details for all videos (for search results)
    let videoDetailsMap = new Map()

    if (query && query.trim()) {
      // For search results, we need to fetch video details
      const videoBatches = []
      for (let i = 0; i < videoIds.length; i += 50) {
        videoBatches.push(videoIds.slice(i, i + 50))
      }

      for (const batch of videoBatches) {
        const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
        videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
        videosUrl.searchParams.set('id', batch.join(','))
        videosUrl.searchParams.set('key', apiKey)

        const videosResponse = await fetch(videosUrl.toString())
        if (videosResponse.ok) {
          const videosData = await videosResponse.json()
          videosData.items?.forEach((video: any) => {
            videoDetailsMap.set(video.id, video)
          })
        }
      }
    }

    // Step 3: Get channel statistics for all videos
    let allVideoDetails: any[] = []

    if (query && query.trim()) {
      // Use fetched video details from search
      allVideoDetails = Array.from(videoDetailsMap.values())
    } else {
      // For trending, we already have the full video objects
      // We need to fetch them using the video IDs
      const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
      videosUrl.searchParams.set('id', videoIds.join(','))
      videosUrl.searchParams.set('key', apiKey)

      const videosResponse = await fetch(videosUrl.toString())
      if (videosResponse.ok) {
        const videosData = await videosResponse.json()
        allVideoDetails = videosData.items || []
      }
    }

    const uniqueChannelIds = [...new Set(allVideoDetails.map((v: any) => v.snippet.channelId))]

    // YouTube API limits to 50 channels per request
    const channelBatches = []
    for (let i = 0; i < uniqueChannelIds.length; i += 50) {
      channelBatches.push(uniqueChannelIds.slice(i, i + 50))
    }

    const channelStatsMap = new Map()
    for (const batch of channelBatches) {
      const channelsUrl = new URL('https://www.googleapis.com/youtube/v3/channels')
      channelsUrl.searchParams.set('part', 'statistics')
      channelsUrl.searchParams.set('id', batch.join(','))
      channelsUrl.searchParams.set('key', apiKey)

      const channelsResponse = await fetch(channelsUrl.toString())
      if (channelsResponse.ok) {
        const channelsData = await channelsResponse.json()
        channelsData.items?.forEach((channel: any) => {
          channelStatsMap.set(channel.id, {
            subscriberCount: parseInt(channel.statistics.subscriberCount || '0'),
            videoCount: parseInt(channel.statistics.videoCount || '0'),
            viewCount: parseInt(channel.statistics.viewCount || '0'),
          })
        })
      }
    }

    console.log(`[Trending API] Fetched stats for ${channelStatsMap.size} channels`)

    // Step 4: Process and calculate metrics
    let videos = allVideoDetails.map((video: any) => {
      const stats = video.statistics
      const views = parseInt(stats.viewCount || '0')
      const likes = parseInt(stats.likeCount || '0')
      const comments = parseInt(stats.commentCount || '0')
      const durationStr = video.contentDetails?.duration || 'PT0S'
      const durationInSeconds = parseYouTubeDuration(durationStr)

      const channelStats = channelStatsMap.get(video.snippet.channelId) || {
        subscriberCount: 0,
        videoCount: 0,
        viewCount: 0
      }

      // Calculate engagement metrics
      const engagementRate = views > 0 ? ((likes + comments) / views) * 100 : 0
      const avgViewsPerVideo = channelStats.videoCount > 0
        ? Math.round(channelStats.viewCount / channelStats.videoCount)
        : views // If new channel, use this video's views as baseline

      // Multiplier: how much this video outperformed channel average
      const multiplier = avgViewsPerVideo > 0 ? views / avgViewsPerVideo : 999

      // Merit Score (0-100): Combined ranking for discovery
      let meritScore = 50 // Base score

      // Engagement quality (0-25 points)
      meritScore += Math.min(25, engagementRate * 2.5)

      // View velocity (0-25 points)  - how fast it's getting views
      const hoursOld = (Date.now() - new Date(video.snippet.publishedAt).getTime()) / (1000 * 60 * 60)
      const viewsPerHour = hoursOld > 0 ? views / hoursOld : views
      meritScore += Math.min(25, (viewsPerHour / 1000) * 2.5)

      // Channel authority (0-25 points)
      if (channelStats.subscriberCount > 1000000) meritScore += 25
      else if (channelStats.subscriberCount > 100000) meritScore += 20
      else if (channelStats.subscriberCount > 10000) meritScore += 15
      else if (channelStats.subscriberCount > 1000) meritScore += 10
      else if (channelStats.subscriberCount > 100) meritScore += 5

      // Consistency (0-25 points) - channels that upload regularly
      const videosPerMonth = channelStats.videoCount > 0 ? (channelStats.videoCount / 12) : 0
      if (videosPerMonth > 30) meritScore += 25
      else if (videosPerMonth > 10) meritScore += 20
      else if (videosPerMonth > 4) meritScore += 15
      else meritScore += 5

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
        duration: durationStr,
        durationInSeconds,
        engagementRate: parseFloat(engagementRate.toFixed(2)),
        viewsPerHour: parseFloat((viewsPerHour).toFixed(2)),
        meritScore: Math.min(100, meritScore),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        subscriberCount: channelStats.subscriberCount,
        channelVideoCount: channelStats.videoCount,
        channelTotalViews: channelStats.viewCount,
        avgViewsPerVideo: avgViewsPerVideo,
        multiplier: parseFloat(multiplier.toFixed(2)),
      }
    })

    // Step 4: Apply filters (be lenient - don't filter too much)
    const beforeFilter = videos.length
    videos = videos.filter((video: any) => {
      // Engagement filter
      if (video.engagementRate < minEngagementRate || video.engagementRate > maxEngagementRate) {
        return false
      }
      // Views filter
      if (video.views < minViews || video.views > maxViews) {
        return false
      }
      // Subscriber filter (optional - skip if both are defaults)
      if (minSubscribers > 0 || maxSubscribers < 999999999999) {
        if (video.subscriberCount < minSubscribers || video.subscriberCount > maxSubscribers) {
          return false
        }
      }
      // Duration filter
      if (video.durationInSeconds < minDuration || video.durationInSeconds > maxDuration) {
        return false
      }
      return true
    })

    console.log(`[Trending API] Applied filters: ${beforeFilter} → ${videos.length} videos (filtered ${beforeFilter - videos.length})`)

    // Step 5: Sort by merit score and views by default
    const finalOrder = searchParams.get('sortBy') || 'merit'
    videos.sort((a: any, b: any) => {
      if (finalOrder === 'merit') return b.meritScore - a.meritScore
      if (finalOrder === 'views') return b.views - a.views
      if (finalOrder === 'engagement') return b.engagementRate - a.engagementRate
      if (finalOrder === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      return b.views - a.views
    })

    // Generate analytics
    const analytics = {
      totalVideos: videos.length,
      avgEngagementRate: videos.length > 0 ? parseFloat((videos.reduce((s: number, v: any) => s + v.engagementRate, 0) / videos.length).toFixed(2)) : 0,
      avgViews: videos.length > 0 ? Math.round(videos.reduce((s: number, v: any) => s + v.views, 0) / videos.length) : 0,
      avgMeritScore: videos.length > 0 ? parseFloat((videos.reduce((s: number, v: any) => s + v.meritScore, 0) / videos.length).toFixed(1)) : 0,
      topPerformer: videos[0] || null,
      highEngagementCount: videos.filter((v: any) => v.engagementRate > 5).length,
      highViewsCount: videos.filter((v: any) => v.views > 100000).length,
    }

    return NextResponse.json({
      videos,
      pagination: {
        nextPageToken: nextPageToken || null,
        prevPageToken: prevPageToken || null,
        currentResults: videos.length,
        maxResults
      },
      analytics,
      filters: {
        minEngagementRate,
        maxEngagementRate,
        minViews,
        maxViews,
        minSubscribers,
        maxSubscribers,
        minDuration,
        maxDuration,
        uploadedAfterDays
      }
    })

  } catch (error: any) {
    console.error('[Trending API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending videos' },
      { status: 500 }
    )
  }
}
