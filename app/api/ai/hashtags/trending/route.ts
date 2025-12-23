import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateTrendingHashtagsPrompt } from '@/lib/ai/prompts'
import { getTrendingHashtags, categorizeHashtag } from '@/lib/ai/hashtag-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get trending hashtags for a platform
 * 
 * GET /api/ai/hashtags/trending
 * 
 * Query parameters:
 * - platform: string           // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, FACEBOOK
 * - category?: string          // Category filter (e.g., 'technology', 'fashion', 'food')
 * - timeRange?: string         // Time range for trends (e.g., 'last 7 days', 'last 24 hours')
 * - language?: string          // Language (default: 'en')
 * - limit?: number             // Number of results to return (default: 20, max: 50)
 * 
 * Response:
 * {
 *   success: true,
 *   trendingOverview: {
 *     totalTrendingHashtags: number,
 *     growthTrend: string,
 *     topCategories: string[],
 *     engagementLevel: string
 *   },
 *   trendingHashtags: Array<{
 *     hashtag: string,
 *     category: string,
 *     usage: number,
 *     growth: number,
 *     engagement: number,
 *     posts: number,
 *     reach: number,
 *     prediction: string,
 *     bestFor: string
 *   }>,
 *   categoryBreakdown: Record<string, {
 *     count: number,
 *     avgGrowth: number,
 *     avgEngagement: number
 *   }>,
 *   growthPredictions: {
 *     rising: string[],
 *     stable: string[],
 *     declining: string[]
 *   },
 *   usageRecommendations: {
 *     bestTime: string,
 *     combinationStrategy: string,
 *     bestContentTypes: string[]
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
    const platform = searchParams.get('platform')
    const category = searchParams.get('category')
    const timeRange = searchParams.get('timeRange') || 'last 7 days'
    const language = searchParams.get('language') || 'en'
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    // Validate required fields
    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required parameter: platform' },
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

    // Get base trending hashtags from utility function
    const baseTrending = getTrendingHashtags(platform.toLowerCase(), category || undefined)

    // Generate AI-powered trending analysis
    const promptParams = {
      platform: platform.toLowerCase(),
      category: category || undefined,
      timeRange,
      language
    }

    const aiPrompt = generateTrendingHashtagsPrompt(promptParams)
    const aiResponse = await generateWithDeepSeek(aiPrompt)

    // Parse AI response
    const parsedResponse = parseTrendingHashtagsResponse(aiResponse)

    // Combine base data with AI analysis
    const enhancedTrendingHashtags = baseTrending.slice(0, limit).map((hashtag, index) => {
      // Try to find matching AI data
      const aiHashtag = parsedResponse.trendingHashtags.find(ai => 
        ai.hashtag.toLowerCase() === hashtag.hashtag.toLowerCase()
      )

      return {
        hashtag: hashtag.hashtag,
        category: aiHashtag?.category || hashtag.category,
        usage: hashtag.usage,
        growth: hashtag.growth,
        engagement: hashtag.engagement,
        posts: hashtag.posts,
        reach: hashtag.reach,
        prediction: aiHashtag?.prediction || 'stable',
        bestFor: aiHashtag?.bestFor || 'general content'
      }
    })

    // If AI provided more hashtags, include them as well
    if (parsedResponse.trendingHashtags.length > enhancedTrendingHashtags.length) {
      const additionalHashtags = parsedResponse.trendingHashtags
        .slice(0, limit - enhancedTrendingHashtags.length)
        .filter(ai => !enhancedTrendingHashtags.some(base => 
          base.hashtag.toLowerCase() === ai.hashtag.toLowerCase()
        ))
        .map(ai => ({
          hashtag: ai.hashtag,
          category: ai.category,
          usage: Math.floor(Math.random() * 1000000) + 100000, // Mock usage data
          growth: parseFloat(ai.growth) || 5.0,
          engagement: parseFloat(ai.engagement) || 5.0,
          posts: Math.floor(Math.random() * 100000) + 10000, // Mock posts data
          reach: Math.floor(Math.random() * 10000000) + 1000000, // Mock reach data
          prediction: ai.prediction || 'stable',
          bestFor: ai.bestFor || 'general content'
        }))

      enhancedTrendingHashtags.push(...additionalHashtags)
    }

    // Calculate category breakdown
    const categoryBreakdown: Record<string, { count: number; avgGrowth: number; avgEngagement: number }> = {}
    
    enhancedTrendingHashtags.forEach(hashtag => {
      if (!categoryBreakdown[hashtag.category]) {
        categoryBreakdown[hashtag.category] = {
          count: 0,
          avgGrowth: 0,
          avgEngagement: 0
        }
      }
      
      const category = categoryBreakdown[hashtag.category]
      category.count++
      category.avgGrowth += hashtag.growth
      category.avgEngagement += hashtag.engagement
    })

    // Calculate averages
    Object.keys(categoryBreakdown).forEach(cat => {
      const category = categoryBreakdown[cat]
      category.avgGrowth = Math.round((category.avgGrowth / category.count) * 10) / 10
      category.avgEngagement = Math.round((category.avgEngagement / category.count) * 10) / 10
    })

    // Sort hashtags by engagement and growth
    enhancedTrendingHashtags.sort((a, b) => {
      const scoreA = a.engagement * a.growth
      const scoreB = b.engagement * b.growth
      return scoreB - scoreA
    })

    return NextResponse.json({
      success: true,
      trendingOverview: parsedResponse.trendingOverview,
      trendingHashtags: enhancedTrendingHashtags.slice(0, limit),
      categoryBreakdown,
      growthPredictions: parsedResponse.growthPredictions,
      usageRecommendations: parsedResponse.usageRecommendations
    })

  } catch (error: any) {
    console.error('Trending hashtags error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch trending hashtags' },
      { status: 500 }
    )
  }
}

/**
 * Parse AI response for trending hashtags
 */
function parseTrendingHashtagsResponse(aiResponse: string) {
  try {
    // Default structure in case parsing fails
    const defaultResponse = {
      trendingOverview: {
        totalTrendingHashtags: 0,
        growthTrend: 'stable',
        topCategories: [],
        engagementLevel: 'medium'
      },
      trendingHashtags: [],
      categoryBreakdown: {},
      growthPredictions: {
        rising: [],
        stable: [],
        declining: []
      },
      usageRecommendations: {
        bestTime: 'Unknown',
        combinationStrategy: 'Unknown',
        bestContentTypes: []
      }
    }

    if (!aiResponse) return defaultResponse

    // Extract trending overview
    const overviewMatches = aiResponse.match(/\[TRENDING_OVERVIEW\]([\s\S]*?)\[TRENDING_HASHTAGS\]/)
    const trendingOverview = overviewMatches ? parseTrendingOverview(overviewMatches[1]) : defaultResponse.trendingOverview

    // Extract trending hashtags
    const hashtagsMatches = aiResponse.match(/\[TRENDING_HASHTAGS\]([\s\S]*?)\[CATEGORY_BREAKDOWN\]/)
    const trendingHashtags = hashtagsMatches ? parseTrendingHashtags(hashtagsMatches[1]) : []

    // Extract growth predictions
    const growthMatches = aiResponse.match(/\[GROWTH_PREDICTIONS\]([\s\S]*?)\[USAGE_RECOMMENDATIONS\]/)
    const growthPredictions = growthMatches ? parseGrowthPredictions(growthMatches[1]) : defaultResponse.growthPredictions

    // Extract usage recommendations
    const usageMatches = aiResponse.match(/\[USAGE_RECOMMENDATIONS\]([\s\S]*?)---/)
    const usageRecommendations = usageMatches ? parseUsageRecommendations(usageMatches[1]) : defaultResponse.usageRecommendations

    return {
      trendingOverview,
      trendingHashtags,
      categoryBreakdown: {}, // Will be calculated from hashtags
      growthPredictions,
      usageRecommendations
    }
  } catch (error) {
    console.error('Error parsing trending hashtags response:', error)
    return {
      trendingOverview: {
        totalTrendingHashtags: 0,
        growthTrend: 'stable',
        topCategories: [],
        engagementLevel: 'medium'
      },
      trendingHashtags: [],
      categoryBreakdown: {},
      growthPredictions: {
        rising: [],
        stable: [],
        declining: []
      },
      usageRecommendations: {
        bestTime: 'Unknown',
        combinationStrategy: 'Unknown',
        bestContentTypes: []
      }
    }
  }
}

/**
 * Parse trending overview from AI response
 */
function parseTrendingOverview(content: string) {
  const overview: any = {
    totalTrendingHashtags: 0,
    growthTrend: 'stable',
    topCategories: [],
    engagementLevel: 'medium'
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Total trending hashtags identified:')) {
      overview.totalTrendingHashtags = parseInt(trimmedLine.replace('Total trending hashtags identified:', '').trim()) || 0
    } else if (trimmedLine.startsWith('Growth trend:')) {
      overview.growthTrend = trimmedLine.replace('Growth trend:', '').trim()
    } else if (trimmedLine.startsWith('Top categories:')) {
      const categories = trimmedLine.replace('Top categories:', '').trim()
      overview.topCategories = categories.split(',').map(c => c.trim()).filter(c => c)
    } else if (trimmedLine.startsWith('Engagement level:')) {
      overview.engagementLevel = trimmedLine.replace('Engagement level:', '').trim()
    }
  }

  return overview
}

/**
 * Parse trending hashtags from AI response
 */
function parseTrendingHashtags(content: string) {
  const hashtags: any[] = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.match(/^\d+\./)) {
      const match = trimmedLine.match(/^\d+\.\s*(#\w+)\s*-\s*Category:\s*([^-\n]+)\s*-\s*Usage:\s*([^-\n]+)\s*-\s*Growth:\s*([^-\n]+)\s*-\s*Engagement:\s*([^-\n]+)\s*-\s*Reach:\s*([^-\n]+)\s*-\s*Prediction:\s*([^-\n]+)\s*-\s*Best for:\s*(.+)$/)
      if (match) {
        hashtags.push({
          hashtag: match[1],
          category: match[2].trim(),
          usage: parseInt(match[3].replace(/[^0-9]/g, '')) || 0,
          growth: parseFloat(match[4].replace('%', '')) || 0,
          engagement: parseFloat(match[5]) || 0,
          reach: parseInt(match[6].replace(/[^0-9]/g, '')) || 0,
          prediction: match[7].trim(),
          bestFor: match[8].trim()
        })
      }
    }
  }

  return hashtags
}

/**
 * Parse growth predictions from AI response
 */
function parseGrowthPredictions(content: string) {
  const predictions: any = {
    rising: [],
    stable: [],
    declining: []
  }

  let currentSection = ''
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Rising trends')) {
      currentSection = 'rising'
    } else if (trimmedLine.startsWith('Stable trends')) {
      currentSection = 'stable'
    } else if (trimmedLine.startsWith('Declining trends')) {
      currentSection = 'declining'
    }
    
    if (currentSection && trimmedLine.startsWith('-')) {
      const hashtag = trimmedLine.replace('-', '').trim()
      if (hashtag) {
        predictions[currentSection].push(hashtag)
      }
    }
  }

  return predictions
}

/**
 * Parse usage recommendations from AI response
 */
function parseUsageRecommendations(content: string) {
  const recommendations: any = {
    bestTime: '',
    combinationStrategy: '',
    bestContentTypes: []
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Best time to use trending hashtags:')) {
      recommendations.bestTime = trimmedLine.replace('Best time to use trending hashtags:', '').trim()
    } else if (trimmedLine.startsWith('How to combine with niche hashtags:')) {
      recommendations.combinationStrategy = trimmedLine.replace('How to combine with niche hashtags:', '').trim()
    } else if (trimmedLine.startsWith('Content types that perform best:')) {
      const types = trimmedLine.replace('Content types that perform best:', '').trim()
      recommendations.bestContentTypes = types.split(',').map(t => t.trim()).filter(t => t)
    }
  }

  return recommendations
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */