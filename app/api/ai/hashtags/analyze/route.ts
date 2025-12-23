import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateHashtagAnalysisPrompt } from '@/lib/ai/prompts'
import { 
  calculateHashtagRelevanceScore, 
  categorizeHashtag, 
  analyzeHashtagSet,
  normalizeHashtag,
  extractHashtags
} from '@/lib/ai/hashtag-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Analyze existing hashtags for performance and relevance
 * 
 * POST /api/ai/hashtags/analyze
 * 
 * Request body:
 * {
 *   hashtags: string[],            // Array of hashtags to analyze
 *   platform: string,             // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, FACEBOOK
 *   content?: string,             // Content context (optional)
 *   targetAudience?: string,       // Target audience (optional)
 *   language?: string,             // Language (default: 'en')
 *   includeSuggestions?: boolean,    // Include hashtag suggestions (default: true)
 *   benchmark?: boolean            // Include benchmarking data (default: false)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   overallAnalysis: {
 *     strategyScore: number,
 *     strategyType: string,
 *     strengths: string[],
 *     weaknesses: string[]
 *   },
 *   individualAnalysis: Array<{
 *     hashtag: string,
 *     score: number,
 *     category: string,
 *     performance: string,
 *     issues: string[],
 *     recommendation: string,
 *     relevanceScore: number,
 *     popularityScore: number,
 *     competitionScore: number
 *   }>,
 *   categoryBreakdown: {
 *     trending: { count: number, effectiveness: string },
 *     niche: { count: number, effectiveness: string },
 *     broad: { count: number, effectiveness: string }
 *   },
 *   optimization: {
 *     remove: Array<{ hashtag: string, reason: string }>,
 *     add: Array<{ hashtag: string, reason: string, category: string }>,
 *     modify: Array<{ hashtag: string, changes: string, impact: string }>
 *   },
 *   suggestions: {
 *     strategyImprovements: string[],
 *     performancePrediction: {
 *       current: string,
 *       optimized: string,
 *       improvement: string
 *     }
 *   },
 *   benchmark?: {
 *     industryAverage: number,
 *     topPerformers: Array<{ hashtag: string, score: number, category: string }>,
 *     ranking: string
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
      hashtags,
      platform,
      content,
      targetAudience,
      language = 'en',
      includeSuggestions = true,
      benchmark = false
    } = body

    // Validate required fields
    if (!hashtags || !Array.isArray(hashtags) || hashtags.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: hashtags (non-empty array)' },
        { status: 400 }
      )
    }

    if (!platform) {
      return NextResponse.json(
        { error: 'Missing required field: platform' },
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

    // Normalize and clean hashtags
    const normalizedHashtags = hashtags
      .map(hashtag => normalizeHashtag(hashtag))
      .filter(hashtag => hashtag.length > 0)

    if (normalizedHashtags.length === 0) {
      return NextResponse.json(
        { error: 'No valid hashtags provided after normalization' },
        { status: 400 }
      )
    }

    // Generate AI-powered analysis
    const aiAnalysis = await generateAIAnalysis(
      normalizedHashtags,
      platform.toLowerCase(),
      content,
      targetAudience,
      language
    )

    // Calculate individual hashtag metrics
    const individualAnalysis = normalizedHashtags.map(hashtag => {
      const relevanceScore = calculateHashtagRelevanceScore(
        hashtag,
        content || '',
        platform.toLowerCase(),
        targetAudience
      )
      const category = categorizeHashtag(hashtag, platform.toLowerCase())

      return {
        hashtag: `#${hashtag}`,
        score: relevanceScore,
        category,
        performance: getPerformanceLevel(relevanceScore),
        issues: identifyHashtagIssues(hashtag, relevanceScore, category),
        recommendation: generateHashtagRecommendation(hashtag, relevanceScore, category),
        relevanceScore,
        popularityScore: calculatePopularityScore(hashtag),
        competitionScore: calculateCompetitionScore(hashtag)
      }
    })

    // Calculate category breakdown
    const categoryBreakdown = calculateCategoryBreakdown(individualAnalysis)

    // Generate optimization suggestions
    const optimization = generateOptimizationSuggestions(
      individualAnalysis,
      platform.toLowerCase(),
      normalizedHashtags.length
    )

    // Get benchmarking data if requested
    let benchmarkData = undefined
    if (benchmark) {
      benchmarkData = await getBenchmarkingData(
        normalizedHashtags,
        platformRecord.id,
        user.id
      )
    }

    return NextResponse.json({
      success: true,
      overallAnalysis: aiAnalysis.overallAnalysis,
      individualAnalysis,
      categoryBreakdown,
      optimization,
      suggestions: {
        strategyImprovements: aiAnalysis.strategyImprovements,
        performancePrediction: aiAnalysis.performancePrediction
      },
      benchmark: benchmarkData
    })

  } catch (error: any) {
    console.error('Hashtag analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Hashtag analysis failed' },
      { status: 500 }
    )
  }
}

/**
 * Generate AI-powered hashtag analysis
 */
async function generateAIAnalysis(
  hashtags: string[],
  platform: string,
  content?: string,
  targetAudience?: string,
  language = 'en'
) {
  try {
    const promptParams = {
      hashtags,
      platform,
      content,
      targetAudience,
      language
    }

    const aiPrompt = generateHashtagAnalysisPrompt(promptParams)
    const aiResponse = await generateWithDeepSeek(aiPrompt)

    return parseAIAnalysisResponse(aiResponse)
  } catch (error) {
    console.error('Error generating AI analysis:', error)
    return {
      overallAnalysis: {
        strategyScore: 50,
        strategyType: 'balanced',
        strengths: [],
        weaknesses: []
      },
      strategyImprovements: ['Unable to generate AI-powered improvements'],
      performancePrediction: {
        current: 'Unknown',
        optimized: 'Unknown',
        improvement: 'Unknown'
      }
    }
  }
}

/**
 * Parse AI analysis response
 */
function parseAIAnalysisResponse(aiResponse: string) {
  const defaultAnalysis = {
    overallAnalysis: {
      strategyScore: 50,
      strategyType: 'balanced',
      strengths: [],
      weaknesses: []
    },
    strategyImprovements: ['Unable to parse strategy improvements'],
    performancePrediction: {
      current: 'Unknown',
      optimized: 'Unknown',
      improvement: 'Unknown'
    }
  }

  if (!aiResponse) return defaultAnalysis

  try {
    // Extract overall analysis
    const overallMatches = aiResponse.match(/\[OVERALL_ANALYSIS\]([\s\S]*?)\[INDIVIDUAL_ANALYSIS\]/)
    const overallAnalysis = overallMatches ? parseOverallAnalysis(overallMatches[1]) : defaultAnalysis.overallAnalysis

    // Extract strategy improvements
    const strategyMatches = aiResponse.match(/\[STRATEGY_IMPROVEMENTS\]([\s\S]*?)\[PERFORMANCE_PREDICTION\]/)
    const strategyImprovements = strategyMatches ? parseStrategyImprovements(strategyMatches[1]) : []

    // Extract performance prediction
    const predictionMatches = aiResponse.match(/\[PERFORMANCE_PREDICTION\]([\s\S]*?)---/)
    const performancePrediction = predictionMatches ? parsePerformancePrediction(predictionMatches[1]) : defaultAnalysis.performancePrediction

    return {
      overallAnalysis,
      strategyImprovements,
      performancePrediction
    }
  } catch (error) {
    console.error('Error parsing AI analysis response:', error)
    return defaultAnalysis
  }
}

/**
 * Parse overall analysis from AI response
 */
function parseOverallAnalysis(content: string) {
  const analysis: any = {
    strategyScore: 50,
    strategyType: 'balanced',
    strengths: [],
    weaknesses: []
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Hashtag strategy score:')) {
      analysis.strategyScore = parseInt(trimmedLine.replace('Hashtag strategy score:', '').trim()) || 50
    } else if (trimmedLine.startsWith('Strategy type:')) {
      analysis.strategyType = trimmedLine.replace('Strategy type:', '').trim()
    } else if (trimmedLine.startsWith('Strengths:')) {
      const strengths = trimmedLine.replace('Strengths:', '').trim()
      analysis.strengths = strengths.split(',').map(s => s.trim()).filter(s => s)
    } else if (trimmedLine.startsWith('Weaknesses:')) {
      const weaknesses = trimmedLine.replace('Weaknesses:', '').trim()
      analysis.weaknesses = weaknesses.split(',').map(w => w.trim()).filter(w => w)
    }
  }

  return analysis
}

/**
 * Parse strategy improvements from AI response
 */
function parseStrategyImprovements(content: string) {
  const improvements = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('[')) {
      improvements.push(trimmedLine)
    }
  }
  
  return improvements
}

/**
 * Parse performance prediction from AI response
 */
function parsePerformancePrediction(content: string) {
  const prediction: any = {
    current: 'Unknown',
    optimized: 'Unknown',
    improvement: 'Unknown'
  }

  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    if (trimmedLine.startsWith('Current setup potential:')) {
      prediction.current = trimmedLine.replace('Current setup potential:', '').trim()
    } else if (trimmedLine.startsWith('Optimized potential:')) {
      prediction.optimized = trimmedLine.replace('Optimized potential:', '').trim()
    } else if (trimmedLine.startsWith('Potential improvement:')) {
      prediction.improvement = trimmedLine.replace('Potential improvement:', '').trim()
    }
  }

  return prediction
}

/**
 * Get performance level based on score
 */
function getPerformanceLevel(score: number): string {
  if (score >= 80) return 'high'
  if (score >= 60) return 'medium'
  return 'low'
}

/**
 * Identify issues with a hashtag
 */
function identifyHashtagIssues(hashtag: string, score: number, category: string): string[] {
  const issues = []
  
  if (score < 50) {
    issues.push('Low relevance score')
  }
  
  if (hashtag.length < 3) {
    issues.push('Too short')
  } else if (hashtag.length > 20) {
    issues.push('Too long')
  }
  
  if (/\d/.test(hashtag)) {
    issues.push('Contains numbers (may reduce readability)')
  }
  
  const spamIndicators = ['follow', 'like', 'comment', 'share', 'tagsforlikes']
  if (spamIndicators.some(spam => hashtag.includes(spam))) {
    issues.push('Appears spam-like')
  }
  
  if (category === 'broad' && score < 60) {
    issues.push('Broad hashtag with low relevance')
  }
  
  return issues
}

/**
 * Generate recommendation for a hashtag
 */
function generateHashtagRecommendation(hashtag: string, score: number, category: string): string {
  if (score >= 80) {
    return 'Keep - high performing hashtag'
  }
  
  if (score < 50) {
    return 'Consider replacing with more relevant hashtag'
  }
  
  if (category === 'broad') {
    return 'Consider adding more specific hashtags'
  }
  
  if (category === 'niche' && score < 60) {
    return 'May be too niche for broad reach'
  }
  
  return 'Monitor performance and adjust as needed'
}

/**
 * Calculate popularity score (mock implementation)
 */
function calculatePopularityScore(hashtag: string): number {
  // In production, this would fetch real data from platform APIs
  const commonHashtags = ['love', 'instagood', 'fashion', 'beautiful', 'happy', 'cute', 'followme']
  const isCommon = commonHashtags.includes(hashtag.toLowerCase())
  
  if (isCommon) return 90
  if (hashtag.length < 5) return 70
  if (hashtag.length > 15) return 30
  
  return 50
}

/**
 * Calculate competition score (mock implementation)
 */
function calculateCompetitionScore(hashtag: string): number {
  // In production, this would fetch real competition data
  const highCompetition = ['love', 'instagood', 'fashion', 'photooftheday']
  const isHighCompetition = highCompetition.includes(hashtag.toLowerCase())
  
  if (isHighCompetition) return 90
  if (hashtag.length > 10) return 30
  if (hashtag.includes('_') || hashtag.includes('-')) return 40
  
  return 50
}

/**
 * Calculate category breakdown
 */
function calculateCategoryBreakdown(individualAnalysis: any[]) {
  const breakdown = {
    trending: { count: 0, effectiveness: 'low' },
    niche: { count: 0, effectiveness: 'low' },
    broad: { count: 0, effectiveness: 'low' }
  }

  individualAnalysis.forEach(item => {
    if (breakdown[item.category as keyof typeof breakdown]) {
      breakdown[item.category as keyof typeof breakdown].count++
    }
  })

  // Calculate effectiveness for each category
  Object.keys(breakdown).forEach(category => {
    const categoryItems = individualAnalysis.filter(item => item.category === category)
    if (categoryItems.length > 0) {
      const avgScore = categoryItems.reduce((sum, item) => sum + item.score, 0) / categoryItems.length
      breakdown[category as keyof typeof breakdown].effectiveness = 
        avgScore >= 70 ? 'high' : avgScore >= 50 ? 'medium' : 'low'
    }
  })

  return breakdown
}

/**
 * Generate optimization suggestions
 */
function generateOptimizationSuggestions(
  individualAnalysis: any[],
  platform: string,
  totalHashtags: number
) {
  const optimization = {
    remove: [] as Array<{ hashtag: string; reason: string }>,
    add: [] as Array<{ hashtag: string; reason: string; category: string }>,
    modify: [] as Array<{ hashtag: string; changes: string; impact: string }>
  }

  // Suggest removing low-performing hashtags
  const lowPerformers = individualAnalysis
    .filter(item => item.score < 40)
    .slice(0, 3)

  lowPerformers.forEach(item => {
    optimization.remove.push({
      hashtag: item.hashtag,
      reason: item.issues.join(', ')
    })
  })

  // Suggest adding hashtags based on platform needs
  const optimalCounts: Record<string, { min: number; max: number }> = {
    instagram: { min: 5, max: 30 },
    tiktok: { min: 3, max: 10 },
    twitter: { min: 1, max: 3 },
    linkedin: { min: 3, max: 10 },
    youtube: { min: 3, max: 15 },
    facebook: { min: 2, max: 5 }
  }

  const optimal = optimalCounts[platform] || optimalCounts.instagram

  if (totalHashtags < optimal.min) {
    optimization.add.push({
      hashtag: '#trending',
      reason: 'Increase discoverability',
      category: 'trending'
    })
    
    optimization.add.push({
      hashtag: '#niche',
      reason: 'Target specific audience',
      category: 'niche'
    })
  }

  if (totalHashtags > optimal.max) {
    const excessCount = totalHashtags - optimal.max
    optimization.remove.push({
      hashtag: `Remove ${excessCount} hashtags`,
      reason: `Exceeds optimal count for ${platform}`
    })
  }

  // Suggest modifications for broad hashtags
  const broadHashtags = individualAnalysis.filter(item => 
    item.category === 'broad' && item.score < 60
  )

  broadHashtags.forEach(item => {
    optimization.modify.push({
      hashtag: item.hashtag,
      changes: 'Make more specific',
      impact: 'Improve targeting and relevance'
    })
  })

  return optimization
}

/**
 * Get benchmarking data
 */
async function getBenchmarkingData(
  hashtags: string[],
  platformId: string,
  userId: string
) {
  try {
    // Get user's average performance
    const userAverage = await (prisma as any).hashtagSet.aggregate({
      where: {
        userId,
        platformId
      },
      _avg: {
        // This would calculate from performance data
      }
    })

    // Get industry averages (mock data)
    const industryAverage = 65 // Mock value

    // Get top performers (mock data)
    const topPerformers = hashtags.slice(0, 5).map(hashtag => ({
      hashtag: `#${hashtag}`,
      score: Math.floor(Math.random() * 30) + 70, // Mock score
      category: categorizeHashtag(hashtag, 'generic')
    }))

    // Calculate ranking
    const userScore = userAverage._avg?.score || 0
    const ranking = userScore >= industryAverage + 10 ? 'Top Performer' :
                   userScore >= industryAverage - 10 ? 'Average' : 'Below Average'

    return {
      industryAverage,
      topPerformers,
      ranking
    }
  } catch (error) {
    console.error('Error getting benchmarking data:', error)
    return undefined
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */