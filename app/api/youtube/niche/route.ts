import { NextRequest, NextResponse } from 'next/server'
import { collectNicheSnapshot } from '@/lib/youtube/trendCollector'

/**
 * GET /api/youtube/niche
 * Get niche data or analyze a niche
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'analyze'
    const keyword = searchParams.get('keyword')
    const regionCode = searchParams.get('regionCode') || 'IN'
    const maxResults = parseInt(searchParams.get('maxResults') || '24')

    if (action === 'analyze' && keyword) {
      // Analyze a niche and return video data
      const result = await collectNicheSnapshot(
        keyword,
        regionCode,
        Math.min(maxResults, 50)
      )

      // Get the video IDs from the snapshot to fetch full video details
      const apiKey = process.env.YOUTUBE_API_KEY
      if (!apiKey || apiKey === 'your_youtube_api_key_here') {
        return NextResponse.json({
          error: 'YouTube API key not configured',
        }, { status: 500 })
      }

      // Search for videos to get their details
      const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
      searchUrl.searchParams.set('part', 'snippet')
      searchUrl.searchParams.set('q', keyword)
      searchUrl.searchParams.set('type', 'video')
      searchUrl.searchParams.set('order', 'viewCount')
      searchUrl.searchParams.set('maxResults', maxResults.toString())
      searchUrl.searchParams.set('regionCode', regionCode)
      searchUrl.searchParams.set('key', apiKey)

      const searchResponse = await fetch(searchUrl.toString())
      if (!searchResponse.ok) {
        throw new Error('Failed to search videos')
      }

      const searchData = await searchResponse.json()
      const videoIds = searchData.items?.map((item: any) => item.id.videoId).join(',')

      if (!videoIds) {
        return NextResponse.json({
          videos: [],
          analytics: result,
          message: 'No videos found',
        })
      }

      // Get detailed statistics
      const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
      videosUrl.searchParams.set('part', 'statistics,snippet,contentDetails')
      videosUrl.searchParams.set('id', videoIds)
      videosUrl.searchParams.set('key', apiKey)

      const videosResponse = await fetch(videosUrl.toString())
      const videosData = await videosResponse.json()

      const videos = videosData.items.map((video: any) => {
        const stats = video.statistics
        const views = parseInt(stats.viewCount || '0')
        const likes = parseInt(stats.likeCount || '0')
        const comments = parseInt(stats.commentCount || '0')
        const engagement = views > 0 ? ((likes + comments) / views * 100) : 0

        return {
          id: video.id,
          youtubeVideoId: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channelId: video.snippet.channelId,
          channelTitle: video.snippet.channelTitle,
          thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
          publishedAt: video.snippet.publishedAt,
          views,
          likes,
          comments,
          duration: video.contentDetails?.duration,
          engagementRate: engagement,
          url: `https://www.youtube.com/watch?v=${video.id}`,
        }
      })

      return NextResponse.json({
        videos,
        analytics: {
          averageViews: result.avgViews,
          averageLikes: result.avgLikes,
          averageEngagement: result.avgEngagementRate,
          averageTitleLength: 0,
          patterns: { numbersUsed: '0%', questionsUsed: '0%' },
        },
        outlierCount: result.outlierCount,
        outliers: result.outliers,
      })
    }

    return NextResponse.json({ error: 'Invalid action or missing keyword' }, { status: 400 })
  } catch (error: any) {
    console.error('Niche API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze niche' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/youtube/niche
 * Create or track a niche
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, keywords, categoryIds, description, parentNicheId } = body

    // Not implementing niche creation for now - just returning success
    return NextResponse.json({
      success: true,
      message: 'Niche analysis feature - use GET with keyword parameter',
    })
  } catch (error: any) {
    console.error('Niche Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process niche' },
      { status: 500 }
    )
  }
}
