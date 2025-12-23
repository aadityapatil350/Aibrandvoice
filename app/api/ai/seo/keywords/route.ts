import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateSeoKeywordPrompt } from '@/lib/ai/prompts'
import { extractKeywords } from '@/lib/ai/seo-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get keyword analysis and suggestions
 * 
 * GET /api/ai/seo/keywords
 * 
 * Query parameters:
 * - platform: string (required) - YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, BLOG
 * - contentType?: string - video, blog, social, etc.
 * - content?: string - Content to analyze for keywords
 * - targetAudience?: string - Target audience description
 * - language?: string - Content language (default: 'en')
 * - limit?: number - Maximum number of keywords to return (default: 50)
 * 
 * Response:
 * {
 *   success: true,
 *   keywords: {
 *     primary: {
 *       keywords: Array<{
 *         keyword: string,
 *         volume: 'high' | 'medium' | 'low',
 *         competition: 'high' | 'medium' | 'low',
 *         trend: 'rising' | 'stable' | 'declining',
 *         difficulty: number
 *       }>,
 *       total: number
 *     },
 *     secondary: {
 *       keywords: Array<{
 *         keyword: string,
 *         volume: 'high' | 'medium' | 'low',
 *         competition: 'high' | 'medium' | 'low',
 *         trend: 'rising' | 'stable' | 'declining',
 *         difficulty: number
 *       }>,
 *       total: number
 *     },
 *     longTail: {
 *       keywords: Array<{
 *         keyword: string,
 *         volume: 'low',
 *         competition: 'low',
 *         trend: 'rising' | 'stable' | 'declining',
 *         difficulty: number
 *       }>,
 *       total: number
 *     },
 *     trending: {
 *       keywords: Array<{
 *         keyword: string,
 *         reason: string,
 *         trend: 'rising',
 *         volume: 'high' | 'medium' | 'low',
 *         competition: 'high' | 'medium' | 'low'
 *       }>,
 *       total: number
 *     }
 *   },
 *   analysis: {
 *     extractedKeywords: string[],
 *     contentGaps: string[],
 *     strategy: string
 *   },
 *   metadata: {
 *     platform: string,
 *     contentType: string,
 *     language: string,
 *     totalKeywords: number,
 *     generatedAt: string
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
    const contentType = searchParams.get('contentType') || 'content'
    const content = searchParams.get('content')
    const targetAudience = searchParams.get('targetAudience')
    const language = searchParams.get('language') || 'en'
    const limit = parseInt(searchParams.get('limit') || '50')

    // Validate required parameters
    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required parameter: platform' },
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

    // Extract keywords from content if provided
    const extractedKeywords = content ? extractKeywords(content, 20) : []

    // Generate AI keyword analysis prompt
    const promptParams = {
      platform: platform.toLowerCase(),
      contentType,
      content: content || undefined,
      targetAudience: targetAudience || undefined,
      language
    }

    const aiPrompt = generateSeoKeywordPrompt(promptParams)

    // Get AI keyword suggestions
    const aiResponse = await generateWithDeepSeek(aiPrompt)

    // Parse AI response
    const parsedResponse = parseKeywordResponse(aiResponse)

    // Get existing keyword data from database for this platform
    const existingKeywords = await (prisma as any).seoKeyword.findMany({
      where: {
        platformId: platformRecord.id
      },
      take: 100
    })

    // Merge AI suggestions with existing data
    const mergedKeywords = mergeKeywordData(parsedResponse, existingKeywords)

    // Limit results if specified
    const limitedKeywords = limitKeywords(mergedKeywords, limit)

    // Store new keywords in database
    await storeKeywordsInDatabase(limitedKeywords, platformRecord.id)

    return NextResponse.json({
      success: true,
      keywords: limitedKeywords,
      analysis: {
        extractedKeywords,
        contentGaps: parsedResponse.contentGaps || [],
        strategy: parsedResponse.keywordStrategy || 'Focus on primary keywords with high relevance and moderate competition'
      },
      metadata: {
        platform: platform.toUpperCase(),
        contentType,
        language,
        totalKeywords: getTotalKeywordCount(limitedKeywords),
        generatedAt: new Date().toISOString()
      }
    })

  } catch (error: any) {
    console.error('Keyword analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Keyword analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * Parse AI response for keyword analysis
 */
function parseKeywordResponse(aiResponse: string) {
  try {
    // Default structure in case parsing fails
    const defaultResponse = {
      primaryKeywords: [],
      secondaryKeywords: [],
      longTailKeywords: [],
      trendingKeywords: [],
      keywordStrategy: 'Focus on relevant keywords with good search volume',
      contentGaps: []
    }

    if (!aiResponse) return defaultResponse

    // Extract primary keywords
    const primaryMatches = aiResponse.match(/\[PRIMARY_KEYWORDS\]([\s\S]*?)\[SECONDARY_KEYWORDS\]/)
    const primaryKeywords = primaryMatches ? parseKeywordList(primaryMatches[1]) : []

    // Extract secondary keywords
    const secondaryMatches = aiResponse.match(/\[SECONDARY_KEYWORDS\]([\s\S]*?)\[LONG_TAIL_KEYWORDS\]/)
    const secondaryKeywords = secondaryMatches ? parseKeywordList(secondaryMatches[1]) : []

    // Extract long-tail keywords
    const longTailMatches = aiResponse.match(/\[LONG_TAIL_KEYWORDS\]([\s\S]*?)\[TRENDING_KEYWORDS\]/)
    const longTailKeywords = longTailMatches ? parseKeywordList(longTailMatches[1]) : []

    // Extract trending keywords
    const trendingMatches = aiResponse.match(/\[TRENDING_KEYWORDS\]([\s\S]*?)\[KEYWORD_STRATEGY\]/)
    const trendingKeywords = trendingMatches ? parseTrendingKeywords(trendingMatches[1]) : []

    // Extract keyword strategy
    const strategyMatches = aiResponse.match(/\[KEYWORD_STRATEGY\]([\s\S]*?)\[CONTENT_GAPS\]/)
    const keywordStrategy = strategyMatches ? strategyMatches[1].trim() : defaultResponse.keywordStrategy

    // Extract content gaps
    const gapsMatches = aiResponse.match(/\[CONTENT_GAPS\]([\s\S]*?)---/)
    const contentGaps = gapsMatches ? parseContentGaps(gapsMatches[1]) : []

    return {
      primaryKeywords,
      secondaryKeywords,
      longTailKeywords,
      trendingKeywords,
      keywordStrategy,
      contentGaps
    }
  } catch (error) {
    console.error('Error parsing keyword response:', error)
    return {
      primaryKeywords: [],
      secondaryKeywords: [],
      longTailKeywords: [],
      trendingKeywords: [],
      keywordStrategy: 'Unable to determine strategy due to parsing error',
      contentGaps: []
    }
  }
}

/**
 * Parse keyword list from AI response
 */
function parseKeywordList(content: string) {
  const keywords = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.match(/^\d+\./)) {
      const match = trimmedLine.match(/^\d+\.\s*([^-\s]+)\s*-\s*Volume:\s*(\w+)\s*-\s*Competition:\s*(\w+)\s*-\s*Trend:\s*(\w+)/)
      if (match) {
        keywords.push({
          keyword: match[1],
          volume: match[2].toLowerCase(),
          competition: match[3].toLowerCase(),
          trend: match[4].toLowerCase(),
          difficulty: calculateDifficulty(match[2].toLowerCase(), match[3].toLowerCase())
        })
      }
    }
  }
  
  return keywords
}

/**
 * Parse trending keywords from AI response
 */
function parseTrendingKeywords(content: string) {
  const keywords = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine.match(/^\d+\./)) {
      const match = trimmedLine.match(/^\d+\.\s*([^-\s]+)\s*-\s*Reason for trend:\s*(.+)$/)
      if (match) {
        keywords.push({
          keyword: match[1],
          reason: match[2],
          trend: 'rising',
          volume: 'high', // Trending keywords typically have high volume
          competition: 'high' // Trending keywords typically have high competition
        })
      }
    }
  }
  
  return keywords
}

/**
 * Parse content gaps from AI response
 */
function parseContentGaps(content: string) {
  const gaps = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('[')) {
      gaps.push(trimmedLine)
    }
  }
  
  return gaps
}

/**
 * Calculate keyword difficulty based on volume and competition
 */
function calculateDifficulty(volume: string, competition: string): number {
  const volumeScore = volume === 'high' ? 3 : volume === 'medium' ? 2 : 1
  const competitionScore = competition === 'high' ? 3 : competition === 'medium' ? 2 : 1
  
  // Difficulty is inverse of opportunity (higher volume + lower competition = lower difficulty)
  const rawDifficulty = (competitionScore * 2) - volumeScore
  return Math.max(1, Math.min(10, rawDifficulty * 2))
}

/**
 * Merge AI suggestions with existing database data
 */
function mergeKeywordData(aiResponse: any, existingKeywords: any[]) {
  const existingKeywordMap = new Map()
  existingKeywords.forEach(keyword => {
    existingKeywordMap.set(keyword.keyword.toLowerCase(), keyword)
  })

  // Update AI suggestions with existing data where available
  const updateKeywordList = (keywordList: any[]) => {
    return keywordList.map(keyword => {
      const existing = existingKeywordMap.get(keyword.keyword.toLowerCase())
      if (existing) {
        return {
          ...keyword,
          volume: existing.volume || keyword.volume,
          competition: existing.competition || keyword.competition,
          trend: existing.trend || keyword.trend,
          difficulty: existing.difficulty || keyword.difficulty,
          lastUpdated: existing.lastUpdated
        }
      }
      return keyword
    })
  }

  return {
    primary: {
      keywords: updateKeywordList(aiResponse.primaryKeywords),
      total: aiResponse.primaryKeywords.length
    },
    secondary: {
      keywords: updateKeywordList(aiResponse.secondaryKeywords),
      total: aiResponse.secondaryKeywords.length
    },
    longTail: {
      keywords: updateKeywordList(aiResponse.longTailKeywords),
      total: aiResponse.longTailKeywords.length
    },
    trending: {
      keywords: aiResponse.trendingKeywords,
      total: aiResponse.trendingKeywords.length
    }
  }
}

/**
 * Limit keywords to specified number
 */
function limitKeywords(keywords: any, limit: number) {
  const totalLimit = Math.floor(limit / 4) // Divide limit among categories
  
  return {
    primary: {
      keywords: keywords.primary.keywords.slice(0, totalLimit),
      total: Math.min(keywords.primary.total, totalLimit)
    },
    secondary: {
      keywords: keywords.secondary.keywords.slice(0, totalLimit),
      total: Math.min(keywords.secondary.total, totalLimit)
    },
    longTail: {
      keywords: keywords.longTail.keywords.slice(0, totalLimit),
      total: Math.min(keywords.longTail.total, totalLimit)
    },
    trending: {
      keywords: keywords.trending.keywords.slice(0, Math.floor(limit / 8)), // Fewer trending keywords
      total: Math.min(keywords.trending.total, Math.floor(limit / 8))
    }
  }
}

/**
 * Get total keyword count
 */
function getTotalKeywordCount(keywords: any) {
  return keywords.primary.total + keywords.secondary.total + keywords.longTail.total + keywords.trending.total
}

/**
 * Store keywords in database
 */
async function storeKeywordsInDatabase(keywords: any, platformId: string) {
  const allKeywords = [
    ...keywords.primary.keywords,
    ...keywords.secondary.keywords,
    ...keywords.longTail.keywords
  ]

  for (const keywordData of allKeywords) {
    try {
      await (prisma as any).seoKeyword.upsert({
        where: {
          keyword_platformId: {
            keyword: keywordData.keyword,
            platformId
          }
        },
        update: {
          competition: keywordData.competition,
          volume: keywordData.volume === 'high' ? 1000000 : keywordData.volume === 'medium' ? 100000 : 10000,
          difficulty: keywordData.difficulty,
          trend: keywordData.trend,
          lastUpdated: new Date()
        },
        create: {
          keyword: keywordData.keyword,
          platformId,
          competition: keywordData.competition,
          volume: keywordData.volume === 'high' ? 1000000 : keywordData.volume === 'medium' ? 100000 : 10000,
          difficulty: keywordData.difficulty,
          trend: keywordData.trend
        }
      })
    } catch (error) {
      console.error('Error storing keyword:', keywordData.keyword, error)
    }
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */