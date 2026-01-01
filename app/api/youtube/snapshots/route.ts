import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/youtube/snapshots
 * Get trend snapshots with analytics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const regionCode = searchParams.get('regionCode') || 'IN'
    const categoryId = searchParams.get('categoryId')
    const snapshotType = searchParams.get('type') || 'trending'
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      regionCode,
      snapshotType,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    const [snapshots, total] = await Promise.all([
      prisma.trendSnapshot.findMany({
        where,
        orderBy: { capturedAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          videoMetrics: {
            where: { isOutlier: true },
            take: 5,
          },
        },
      }),
      prisma.trendSnapshot.count({ where }),
    ])

    // Calculate time-series trends
    const trendData = await calculateTrendTrends(regionCode, categoryId, snapshotType)

    return NextResponse.json({ snapshots, total, limit, offset, trendData })
  } catch (error: any) {
    console.error('Snapshots API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch snapshots' },
      { status: 500 }
    )
  }
}

/**
 * Calculate trend data over time
 */
async function calculateTrendTrends(
  regionCode: string,
  categoryId: string | null,
  snapshotType: string
) {
  const snapshots = await prisma.trendSnapshot.findMany({
    where: {
      regionCode,
      ...(categoryId && { categoryId }),
      snapshotType,
    },
    orderBy: { capturedAt: 'asc' },
    take: 30, // Last 30 snapshots
  })

  return {
    avgViews: snapshots.map(s => ({ date: s.capturedAt, value: s.avgViews })),
    avgEngagement: snapshots.map(s => ({ date: s.capturedAt, value: s.avgEngagementRate })),
    outlierCount: snapshots.map(s => ({ date: s.capturedAt, value: s.outlierCount })),
  }
}
