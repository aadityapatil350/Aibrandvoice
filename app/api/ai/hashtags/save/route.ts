import { NextRequest, NextResponse } from 'next/server'
import { analyzeHashtagSet, calculateHashtagRelevanceScore, categorizeHashtag } from '@/lib/ai/hashtag-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Save hashtag set with performance tracking
 * 
 * POST /api/ai/hashtags/save
 * 
 * Request body:
 * {
 *   platform: string,              // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, FACEBOOK
 *   contentType: string,           // video, image, text, etc.
 *   content: string,               // Content description
 *   hashtags: string[],             // Array of hashtags to save
 *   categories?: Record<string, string[]>,  // Categorized hashtags (optional)
 *   trending?: string[],            // Trending hashtags (optional)
 *   niche?: string[],               // Niche hashtags (optional)
 *   performanceMetrics?: {         // Initial performance metrics (optional)
 *     reach?: number,
 *     engagement?: number,
 *     clicks?: number,
 *     shares?: number,
 *     saves?: number
 *   },
 *   notes?: string                 // User notes about the hashtag set
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   hashtagSet: {
 *     id: string,
 *     platform: string,
 *     contentType: string,
 *     hashtagCount: number,
 *     totalScore: number,
 *     createdAt: string
 *   },
 *   analysis: {
 *     categoryDistribution: Record<string, number>,
 *     trendingCount: number,
 *     nicheCount: number,
 *     broadCount: number,
 *     recommendations: string[]
 *   },
 *   hashtags: {
 *     saved: number,
 *     updated: number
 *   }
 * }
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const {
      platform,
      contentType,
      content,
      hashtags,
      categories,
      trending,
      niche,
      performanceMetrics,
      notes
    } = body

    // Validate required fields
    if (!platform || !contentType || !content || !hashtags || !Array.isArray(hashtags)) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, contentType, content, hashtags (array)' },
        { status: 400 }
      )
    }

    // Validate platform enum
    const validPlatforms = ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'FACEBOOK', 'GENERIC']
    if (!validPlatforms.includes(platform.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
        { status: 400 }
      )
    }

    // Get platform from database
    const platformRecord = await (prisma as any).platform.findFirst({
      where: {
        name: platform.toUpperCase(),
        isActive: true
      }
    })

    if (!platformRecord) {
      return NextResponse.json(
        { error: 'Platform not found or inactive' },
        { status: 404 }
      )
    }

    // Analyze hashtag set
    const analysis = analyzeHashtagSet(
      hashtags,
      content,
      platform.toLowerCase()
    )

    // Create hashtag set record
    const hashtagSet = await (prisma as any).hashtagSet.create({
      data: {
        userId: user.id,
        platformId: platformRecord.id,
        contentType,
        content,
        hashtags,
        categories: categories || {},
        trending: trending || [],
        niche: niche || [],
        performance: {
          initialScore: analysis.totalScore,
          categoryDistribution: analysis.categoryDistribution,
          recommendations: analysis.recommendations,
          issues: analysis.issues,
          ...performanceMetrics
        },
        notes
      }
    })

    // Save individual hashtags with their metadata
    let savedHashtags = 0
    let updatedHashtags = 0

    for (const hashtag of hashtags) {
      try {
        const normalizedHashtag = hashtag.toLowerCase().replace('#', '')
        const relevanceScore = calculateHashtagRelevanceScore(
          hashtag,
          content,
          platform.toLowerCase()
        )
        const category = categorizeHashtag(hashtag, platform.toLowerCase())

        // Check if hashtag already exists for this platform
        const existingHashtag = await (prisma as any).hashtag.findFirst({
          where: {
            hashtag: normalizedHashtag,
            platformId: platformRecord.id
          }
        })

        if (existingHashtag) {
          // Update existing hashtag
          await (prisma as any).hashtag.update({
            where: { id: existingHashtag.id },
            data: {
              setId: hashtagSet.id,
              category,
              usage: (existingHashtag.usage || 0) + 1,
              growth: existingHashtag.growth || 0,
              isTrending: trending?.includes(hashtag) || existingHashtag.isTrending,
              lastUpdated: new Date()
            }
          })
          updatedHashtags++
        } else {
          // Create new hashtag
          await (prisma as any).hashtag.create({
            data: {
              hashtag: normalizedHashtag,
              setId: hashtagSet.id,
              platformId: platformRecord.id,
              category,
              usage: 1,
              growth: 0,
              isTrending: trending?.includes(hashtag) || false,
              lastUpdated: new Date()
            }
          })
          savedHashtags++
        }

        // Create performance record for this hashtag
        await (prisma as any).hashtagPerformance.create({
          data: {
            hashtagId: existingHashtag?.id || normalizedHashtag, // Will be updated after creation
            setId: hashtagSet.id,
            metric: 'relevance_score',
            value: relevanceScore,
            platform: platform.toLowerCase(),
            date: new Date(),
            metadata: {
              category,
              content: content.substring(0, 200) // First 200 chars for reference
            }
          }
        })

      } catch (error) {
        console.error('Error saving hashtag:', hashtag, error)
      }
    }

    // Store initial performance metrics if provided
    if (performanceMetrics) {
      for (const [metric, value] of Object.entries(performanceMetrics)) {
        if (typeof value === 'number') {
          try {
            await (prisma as any).hashtagPerformance.create({
              data: {
                hashtagId: '', // Set-level performance
                setId: hashtagSet.id,
                metric,
                value,
                platform: platform.toLowerCase(),
                date: new Date(),
                metadata: {
                  source: 'initial_metrics'
                }
              }
            })
          } catch (error) {
            console.error('Error saving performance metric:', metric, error)
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      hashtagSet: {
        id: hashtagSet.id,
        platform: platform.toUpperCase(),
        contentType,
        hashtagCount: hashtags.length,
        totalScore: analysis.totalScore,
        createdAt: hashtagSet.createdAt
      },
      analysis: {
        categoryDistribution: analysis.categoryDistribution,
        trendingCount: analysis.trendingCount,
        nicheCount: analysis.nicheCount,
        broadCount: analysis.broadCount,
        recommendations: analysis.recommendations
      },
      hashtags: {
        saved: savedHashtags,
        updated: updatedHashtags
      }
    })

  } catch (error: any) {
    console.error('Hashtag save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save hashtag set' },
      { status: 500 }
    )
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */