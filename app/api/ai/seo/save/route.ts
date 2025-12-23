import { NextRequest, NextResponse } from 'next/server'
import { generateSeoAnalysis } from '@/lib/ai/seo-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Save SEO optimization results
 * 
 * POST /api/ai/seo/save
 * 
 * Request body:
 * {
 *   platform: string,           // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, BLOG
 *   contentType: string,        // video, blog, social, etc.
 *   originalTitle: string,      // Original title before optimization
 *   originalDescription?: string, // Original description before optimization
 *   optimizedTitle: string,      // Optimized title
 *   optimizedDescription: string, // Optimized description
 *   keywords: string[],          // Target keywords used
 *   variations?: {               // A/B test variations (optional)
 *     titles?: Array<{ text: string, score: number, reason: string }>,
 *     descriptions?: Array<{ text: string, score: number, reason: string }>
 *   },
 *   performanceMetrics?: {       // Initial performance metrics (optional)
 *     views?: number,
 *     clicks?: number,
 *     engagement?: number,
 *     ctr?: number
 *   },
 *   notes?: string              // User notes about the optimization
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   optimization: {
 *     id: string,
 *     platform: string,
 *     contentType: string,
 *     originalTitle: string,
 *     optimizedTitle: string,
 *     seoScore: number,
 *     createdAt: string
 *   },
 *   keywords: {
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
      originalTitle,
      originalDescription,
      optimizedTitle,
      optimizedDescription,
      keywords,
      variations,
      performanceMetrics,
      notes
    } = body

    // Validate required fields
    if (!platform || !contentType || !originalTitle || !optimizedTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, contentType, originalTitle, optimizedTitle' },
        { status: 400 }
      )
    }

    // Validate platform enum
    const validPlatforms = ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'BLOG', 'GENERIC']
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

    // Generate SEO analysis for optimized content
    const seoAnalysis = generateSeoAnalysis(
      optimizedTitle,
      optimizedDescription || '',
      platform.toLowerCase(),
      keywords || []
    )

    // Create SEO optimization record
    const optimization = await (prisma as any).seoOptimization.create({
      data: {
        userId: user.id,
        platformId: platformRecord.id,
        contentType,
        originalTitle,
        originalDesc: originalDescription,
        optimizedTitle,
        optimizedDesc: optimizedDescription,
        keywords: keywords || [],
        seoScore: seoAnalysis.breakdown.overallScore,
        characterCount: {
          original: {
            title: originalTitle.length,
            description: originalDescription?.length || 0
          },
          optimized: {
            title: optimizedTitle.length,
            description: optimizedDescription?.length || 0
          }
        },
        variations: variations || {},
        performance: {
          ...performanceMetrics,
          analysis: seoAnalysis.breakdown,
          recommendations: seoAnalysis.recommendations,
          issues: seoAnalysis.issues
        },
        notes
      }
    })

    // Save or update keywords in database
    let savedKeywords = 0
    let updatedKeywords = 0

    if (keywords && keywords.length > 0) {
      for (const keyword of keywords) {
        try {
          const existingKeyword = await (prisma as any).seoKeyword.findFirst({
            where: {
              keyword: keyword.toLowerCase(),
              platformId: platformRecord.id
            }
          })

          if (existingKeyword) {
            await (prisma as any).seoKeyword.update({
              where: { id: existingKeyword.id },
              data: {
                optimizationId: optimization.id,
                lastUpdated: new Date()
              }
            })
            updatedKeywords++
          } else {
            await (prisma as any).seoKeyword.create({
              data: {
                keyword: keyword.toLowerCase(),
                platformId: platformRecord.id,
                optimizationId: optimization.id,
                competition: 'medium', // Default value
                volume: 0, // Default value
                difficulty: 5, // Default value
                trend: 'stable' // Default value
              }
            })
            savedKeywords++
          }
        } catch (error) {
          console.error('Error saving keyword:', keyword, error)
        }
      }
    }

    // Store initial performance metrics if provided
    if (performanceMetrics) {
      for (const [metric, value] of Object.entries(performanceMetrics)) {
        if (typeof value === 'number') {
          try {
            await (prisma as any).seoPerformance.create({
              data: {
                optimizationId: optimization.id,
                metric,
                value,
                platform: platform.toLowerCase(),
                date: new Date()
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
      optimization: {
        id: optimization.id,
        platform: platform.toUpperCase(),
        contentType,
        originalTitle,
        optimizedTitle,
        seoScore: seoAnalysis.breakdown.overallScore,
        createdAt: optimization.createdAt
      },
      keywords: {
        saved: savedKeywords,
        updated: updatedKeywords
      }
    })

  } catch (error: any) {
    console.error('SEO save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save SEO optimization' },
      { status: 500 }
    )
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */