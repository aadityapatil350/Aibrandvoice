import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateSeoOptimizationPrompt } from '@/lib/ai/prompts'
import { generateSeoAnalysis, extractKeywords } from '@/lib/ai/seo-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Optimize title and description for SEO
 * 
 * POST /api/ai/seo/optimize
 * 
 * Request body:
 * {
 *   platform: string,           // YOUTUBE, INSTAGRAM, TIKTOK, LINKEDIN, TWITTER, BLOG
 *   contentType: string,        // video, blog, social, etc.
 *   title: string,              // Original title
 *   description?: string,       // Original description
 *   targetAudience?: string,    // Target audience description
 *   keywords?: string[],         // Target keywords
 *   language?: string           // Content language (default: 'en')
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   analysis: {
 *     currentScore: number,
 *     breakdown: {
 *       titleScore: number,
 *       descriptionScore: number,
 *       keywordScore: number,
 *       readabilityScore: number,
 *       platformOptimizationScore: number,
 *       overallScore: number
 *     },
 *     recommendations: string[],
 *     issues: string[]
 *   },
 *   optimizedContent: {
 *     titles: [
 *       { text: string, score: number, reason: string },
 *       { text: string, score: number, reason: string },
 *       { text: string, score: number, reason: string }
 *     ],
 *     descriptions: [
 *       { text: string, score: number, reason: string },
 *       { text: string, score: number, reason: string },
 *       { text: string, score: number, reason: string }
 *     ]
 *   },
 *   keywordSuggestions: {
 *     primary: string[],
 *     secondary: string[],
 *     longTail: string[],
 *     trending: string[]
 *   },
 *   recommendations: string[]
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
      title,
      description,
      targetAudience,
      keywords,
      language = 'en'
    } = body

    // Validate required fields
    if (!platform || !contentType || !title) {
      return NextResponse.json(
        { error: 'Missing required fields: platform, contentType, title' },
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

    // Extract keywords from content if not provided
    const extractedKeywords = keywords && keywords.length > 0 
      ? keywords 
      : extractKeywords(`${title} ${description || ''}`, 10)

    // Generate initial SEO analysis
    const initialAnalysis = generateSeoAnalysis(
      title,
      description || '',
      platform.toLowerCase(),
      extractedKeywords
    )

    // Generate AI optimization prompt
    const promptParams = {
      platform: platform.toLowerCase(),
      contentType,
      title,
      description,
      targetAudience,
      keywords: extractedKeywords,
      language
    }

    const aiPrompt = generateSeoOptimizationPrompt(promptParams)

    // Get AI optimization suggestions
    const aiResponse = await generateWithDeepSeek(aiPrompt)

    // Parse AI response
    const parsedResponse = parseSeoOptimizationResponse(aiResponse)

    // Calculate scores for AI-generated content
    const optimizedTitles = parsedResponse.titles.map(titleVariant => ({
      ...titleVariant,
      score: generateSeoAnalysis(
        titleVariant.text,
        description || '',
        platform.toLowerCase(),
        extractedKeywords
      ).breakdown.titleScore
    }))

    const optimizedDescriptions = parsedResponse.descriptions.map(descVariant => ({
      ...descVariant,
      score: generateSeoAnalysis(
        title,
        descVariant.text,
        platform.toLowerCase(),
        extractedKeywords
      ).breakdown.descriptionScore
    }))

    // Log optimization request for analytics
    await (prisma as any).seoOptimization.create({
      data: {
        userId: user.id,
        platformId: platformRecord.id,
        contentType,
        originalTitle: title,
        originalDesc: description,
        optimizedTitle: optimizedTitles[0]?.text || title,
        optimizedDesc: optimizedDescriptions[0]?.text || description || '',
        keywords: extractedKeywords,
        seoScore: initialAnalysis.breakdown.overallScore,
        characterCount: {
          title: title.length,
          description: description?.length || 0
        },
        variations: {
          titles: optimizedTitles,
          descriptions: optimizedDescriptions
        },
        performance: {
          initialScore: initialAnalysis.breakdown.overallScore,
          optimizedScore: Math.max(
            optimizedTitles[0]?.score || 0,
            optimizedDescriptions[0]?.score || 0
          )
        }
      }
    })

    return NextResponse.json({
      success: true,
      analysis: initialAnalysis,
      optimizedContent: {
        titles: optimizedTitles,
        descriptions: optimizedDescriptions
      },
      keywordSuggestions: parsedResponse.keywordSuggestions,
      recommendations: parsedResponse.recommendations
    })

  } catch (error: any) {
    console.error('SEO optimization error:', error)
    return NextResponse.json(
      { error: error.message || 'SEO optimization failed' },
      { status: 500 }
    )
  }
}

/**
 * Parse AI response for SEO optimization
 */
function parseSeoOptimizationResponse(aiResponse: string) {
  try {
    // Default structure in case parsing fails
    const defaultResponse = {
      titles: [
        { text: '', score: 0, reason: 'Failed to parse AI response' },
        { text: '', score: 0, reason: 'Failed to parse AI response' },
        { text: '', score: 0, reason: 'Failed to parse AI response' }
      ],
      descriptions: [
        { text: '', score: 0, reason: 'Failed to parse AI response' },
        { text: '', score: 0, reason: 'Failed to parse AI response' },
        { text: '', score: 0, reason: 'Failed to parse AI response' }
      ],
      keywordSuggestions: {
        primary: [],
        secondary: [],
        longTail: [],
        trending: []
      },
      recommendations: ['Unable to generate recommendations due to parsing error']
    }

    if (!aiResponse) return defaultResponse

    // Extract titles
    const titleMatches = aiResponse.match(/\[OPTIMIZED_TITLES\]([\s\S]*?)\[OPTIMIZED_DESCRIPTIONS\]/)
    const titles = titleMatches ? parseOptimizedContent(titleMatches[1]) : defaultResponse.titles

    // Extract descriptions
    const descMatches = aiResponse.match(/\[OPTIMIZED_DESCRIPTIONS\]([\s\S]*?)\[KEYWORD_SUGGESTIONS\]/)
    const descriptions = descMatches ? parseOptimizedContent(descMatches[1]) : defaultResponse.descriptions

    // Extract keyword suggestions
    const keywordMatches = aiResponse.match(/\[KEYWORD_SUGGESTIONS\]([\s\S]*?)\[RECOMMENDATIONS\]/)
    const keywordSuggestions = keywordMatches ? parseKeywordSuggestions(keywordMatches[1]) : defaultResponse.keywordSuggestions

    // Extract recommendations
    const recMatches = aiResponse.match(/\[RECOMMENDATIONS\]([\s\S]*?)---/)
    const recommendations = recMatches ? parseRecommendations(recMatches[1]) : defaultResponse.recommendations

    return {
      titles,
      descriptions,
      keywordSuggestions,
      recommendations
    }
  } catch (error) {
    console.error('Error parsing SEO optimization response:', error)
    return {
      titles: [
        { text: '', score: 0, reason: 'Parsing error occurred' },
        { text: '', score: 0, reason: 'Parsing error occurred' },
        { text: '', score: 0, reason: 'Parsing error occurred' }
      ],
      descriptions: [
        { text: '', score: 0, reason: 'Parsing error occurred' },
        { text: '', score: 0, reason: 'Parsing error occurred' },
        { text: '', score: 0, reason: 'Parsing error occurred' }
      ],
      keywordSuggestions: {
        primary: [],
        secondary: [],
        longTail: [],
        trending: []
      },
      recommendations: ['Unable to parse AI response for recommendations']
    }
  }
}

/**
 * Parse optimized content (titles or descriptions) from AI response
 */
function parseOptimizedContent(content: string) {
  const items = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    if (line.trim().startsWith('A)') || line.trim().startsWith('B)') || line.trim().startsWith('C)')) {
      const match = line.match(/^[A-C]\)\s*(.+?)\s*-\s*Score:\s*(\d+)\/100\s*-\s*Reason:\s*(.+)$/)
      if (match) {
        items.push({
          text: match[1].trim(),
          score: parseInt(match[2]),
          reason: match[3].trim()
        })
      }
    }
  }
  
  // Ensure we always return 3 items
  while (items.length < 3) {
    items.push({
      text: '',
      score: 0,
      reason: 'No suggestion available'
    })
  }
  
  return items.slice(0, 3)
}

/**
 * Parse keyword suggestions from AI response
 */
function parseKeywordSuggestions(content: string) {
  const suggestions = {
    primary: [],
    secondary: [],
    longTail: [],
    trending: []
  }
  
  const sections = {
    'Primary keywords': 'primary',
    'Secondary keywords': 'secondary',
    'Long-tail keywords': 'longTail',
    'Trending keywords': 'trending'
  }
  
  let currentSection = ''
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    
    // Check if this is a section header
    for (const [sectionName, sectionKey] of Object.entries(sections)) {
      if (trimmedLine.toLowerCase().startsWith(sectionName.toLowerCase())) {
        currentSection = sectionKey
        break
      }
    }
    
    // Extract keywords if we're in a section
    if (currentSection && trimmedLine.match(/^\d+\./)) {
      const keywordMatch = trimmedLine.match(/^\d+\.\s*([^-\s]+)/)
      if (keywordMatch) {
        (suggestions as any)[currentSection].push(keywordMatch[1])
      }
    }
  }
  
  return suggestions
}

/**
 * Parse recommendations from AI response
 */
function parseRecommendations(content: string) {
  const recommendations = []
  const lines = content.trim().split('\n')
  
  for (const line of lines) {
    const trimmedLine = line.trim()
    if (trimmedLine && !trimmedLine.startsWith('[')) {
      recommendations.push(trimmedLine)
    }
  }
  
  return recommendations
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */