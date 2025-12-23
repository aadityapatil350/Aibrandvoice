import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get user's SEO optimization history
 * 
 * GET /api/ai/seo/history
 * 
 * Query parameters:
 * - page?: number - Page number for pagination (default: 1)
 * - limit?: number - Items per page (default: 20, max: 100)
 * - platform?: string - Filter by platform (YOUTUBE, INSTAGRAM, TIKTOK, etc.)
 * - contentType?: string - Filter by content type (video, blog, social, etc.)
 * - dateFrom?: string - Filter by date range start (ISO date string)
 * - dateTo?: string - Filter by date range end (ISO date string)
 * - minScore?: number - Filter by minimum SEO score (0-100)
 * - maxScore?: number - Filter by maximum SEO score (0-100)
 * - sortBy?: string - Sort field (createdAt, seoScore, platform, contentType)
 * - sortOrder?: string - Sort order (asc, desc)
 * 
 * Response:
 * {
 *   success: true,
 *   optimizations: Array<{
 *     id: string,
 *     platform: string,
 *     contentType: string,
 *     originalTitle: string,
 *     optimizedTitle: string,
 *     seoScore: number,
 *     keywords: string[],
 *     characterCount: {
 *       original: { title: number, description: number },
 *       optimized: { title: number, description: number }
 *     },
 *     performance?: {
 *       views?: number,
 *       clicks?: number,
 *       engagement?: number,
 *       ctr?: number
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
 *     totalOptimizations: number,
 *     averageScore: number,
 *     topPlatform: string,
 *     topContentType: string,
 *     scoreDistribution: {
 *       excellent: number,  // 90-100
 *       good: number,       // 70-89
 *       average: number,     // 50-69
 *       poor: number         // 0-49
 *     }
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
    const validSortFields = ['createdAt', 'seoScore', 'platform', 'contentType', 'updatedAt']
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

    if (minScore || maxScore) {
      whereClause.seoScore = {}
      if (minScore) {
        whereClause.seoScore.gte = parseFloat(minScore)
      }
      if (maxScore) {
        whereClause.seoScore.lte = parseFloat(maxScore)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const total = await (prisma as any).seoOptimization.count({
      where: whereClause
    })

    // Get optimizations with pagination
    const optimizations = await (prisma as any).seoOptimization.findMany({
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
        performanceData: {
          take: 1,
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

    // Get latest performance metrics for each optimization
    const optimizationsWithPerformance = await Promise.all(
      optimizations.map(async (optimization: any) => {
        const latestPerformance = await (prisma as any).seoPerformance.findMany({
          where: {
            optimizationId: optimization.id
          },
          orderBy: {
            date: 'desc'
          },
          take: 10
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
          ...optimization,
          platform: optimization.platform.name,
          performance: Object.keys(flatPerformance).length > 0 ? flatPerformance : undefined
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
      optimizations: optimizationsWithPerformance,
      pagination,
      stats
    })

  } catch (error: any) {
    console.error('SEO history error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SEO history' },
      { status: 500 }
    )
  }
}

/**
 * Calculate statistics for user's SEO optimizations
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

  // Get total optimizations and average score
  const [totalOptimizations, avgScoreResult] = await Promise.all([
    (prisma as any).seoOptimization.count({ where: whereClause }),
    (prisma as any).seoOptimization.aggregate({
      where: whereClause,
      _avg: {
        seoScore: true
      }
    })
  ])

  // Get top platform
  const topPlatformResult = await (prisma as any).seoOptimization.groupBy({
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
  const topContentTypeResult = await (prisma as any).seoOptimization.groupBy({
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

  // Get score distribution
  const scoreDistribution = await (prisma as any).seoOptimization.groupBy({
    by: [],
    where: whereClause,
    _count: {
      id: true
    }
  })

  // Calculate score distribution ranges
  const allOptimizations = await (prisma as any).seoOptimization.findMany({
    where: whereClause,
    select: {
      seoScore: true
    }
  })

  const distribution = {
    excellent: 0,  // 90-100
    good: 0,       // 70-89
    average: 0,     // 50-69
    poor: 0         // 0-49
  }

  allOptimizations.forEach((opt: any) => {
    const score = opt.seoScore || 0
    if (score >= 90) distribution.excellent++
    else if (score >= 70) distribution.good++
    else if (score >= 50) distribution.average++
    else distribution.poor++
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
    totalOptimizations,
    averageScore: Math.round((avgScoreResult._avg.seoScore || 0) * 100) / 100,
    topPlatform,
    topContentType: topContentTypeResult[0]?.contentType || 'N/A',
    scoreDistribution: distribution
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */