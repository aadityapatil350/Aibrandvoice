import { prisma } from '@/lib/prisma'

// YouTube category IDs
export const YOUTUBE_CATEGORIES = {
  FILM_ANIMATION: '1',
  AUTOS_VEHICLES: '2',
  MUSIC: '10',
  PETS_ANIMALS: '15',
  SPORTS: '17',
  SHORT_MOVIES: '18',
  TRAVEL_EVENTS: '19',
  GAMING: '20',
  VIDEOBLOGGING: '21',
  PEOPLE_BLOGS: '22',
  COMEDY: '23',
  ENTERTAINMENT: '24',
  NEWS_POLITICS: '25',
  HOWTO_STYLE: '26',
  EDUCATION: '27',
  SCIENCE_TECHNOLOGY: '28',
} as const

export type CategoryCode = keyof typeof YOUTUBE_CATEGORIES | 'ALL'

// Statistical functions for outlier detection
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((sum, val) => sum + val, 0) / values.length
}

function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2))
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length)
}

function calculatePercentile(values: number[], percentile: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.ceil((percentile / 100) * sorted.length) - 1
  return sorted[index] || 0
}

function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0
  return (value - mean) / stdDev
}

interface VideoData {
  youtubeVideoId: string
  viewCount: number
  likeCount: number
  commentCount: number
  engagementRate: number
  title: string
  publishedAt: Date
  channelId: string
  thumbnailUrl: string
}

interface TrendSnapshotResult {
  snapshotId: string
  totalVideos: number
  avgViews: number
  avgLikes: number
  avgEngagementRate: number
  outlierCount: number
  outliers: Array<{
    youtubeVideoId: string
    outlierScore: number
    outlierType: string
    viewsVsBaseline: number
  }>
}

/**
 * Collect trending videos and detect outliers
 */
export async function collectTrendingSnapshot(
  regionCode: string = 'IN',
  categoryId?: string,
  maxResults: number = 50
): Promise<TrendSnapshotResult> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    throw new Error('YouTube API key not configured')
  }

  // Fetch trending videos
  const trendingUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  trendingUrl.searchParams.set('part', 'statistics,snippet,contentDetails')
  trendingUrl.searchParams.set('chart', 'mostPopular')
  trendingUrl.searchParams.set('regionCode', regionCode)
  trendingUrl.searchParams.set('maxResults', maxResults.toString())
  if (categoryId) {
    trendingUrl.searchParams.set('videoCategoryId', categoryId)
  }
  trendingUrl.searchParams.set('key', apiKey)

  const response = await fetch(trendingUrl.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch trending videos')
  }

  const data = await response.json()
  const videos = data.items || []

  // Process video data
  const videoData: VideoData[] = videos.map((video: any) => {
    const stats = video.statistics
    const views = parseInt(stats.viewCount || '0')
    const likes = parseInt(stats.likeCount || '0')
    const comments = parseInt(stats.commentCount || '0')
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0

    return {
      youtubeVideoId: video.id,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      engagementRate: engagement,
      title: video.snippet.title,
      publishedAt: new Date(video.snippet.publishedAt),
      channelId: video.snippet.channelId,
      thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
    }
  })

  // Calculate statistics
  const views = videoData.map(v => v.viewCount)
  const engagementRates = videoData.map(v => v.engagementRate)

  const meanViews = calculateMean(views)
  const stdDevViews = calculateStdDev(views, meanViews)
  const meanEngagement = calculateMean(engagementRates)
  const stdDevEngagement = calculateStdDev(engagementRates, meanEngagement)
  const percentile75 = calculatePercentile(views, 75)
  const percentile90 = calculatePercentile(views, 90)

  // Detect outliers (videos > 2 standard deviations above mean)
  const outliers: Array<{
    youtubeVideoId: string
    outlierScore: number
    outlierType: string
    viewsVsBaseline: number
  }> = []

  videoData.forEach(video => {
    const viewZScore = calculateZScore(video.viewCount, meanViews, stdDevViews)
    const engagementZScore = calculateZScore(video.engagementRate, meanEngagement, stdDevEngagement)

    let isOutlier = false
    let outlierType = ''
    let outlierScore = 0

    // Viral video: Extremely high views (> 2 std devs)
    if (viewZScore > 2) {
      isOutlier = true
      outlierType = 'viral'
      outlierScore = viewZScore
    }

    // High engagement: Exceptional engagement rate
    if (engagementZScore > 2) {
      isOutlier = true
      if (!outlierType) {
        outlierType = 'high_engagement'
        outlierScore = engagementZScore
      }
    }

    // Fast growth: New video with high views (less than 7 days old, in top 25%)
    const daysSincePublish = (Date.now() - video.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePublish < 7 && video.viewCount >= percentile75) {
      isOutlier = true
      if (!outlierType) {
        outlierType = 'fast_growth'
        outlierScore = viewZScore
      }
    }

    // Unexpected hit: High views despite being from small channel (heuristic)
    if (viewZScore > 1.5 && daysSincePublish < 30) {
      isOutlier = true
      if (!outlierType) {
        outlierType = 'unexpected_hit'
        outlierScore = viewZScore
      }
    }

    if (isOutlier) {
      outliers.push({
        youtubeVideoId: video.youtubeVideoId,
        outlierScore: Math.abs(outlierScore),
        outlierType,
        viewsVsBaseline: video.viewCount / meanViews,
      })

      // Store outlier in database
      storeOutlierVideo(video, outlierType, Math.abs(outlierScore), meanViews, meanEngagement, regionCode, categoryId)
    }
  })

  // Create trend snapshot
  const snapshot = await prisma.trendSnapshot.create({
    data: {
      regionCode,
      categoryId: categoryId || null,
      snapshotType: 'trending',
      totalVideos: videoData.length,
      avgViews: meanViews,
      avgLikes: calculateMean(videoData.map(v => v.likeCount)),
      avgEngagementRate: meanEngagement,
      outlierCount: outliers.length,
    },
  })

  // Store video metrics
  for (let i = 0; i < videoData.length; i++) {
    const video = videoData[i]
    const outlier = outliers.find(o => o.youtubeVideoId === video.youtubeVideoId)

    await prisma.videoMetric.create({
      data: {
        snapshotId: snapshot.id,
        youtubeVideoId: video.youtubeVideoId,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        engagementRate: video.engagementRate,
        isOutlier: !!outlier,
        outlierType: outlier?.outlierType,
        outlierScore: outlier?.outlierScore,
        rankPosition: i + 1,
        percentile: (1 - (i / videoData.length)) * 100,
      },
    })
  }

  return {
    snapshotId: snapshot.id,
    totalVideos: videoData.length,
    avgViews: meanViews,
    avgLikes: calculateMean(videoData.map(v => v.likeCount)),
    avgEngagementRate: meanEngagement,
    outlierCount: outliers.length,
    outliers,
  }
}

/**
 * Store outlier video with analysis
 */
async function storeOutlierVideo(
  video: VideoData,
  outlierType: string,
  outlierScore: number,
  baselineViews: number,
  baselineEngagement: number,
  regionCode: string,
  categoryId?: string
) {
  // Analyze title
  const titleLength = video.title.length
  const titleEmojis = /[\u{1F300}-\u{1F9FF}]/u.test(video.title)
  const hasHowTo = /how to|how do i|tutorial|guide/i.test(video.title)
  const hasNumber = /\d/.test(video.title)

  // Detect thumbnail type (heuristic based on title patterns)
  let thumbnailType = 'unknown'
  if (titleEmojis) thumbnailType = 'text_heavy'
  else if (hasHowTo) thumbnailType = 'tutorial'
  else if (hasNumber) thumbnailType = 'listicle'

  const detectedReasons: string[] = []
  if (outlierScore > 3) detectedReasons.push('exceptional_performance')
  if (video.engagementRate > baselineEngagement * 1.5) detectedReasons.push('high_engagement')
  if (titleLength < 50) detectedReasons.push('concise_title')
  if (hasNumber) detectedReasons.push('numbered_title')

  await prisma.outlierVideo.upsert({
    where: { youtubeVideoId: video.youtubeVideoId },
    update: {
      outlierType,
      outlierScore,
      viewsVsBaseline: video.viewCount / baselineViews,
      engagementVsBaseline: video.engagementRate / baselineEngagement,
      detectedReasons,
      titleLength,
      titleEmojis,
      hasHowTo,
      hasNumber,
      thumbnailType,
      detectedAt: new Date(),
    },
    create: {
      youtubeVideoId: video.youtubeVideoId,
      outlierType,
      outlierScore,
      regionCode,
      categoryId: categoryId || null,
      viewsVsBaseline: video.viewCount / baselineViews,
      engagementVsBaseline: video.engagementRate / baselineEngagement,
      detectedReasons,
      titleLength,
      titleEmojis,
      hasHowTo,
      hasNumber,
      thumbnailType,
      keyFactors: {
        thumbnailUrl: video.thumbnailUrl,
        title: video.title,
        channelId: video.channelId,
      },
    },
  })
}

/**
 * Search and analyze a specific niche
 */
export async function collectNicheSnapshot(
  keyword: string,
  regionCode: string = 'IN',
  maxResults: number = 50
): Promise<TrendSnapshotResult> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    throw new Error('YouTube API key not configured')
  }

  // Search for videos in this niche
  const searchUrl = new URL('https://www.googleapis.com/youtube/v3/search')
  searchUrl.searchParams.set('part', 'snippet')
  searchUrl.searchParams.set('q', keyword)
  searchUrl.searchParams.set('type', 'video')
  searchUrl.searchParams.set('order', 'relevance')
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
    throw new Error('No videos found')
  }

  // Get detailed statistics
  const videosUrl = new URL('https://www.googleapis.com/youtube/v3/videos')
  videosUrl.searchParams.set('part', 'statistics,snippet,contentDetails')
  videosUrl.searchParams.set('id', videoIds)
  videosUrl.searchParams.set('key', apiKey)

  const videosResponse = await fetch(videosUrl.toString())
  const videosData = await videosResponse.json()
  const videos = videosData.items || []

  // Process video data (same as trending)
  const videoData: VideoData[] = videos.map((video: any) => {
    const stats = video.statistics
    const views = parseInt(stats.viewCount || '0')
    const likes = parseInt(stats.likeCount || '0')
    const comments = parseInt(stats.commentCount || '0')
    const engagement = views > 0 ? ((likes + comments) / views) * 100 : 0

    return {
      youtubeVideoId: video.id,
      viewCount: views,
      likeCount: likes,
      commentCount: comments,
      engagementRate: engagement,
      title: video.snippet.title,
      publishedAt: new Date(video.snippet.publishedAt),
      channelId: video.snippet.channelId,
      thumbnailUrl: video.snippet.thumbnails?.high?.url || video.snippet.thumbnails?.medium?.url || video.snippet.thumbnails?.default?.url,
    }
  })

  // Calculate and detect outliers (same logic as trending)
  const views = videoData.map(v => v.viewCount)
  const engagementRates = videoData.map(v => v.engagementRate)

  const meanViews = calculateMean(views)
  const stdDevViews = calculateStdDev(views, meanViews)
  const meanEngagement = calculateMean(engagementRates)
  const stdDevEngagement = calculateStdDev(engagementRates, meanEngagement)
  const percentile75 = calculatePercentile(views, 75)

  const outliers: Array<{
    youtubeVideoId: string
    outlierScore: number
    outlierType: string
    viewsVsBaseline: number
  }> = []

  videoData.forEach(video => {
    const viewZScore = calculateZScore(video.viewCount, meanViews, stdDevViews)
    const engagementZScore = calculateZScore(video.engagementRate, meanEngagement, stdDevEngagement)

    let isOutlier = false
    let outlierType = ''
    let outlierScore = 0

    if (viewZScore > 2) {
      isOutlier = true
      outlierType = 'viral'
      outlierScore = viewZScore
    }

    if (engagementZScore > 2) {
      isOutlier = true
      if (!outlierType) {
        outlierType = 'high_engagement'
        outlierScore = engagementZScore
      }
    }

    const daysSincePublish = (Date.now() - video.publishedAt.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSincePublish < 30 && video.viewCount >= percentile75) {
      isOutlier = true
      if (!outlierType) {
        outlierType = 'fast_growth'
        outlierScore = viewZScore
      }
    }

    if (isOutlier) {
      outliers.push({
        youtubeVideoId: video.youtubeVideoId,
        outlierScore: Math.abs(outlierScore),
        outlierType,
        viewsVsBaseline: video.viewCount / meanViews,
      })

      storeOutlierVideo(video, outlierType, Math.abs(outlierScore), meanViews, meanEngagement, regionCode)
    }
  })

  // Create trend snapshot
  const snapshot = await prisma.trendSnapshot.create({
    data: {
      regionCode,
      categoryId: null,
      snapshotType: 'niche_search',
      queryKeyword: keyword,
      totalVideos: videoData.length,
      avgViews: meanViews,
      avgLikes: calculateMean(videoData.map(v => v.likeCount)),
      avgEngagementRate: meanEngagement,
      outlierCount: outliers.length,
    },
  })

  // Store video metrics
  for (let i = 0; i < videoData.length; i++) {
    const video = videoData[i]
    const outlier = outliers.find(o => o.youtubeVideoId === video.youtubeVideoId)

    await prisma.videoMetric.create({
      data: {
        snapshotId: snapshot.id,
        youtubeVideoId: video.youtubeVideoId,
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
        engagementRate: video.engagementRate,
        isOutlier: !!outlier,
        outlierType: outlier?.outlierType,
        outlierScore: outlier?.outlierScore,
        rankPosition: i + 1,
        percentile: (1 - (i / videoData.length)) * 100,
      },
    })
  }

  return {
    snapshotId: snapshot.id,
    totalVideos: videoData.length,
    avgViews: meanViews,
    avgLikes: calculateMean(videoData.map(v => v.likeCount)),
    avgEngagementRate: meanEngagement,
    outlierCount: outliers.length,
    outliers,
  }
}

/**
 * Get video categories
 */
export async function getVideoCategories(regionCode: string = 'IN'): Promise<Array<{id: string, name: string}>> {
  const apiKey = process.env.YOUTUBE_API_KEY
  if (!apiKey || apiKey === 'your_youtube_api_key_here') {
    throw new Error('YouTube API key not configured')
  }

  const url = new URL('https://www.googleapis.com/youtube/v3/videoCategories')
  url.searchParams.set('part', 'snippet')
  url.searchParams.set('regionCode', regionCode)
  url.searchParams.set('key', apiKey)

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  const data = await response.json()
  return (data.items || []).map((item: any) => ({
    id: item.id,
    name: item.snippet.title,
  }))
}
