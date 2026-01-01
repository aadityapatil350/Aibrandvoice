import { NextRequest, NextResponse } from 'next/server'
import { collectTrendingSnapshot, getVideoCategories, YOUTUBE_CATEGORIES } from '@/lib/youtube/trendCollector'

/**
 * GET /api/youtube/trends
 * Get trending videos or categories
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'snapshot'
    const regionCode = searchParams.get('regionCode') || 'IN'
    const category = searchParams.get('category')
    const maxResults = parseInt(searchParams.get('maxResults') || '50')

    if (action === 'categories') {
      // Get video categories
      const categories = await getVideoCategories(regionCode)
      return NextResponse.json({ categories })
    }

    if (action === 'snapshot') {
      // Collect trending snapshot
      const result = await collectTrendingSnapshot(
        regionCode,
        category || undefined,
        Math.min(maxResults, 50)
      )
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('Trends API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trends' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/youtube/trends
 * Trigger trend collection
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { regionCode = 'IN', category, maxResults = 50 } = body

    const result = await collectTrendingSnapshot(
      regionCode,
      category,
      Math.min(maxResults, 50)
    )

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error: any) {
    console.error('Trends Collection Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to collect trends' },
      { status: 500 }
    )
  }
}
