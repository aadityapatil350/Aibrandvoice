import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/youtube/outliers
 * Get detected outlier videos
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const outlierType = searchParams.get('type')
    const regionCode = searchParams.get('regionCode') || 'IN'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      regionCode,
      isFalsePositive: false,
    }

    if (outlierType) {
      where.outlierType = outlierType
    }

    const [outliers, total] = await Promise.all([
      prisma.outlierVideo.findMany({
        where,
        orderBy: { detectedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.outlierVideo.count({ where }),
    ])

    return NextResponse.json({ outliers, total, limit, offset })
  } catch (error: any) {
    console.error('Outliers API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch outliers' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/youtube/outliers
 * Verify or mark an outlier
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { youtubeVideoId, isVerified, isFalsePositive } = body

    if (!youtubeVideoId) {
      return NextResponse.json(
        { error: 'youtubeVideoId is required' },
        { status: 400 }
      )
    }

    const outlier = await prisma.outlierVideo.update({
      where: { youtubeVideoId },
      data: {
        ...(isVerified !== undefined && { isVerified }),
        ...(isFalsePositive !== undefined && { isFalsePositive }),
        ...(isVerified && { verifiedAt: new Date() }),
      },
    })

    return NextResponse.json({ outlier })
  } catch (error: any) {
    console.error('Outlier Update Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update outlier' },
      { status: 500 }
    )
  }
}
