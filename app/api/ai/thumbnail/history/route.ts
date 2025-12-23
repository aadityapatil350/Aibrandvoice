import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get user's thumbnail generation history
 * 
 * GET /api/ai/thumbnail/history
 * 
 * Query Parameters:
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 20)
 * - platform: Filter by platform (optional)
 * - status: Filter by status (optional)
 * - dateFrom: Filter by date range start (optional, ISO string)
 * - dateTo: Filter by date range end (optional, ISO string)
 * - search: Search in title/description (optional)
 * 
 * Response:
 * {
 *   success: true,
 *   history: [
 *     {
 *       id: string,
 *       title: string,
 *       description: string,
 *       platform: object,
 *       status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
 *       thumbnailUrl?: string,
 *       imageUrl?: string,
 *       dimensions: object,
 *       createdAt: string,
 *       updatedAt: string,
 *       metadata?: object
 *     }
 *   ],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   },
 *   stats: {
 *     total: number,
 *     completed: number,
 *     pending: number,
 *     processing: number,
 *     failed: number
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
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const platform = searchParams.get('platform')?.toUpperCase()
    const status = searchParams.get('status')?.toUpperCase()
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      userId: user.id
    }

    // Platform filter
    if (platform) {
      const validPlatforms = ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'BLOG', 'GENERIC']
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json(
          { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
          { status: 400 }
        )
      }
      where.platform = {
        name: platform,
        isActive: true
      }
    } else {
      where.platform = {
        isActive: true
      }
    }

    // Status filter
    if (status) {
      const validStatuses = ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
          { status: 400 }
        )
      }
      where.status = status
    }

    // Date range filter
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) {
        const fromDate = new Date(dateFrom)
        if (isNaN(fromDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid dateFrom format. Use ISO date string.' },
            { status: 400 }
          )
        }
        where.createdAt.gte = fromDate
      }
      if (dateTo) {
        const toDate = new Date(dateTo)
        if (isNaN(toDate.getTime())) {
          return NextResponse.json(
            { error: 'Invalid dateTo format. Use ISO date string.' },
            { status: 400 }
          )
        }
        where.createdAt.lte = toDate
      }
    }

    // Search filter
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count for pagination
    const total = await prisma.thumbnailGeneration.count({ where })

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Fetch history
    const history = await prisma.thumbnailGeneration.findMany({
      where,
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    // Get stats
    const stats = await prisma.thumbnailGeneration.groupBy({
      by: ['status'],
      where: {
        userId: user.id,
        ...(dateFrom && { createdAt: { gte: new Date(dateFrom) } }),
        ...(dateTo && { createdAt: { lte: new Date(dateTo) } })
      },
      _count: {
        status: true
      }
    })

    // Format stats
    const formattedStats = {
      total,
      completed: 0,
      pending: 0,
      processing: 0,
      failed: 0
    }

    stats.forEach(stat => {
      formattedStats[stat.status.toLowerCase() as keyof typeof formattedStats] = stat._count.status
    })

    return NextResponse.json({
      success: true,
      history: history.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        platform: item.platform,
        template: item.template,
        status: item.status,
        thumbnailUrl: item.thumbnailUrl,
        imageUrl: item.imageUrl,
        dimensions: item.dimensions,
        overlays: item.overlays,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        metadata: item.metadata
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats: formattedStats
    })

  } catch (error: any) {
    console.error('Thumbnail history error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch thumbnail history' },
      { status: 500 }
    )
  }
}