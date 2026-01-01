import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/youtube/topics
 * Get trending topics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const isViral = searchParams.get('viral') === 'true'
    const nicheId = searchParams.get('nicheId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {}

    if (category) {
      where.category = category
    }
    if (isViral) {
      where.isViral = true
    }
    if (nicheId) {
      where.nicheId = nicheId
    }

    const [topics, total] = await Promise.all([
      prisma.trendingTopic.findMany({
        where,
        orderBy: { growth: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.trendingTopic.count({ where }),
    ])

    return NextResponse.json({ topics, total, limit, offset })
  } catch (error: any) {
    console.error('Topics API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch topics' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/youtube/topics
 * Create a trending topic
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      topic,
      nicheId,
      volume,
      growth,
      category,
      isViral,
      isEvergreen,
      contentIdeas,
      targetDemographics,
    } = body

    if (!topic || !category) {
      return NextResponse.json(
        { error: 'topic and category are required' },
        { status: 400 }
      )
    }

    const trendingTopic = await prisma.trendingTopic.create({
      data: {
        topic,
        nicheId,
        volume,
        growth,
        category,
        isViral: isViral || false,
        isEvergreen: isEvergreen || false,
        contentIdeas,
        targetDemographics,
        sourceType: 'youtube_trending',
      },
    })

    return NextResponse.json({ trendingTopic })
  } catch (error: any) {
    console.error('Topic Creation Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create topic' },
      { status: 500 }
    )
  }
}
