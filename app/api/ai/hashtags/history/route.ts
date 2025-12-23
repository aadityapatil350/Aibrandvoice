import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get user's hashtag generation history
 * 
 * GET /api/ai/hashtags/history
 * 
 * Query parameters:
 * - page?: number - Page number for pagination (default: 1)
 * - limit?: number - Items per page (default: 20, max: 100)
 * - platform?: string - Filter by platform (YOUTUBE, INSTAGRAM, TIKTOK, etc.)
 * - contentType?: string - Filter by content type (video, image, text, etc.)
 * - dateFrom?: string - Filter by date range start (ISO date string)
 * - dateTo?: string - Filter by date range end (ISO date string)
 * - minScore?: number - Filter by minimum score (0-100)
 * - maxScore?: number - Filter by maximum score (0-100)
 * - sortBy?: string - Sort field (createdAt, totalScore, platform, contentType)
 * - sortOrder?: string - Sort order (asc, desc)
 * 
 * Response:
 * {
 *   success: true,
 *   hashtagSets: Array<{
 *     id: string,
 *     platform: string,
 *     contentType: string,
 *     content: string,
 *     hashtags: string[],
 *     hashtagCount: number,
 *     categories: Record<string, string[]>,
 *     trending: string[],
 *     niche: string[],
 *     totalScore: number,
 *     performance?: {
 *       reach?: number,
 *       engagement?: number,
 *       clicks?: number,
 *       shares?: number,
 *       saves?: number
 *     },
 *     createdAt: string,
 *     updatedAt: string
 *   }>,
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number,
 *     hasNext: boolean,
 *     hasPrev: boolean
 *   },
 *   stats: {
 *     totalSets: number,
 *     averageScore: number,
 *     topPlatform: string,
 *     topContentType: string,
 *     scoreDistribution: {
 *       excellent: number,  // 90-100
 *       good: number,       // 70-89
 *       average: number,     // 50-69
 *       poor: number         // 0-49
 *     },
 *     categoryUsage: Record<string, number>,
 *     totalHashtags: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const platform = searchParams.get('platform')
    const contentType = searchParams.get('contentType')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const minScore = searchParams.get('minScore')
    const maxScore = searchParams.get('maxScore')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    // Validate sort field
    const validSortFields = ['createdAt', 'totalScore', 'platform', 'contentType', 'updatedAt']
    if (!validSortFields.includes(sortBy)) {
      return NextResponse.json(
        { error: `Invalid sort field. Must be one of: ${validSortFields.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate sort order
    if (!['asc', 'desc'].includes(sortOrder)) {
      return NextResponse.json(
        { error: 'Invalid sort order. Must be either "asc" or "desc"' },
        { status: 400 }
      )
    }

    // Build where clause
    const whereClause: any = {
      userId: user.id
    }

    if (platform) {
      const platformRecord = await (prisma as any).platform.findFirst({
        where: {
          name: platform.toUpperCase(),
          isActive: true
        }
      })
      if (platformRecord) {
        whereClause.platformId = platformRecord.id
      } else {
        return NextResponse.json(
          { error: 'Platform not found or inactive' },
          { status: 404 }
        )
      }
    }

    if (contentType) {
      whereClause.contentType = contentType
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {}
      if (dateFrom) {
        whereClause.createdAt.gte = new Date(dateFrom)
      }
      if (dateTo) {
        whereClause.createdAt.lte = new Date(dateTo)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await (prisma as any).hashtagSet.count({
      where: whereClause
    })

    // Get hashtag sets with pagination
    const hashtagSets = await (prisma as any).hashtagSet.findMany({
      where: whereClause,
      include: {
        platform: {
          select: {
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        },
        hashtagData: {
          select: {
            hashtag: true,
            category: true,
            usage: true,
            growth: true,
            isTrending: true
          }
        },
        performanceData: {
          take: 5,
          orderBy: {
            date: 'desc'
          }
        }
      },
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit
    })

    // Filter by score if specified (client-side filtering since score is in performance field)
    let filteredHashtagSets = hashtagSets
    if (minScore || maxScore) {
      filteredHashtagSets = hashtagSets.filter((set: any) => {
        const score = set.performance?.initialScore || 0
        if (minScore && score < parseFloat(minScore)) return false
        if (maxScore && score > parseFloat(maxScore)) return false
        return true
      })
      
      // Recalculate pagination after filtering
      const filteredTotal = filteredHashtagSets.length
      const startIndex = skip
      const endIndex = Math.min(startIndex + limit, filteredTotal)
      filteredHashtagSets = filteredHashtagSets.slice(startIndex, endIndex)
    }

    // Get latest performance metrics for each hashtag set
    const hashtagSetsWithPerformance = await Promise.all(
      filteredHashtagSets.map(async (hashtagSet: any) => {
        const latestPerformance = await (prisma as any).hashtagPerformance.findMany({
          where: {
            setId: hashtagSet.id
          },
          orderBy: {
            date: 'desc'
          },
          take: 20
        })

        // Aggregate performance metrics
        const performance: any = {}
        latestPerformance.forEach((metric: any) => {
          if (!performance[metric.metric] || metric.date > performance[metric.metric].date) {
            performance[metric.metric] = {
              value: metric.value,
              date: metric.date
            }
          }
        })

        // Flatten performance object
        const flatPerformance: any = {}
        Object.keys(performance).forEach(key => {
          flatPerformance[key] = performance[key].value
        })

        return {
          id: hashtagSet.id,
          platform: hashtagSet.platform.name,
          contentType: hashtagSet.contentType,
          content: hashtagSet.content,
          hashtags: hashtagSet.hashtags,
          hashtagCount: hashtagSet.hashtags.length,
          categories: hashtagSet.categories,
          trending: hashtagSet.trending,
          niche: hashtagSet.niche,
          totalScore: hashtagSet.performance?.initialScore || 0,
          performance: Object.keys(flatPerformance).length > 0 ? flatPerformance : undefined,
          createdAt: hashtagSet.createdAt,
          updatedAt: hashtagSet.updatedAt
        }
      })
    )

    // Calculate statistics
    const stats = await calculateStats(user.id, platform || undefined, contentType || undefined, dateFrom || undefined, dateTo || undefined)

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit)
    const pagination = {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({
      success: true,
      hashtagSets: hashtagSetsWithPerformance,
      pagination,
      stats
    })

  } catch (error: any) {
    console.error('Hashtag history error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hashtag history' },
      { status: 500 }
    )
  }
}

/**
 * Calculate statistics for user's hashtag sets
 */
async function calculateStats(
  userId: string,
  platform?: string,
  contentType?: string,
  dateFrom?: string,
  dateTo?: string
) {
  // Build where clause for stats
  const whereClause: any = { userId }

  if (platform) {
    const platformRecord = await (prisma as any).platform.findFirst({
      where: {
        name: platform.toUpperCase(),
        isActive: true
      }
    })
    if (platformRecord) {
      whereClause.platformId = platformRecord.id
    }
  }

  if (contentType) {
    whereClause.contentType = contentType
  }

  if (dateFrom || dateTo) {
    whereClause.createdAt = {}
    if (dateFrom) {
      whereClause.createdAt.gte = new Date(dateFrom)
    }
    if (dateTo) {
      whereClause.createdAt.lte = new Date(dateTo)
    }
  }

  // Get total sets and average score
  const [totalSets, avgScoreResult] = await Promise.all([
    (prisma as any).hashtagSet.count({ where: whereClause }),
    (prisma as any).hashtagSet.aggregate({
      where: whereClause,
      _avg: {
        // We'll calculate average score from performance data
      }
    })
  ])

  // Get all hashtag sets for detailed analysis
  const allSets = await (prisma as any).hashtagSet.findMany({
    where: whereClause,
    include: {
      platform: true,
      hashtagData: true
    }
  })

  // Calculate average score from performance data
  let totalScore = 0
  let scoreCount = 0
  const scores: number[] = []

  allSets.forEach((set: any) => {
    const score = set.performance?.initialScore || 0
    if (score > 0) {
      totalScore += score
      scoreCount++
      scores.push(score)
    }
  })

  const averageScore = scoreCount > 0 ? Math.round((totalScore / scoreCount) * 100) / 100 : 0

  // Get top platform
  const topPlatformResult = await (prisma as any).hashtagSet.groupBy({
    by: ['platformId'],
    where: whereClause,
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 1
  })

  // Get top content type
  const topContentTypeResult = await (prisma as any).hashtagSet.groupBy({
    by: ['contentType'],
    where: whereClause,
    _count: {
      id: true
    },
    orderBy: {
      _count: {
        id: 'desc'
      }
    },
    take: 1
  })

  // Calculate score distribution
  const distribution = {
    excellent: 0,  // 90-100
    good: 0,       // 70-89
    average: 0,     // 50-69
    poor: 0         // 0-49
  }

  scores.forEach(score => {
    if (score >= 90) distribution.excellent++
    else if (score >= 70) distribution.good++
    else if (score >= 50) distribution.average++
    else distribution.poor++
  })

  // Calculate category usage
  const categoryUsage: Record<string, number> = {}
  let totalHashtags = 0

  allSets.forEach((set: any) => {
    totalHashtags += set.hashtags.length
    
    // Count categories from hashtag data
    set.hashtagData.forEach((hashtag: any) => {
      if (hashtag.category) {
        categoryUsage[hashtag.category] = (categoryUsage[hashtag.category] || 0) + 1
      }
    })

    // Also count from categories object if available
    if (set.categories && typeof set.categories === 'object') {
      Object.keys(set.categories).forEach(category => {
        if (Array.isArray(set.categories[category])) {
          categoryUsage[category] = (categoryUsage[category] || 0) + set.categories[category].length
        }
      })
    }
  })

  // Get platform name for top platform
  let topPlatform = 'N/A'
  if (topPlatformResult.length > 0) {
    const platformRecord = await (prisma as any).platform.findUnique({
      where: { id: topPlatformResult[0].platformId },
      select: { name: true }
    })
    topPlatform = platformRecord?.name || 'N/A'
  }

  return {
    totalSets,
    averageScore,
    topPlatform,
    topContentType: topContentTypeResult[0]?.contentType || 'N/A',
    scoreDistribution: distribution,
    categoryUsage,
    totalHashtags
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */