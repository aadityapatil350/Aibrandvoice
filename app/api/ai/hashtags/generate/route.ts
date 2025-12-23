import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateHashtagPrompt } from '@/lib/ai/prompts'
import { 
  calculateHashtagRelevanceScore, 
  categorizeHashtag, 
  analyzeHashtagSet,
  normalizeHashtag 
} from '@/lib/ai/hashtag-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Generate hashtags for social media content
 * 
 * POST /api/ai/hashtags/generate
 * 
 * Request body:
 * {
 *   platform: string,              // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, FACEBOOK
 *   content: string,               // Content description to analyze
 *   targetAudience?: string,       // Target audience description
 *   language?: string,             // Content language (default: 'en')
 *   hashtagCount?: number,          // Number of hashtags to generate (default: platform-specific)
 *   includeTrending?: boolean,      // Include trending hashtags (default: true)
 *   includeNiche?: boolean,         // Include niche hashtags (default: true)
 *   includeBroad?: boolean          // Include broad hashtags (default: true)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   contentAnalysis: {
 *     mainThemes: string[],
 *     targetAudience: string,
 *     contentType: string,
 *     emotionalTone: string
 *   },
 *   hashtags: {
 *     trending: Array<{
 *       hashtag: string,
 *       relevanceScore: number,
 *       category: string,
 *       reason: string
 *     }>,
 *     niche: Array<{
 *       hashtag: string,
 *       relevanceScore: number,
 *       category: string,
 *       reason: string
 *     }>,
 *     broad: Array<{
 *       hashtag: string,
 *       relevanceScore: number,
 *       category: string,
 *       reason: string
 *     }>
 *   },
 *   analysis: {
 *     totalScore: number,
 *     categoryDistribution: Record<string, number>,
 *     trendingCount: number,
 *     nicheCount: number,
 *     broadCount: number,
 *     recommendations: string[],
 *     issues: string[]
 *   },
 *   optimization: {
 *     tips: string[],
 *     performancePrediction: {
 *       estimatedReach: string,
 *       engagementPotential: string,
 *       bestPostingTime: string
 *     }
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
      content,
      targetAudience,
      language = 'en',
      hashtagCount,
      includeTrending = true,
      includeNiche = true,
      includeBroad = true
    } = body

    // Validate required fields
    if (!platform || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, content' },
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

    // Set platform-specific hashtag count if not provided
    const platformHashtagCounts: Record<string, number> = {
      'instagram': 15,
      'tiktok': 5,
      'twitter': 2,
      'linkedin': 5,
      'youtube': 8,
      'facebook': 4
    }
    
    const defaultHashtagCount = platformHashtagCounts[platform.toLowerCase()] || 10
    const finalHashtagCount = hashtagCount || defaultHashtagCount

    // Generate AI hashtag suggestions
    const promptParams = {
      platform: platform.toLowerCase(),
      content,
      targetAudience,
      language,
      hashtagCount: finalHashtagCount,
      includeTrending,
      includeNiche,
      includeBroad
    }

    const aiPrompt = generateHashtagPrompt(promptParams)
    const aiResponse = await generateWithDeepSeek(aiPrompt)

    // Parse AI response
    const parsedResponse = parseHashtagGenerationResponse(aiResponse)

    // Calculate relevance scores and categorize hashtags
    const enhancedHashtags = {
      trending: parsedResponse.hashtags.trending.map((hashtag: any) => ({
        hashtag: normalizeHashtag(hashtag.hashtag),
        relevanceScore: calculateHashtagRelevanceScore(
          hashtag.hashtag,
          content,
          platform.toLowerCase(),
          targetAudience
        ),
        category: categorizeHashtag(hashtag.hashtag, platform.toLowerCase()),
        reason: hashtag.reason
      })),
      niche: parsedResponse.hashtags.niche.map((hashtag: any) => ({
        hashtag: normalizeHashtag(hashtag.hashtag),
        relevanceScore: calculateHashtagRelevanceScore(
          hashtag.hashtag,
          content,
          platform.toLowerCase(),
          targetAudience
        ),
        category: categorizeHashtag(hashtag.hashtag, platform.toLowerCase()),
        reason: hashtag.reason
      })),
      broad: parsedResponse.hashtags.broad.map((hashtag: any) => ({
        hashtag: normalizeHashtag(hashtag.hashtag),
        relevanceScore: calculateHashtagRelevanceScore(
          hashtag.hashtag,
          content,
          platform.toLowerCase(),
          targetAudience
        ),
        category: categorizeHashtag(hashtag.hashtag, platform.toLowerCase()),
        reason: hashtag.reason
      }))
    }

    // Remove duplicates and filter by minimum relevance score
    const allHashtags = [
      ...enhancedHashtags.trending,
      ...enhancedHashtags.niche,
      ...enhancedHashtags.broad
    ]

    const uniqueHashtags = removeDuplicateHashtags(allHashtags)
    const filteredHashtags = uniqueHashtags.filter(h => h.relevanceScore >= 50)

    // Recategorize after filtering
    const finalHashtags = {
      trending: filteredHashtags.filter(h => h.category === 'trending'),
      niche: filteredHashtags.filter(h => h.category === 'niche'),
      broad: filteredHashtags.filter(h => h.category === 'broad')
    }

    // Analyze the hashtag set
    const allFinalHashtags = [
      ...finalHashtags.trending,
      ...finalHashtags.niche,
      ...finalHashtags.broad
    ].map(h => h.hashtag)

    const analysis = analyzeHashtagSet(
      allFinalHashtags,
      content,
      platform.toLowerCase(),
      targetAudience
    )

    return NextResponse.json({
      success: true,
      contentAnalysis: parsedResponse.contentAnalysis,
      hashtags: finalHashtags,
      analysis,
      optimization: {
        tips: parsedResponse.optimizationTips,
        performancePrediction: parsedResponse.performancePrediction
      }
    })

  } catch (error: any) {
    console.error('Hashtag generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Hashtag generation failed' },
      { status: 500 }
    )
  }
}

/**
 * Parse AI response for hashtag generation
 */
function parseHashtagGenerationResponse(aiResponse: string) {
  try {
    // Default structure in case parsing fails
    const defaultResponse = {
      contentAnalysis: {
        mainThemes: [],
        targetAudience: '',
        contentType: '',
        emotionalTone: ''
      },
      hashtags: {
        trending: [],
        niche: [],
        broad: []
      },
      optimizationTips: [],
      performancePrediction: {
        estimatedReach: '',
        engagementPotential: '',
        bestPostingTime: ''
      }
    }

    if (!aiResponse) return defaultResponse

    // Extract content analysis
    const contentAnalysisMatches = aiResponse.match(/\[CONTENT_ANALYSIS\]([\s\S]*?)\[HASHTAGS\]/)
    const contentAnalysis = contentAnalysisMatches ? parseContentAnalysis(contentAnalysisMatches[1]) : defaultResponse.contentAnalysis

    // Extract hashtags
    const hashtagsMatches = aiResponse.match(/\[HASHTAGS\]([\s\S]*?)\[OPTIMIZATION_TIPS\]/)
    const hashtags = hashtagsMatches ? parseHashtags(hashtagsMatches[1]) : defaultResponse.hashtags

    // Extract optimization tips
    const tipsMatches = aiResponse.match(/\[OPTIMIZATION_TIPS\]([\s\S]*?)\[PERFORMANCE_PREDICTION\]/)
    const optimizationTips = tipsMatches ? parseOptimizationTips(tipsMatches[1]) : []

    // Extract performance prediction
    const predictionMatches = aiResponse.match(/\[PERFORMANCE_PREDICTION\]([\s\S]*?)---/)
    const performancePrediction = predictionMatches ? parsePerformancePrediction(predictionMatches[1]) : defaultResponse.performancePrediction

    return {
      contentAnalysis,
      hashtags,
      optimizationTips,
      performancePrediction
    }
  } catch (error) {
    console.error('Error parsing hashtag generation response:', error)
    return {
      contentAnalysis: {
        mainThemes: [],
        targetAudience: '',
        contentType: '',
        emotionalTone: ''
      },
      hashtags: {
        trending: [],
        niche: [],
        broad: []
      },
      optimizationTips: ['Unable to parse optimization tips'],
      performancePrediction: {
        estimatedReach: 'Unknown',
        engagementPotential: 'Unknown',
        bestPostingTime: 'Unknown'
      }
    }
  }
}

/**
 * Parse content analysis from AI response
 */
function parseContentAnalysis(content: string) {
  const analysis: any = {
    mainThemes: [],
    targetAudience: '',
    contentType: '',
    emotionalTone: ''
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Main themes:')) {
      const themes = trimmedLine.replace('Main themes:', '').trim()
      analysis.mainThemes = themes.split(',').map(t => t.trim()).filter(t => t)
    } else if (trimmedLine.startsWith('Target audience:')) {
      analysis.targetAudience = trimmedLine.replace('Target audience:', '').trim()
    } else if (trimmedLine.startsWith('Content type:')) {
      analysis.contentType = trimmedLine.replace('Content type:', '').trim()
    } else if (trimmedLine.startsWith('Emotional tone:')) {
      analysis.emotionalTone = trimmedLine.replace('Emotional tone:', '').trim()
    }
  }

  return analysis
}

/**
 * Parse hashtags from AI response
 */
function parseHashtags(content: string) {
  const hashtags: any = {
    trending: [],
    niche: [],
    broad: []
  }

  let currentSection = ''
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check if this is a section header
    if (trimmedLine === 'TRENDING:') {
      currentSection = 'trending'
    } else if (trimmedLine === 'NICHE:') {
      currentSection = 'niche'
    } else if (trimmedLine === 'BROAD:') {
      currentSection = 'broad'
    }
    
    // Extract hashtags if we're in a section
    if (currentSection && trimmedLine.match(/^\d+\./)) {
      const match = trimmedLine.match(/^\d+\.\s*(#\w+)\s*-\s*Relevance:\s*(\d+)\/100\s*-\s*Reason:\s*(.+)$/)
      if (match) {
        hashtags[currentSection].push({
          hashtag: match[1],
          relevanceScore: parseInt(match[2]),
          reason: match[3].trim()
        })
      }
    }
  }

  return hashtags
}

/**
 * Parse optimization tips from AI response
 */
function parseOptimizationTips(content: string) {
  const tips = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('[')) {
      tips.push(trimmedLine)
    }
  }
  
  return tips
}

/**
 * Parse performance prediction from AI response
 */
function parsePerformancePrediction(content: string) {
  const prediction: any = {
    estimatedReach: '',
    engagementPotential: '',
    bestPostingTime: ''
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Estimated reach:')) {
      prediction.estimatedReach = trimmedLine.replace('Estimated reach:', '').trim()
    } else if (trimmedLine.startsWith('Engagement potential:')) {
      prediction.engagementPotential = trimmedLine.replace('Engagement potential:', '').trim()
    } else if (trimmedLine.startsWith('Best posting time:')) {
      prediction.bestPostingTime = trimmedLine.replace('Best posting time:', '').trim()
    }
  }

  return prediction
}

/**
 * Remove duplicate hashtags from array
 */
function removeDuplicateHashtags(hashtags: Array<{ hashtag: string; relevanceScore: number; category: string; reason: string }>) {
  const seen = new Set()
  return hashtags.filter(hashtag => {
    const normalized = hashtag.hashtag.toLowerCase()
    if (seen.has(normalized)) {
      return false
    }
    seen.add(normalized)
    return true
  })
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */