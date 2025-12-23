import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { calculateHashtagRelevanceScore, categorizeHashtag, analyzeHashtagSet } from '@/lib/ai/hashtag-utils'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get hashtag performance analytics
 * 
 * GET /api/ai/hashtags/performance/[id]
 * 
 * Path parameters:
 * - id: string - Hashtag set ID
 * 
 * Query parameters:
 * - timeRange?: string - Time range for analytics (e.g., '7days', '30days', '90days')
 * - metrics?: string[] - Specific metrics to include (e.g., 'reach,engagement,clicks')
 * 
 * Response:
 * {
 *   success: true,
 *   hashtagSet: {
 *     id: string,
 *     platform: string,
 *     contentType: string,
 *     content: string,
 *     hashtags: string[],
 *     createdAt: string,
 *     totalScore: number
 *   },
 *   performanceMetrics: {
 *     overall: {
 *       reach: number,
 *       engagement: number,
 *       clicks: number,
 *       shares: number,
 *       saves: number,
 *       conversionRate: number
 *     },
 *     trends: Array<{
 *       date: string,
 *       metric: string,
 *       value: number
 *     }>,
 *     comparison: {
 *       vsPreviousPeriod: number,
 *       vsAverage: number,
 *       ranking: string
 *     }
 *   },
 *   individualHashtagPerformance: Array<{
 *     hashtag: string,
 *     category: string,
 *     relevanceScore: number,
 *     metrics: {
 *       reach: number,
 *       engagement: number,
 *       clicks: number,
 *       growth: number
 *     },
 *     contribution: number
 *   }>,
 *   insights: {
 *     topPerformers: string[],
 *     underperformers: string[],
 *     opportunities: string[],
 *     recommendations: string[]
 *   },
 *   optimization: {
 *     suggestedChanges: Array<{
 *       action: string,
 *       hashtag: string,
 *       reason: string,
 *       impact: string
 *     }>,
 *     predictedImprovement: {
 *       reachIncrease: number,
 *       engagementIncrease: number,
 *       overallScoreIncrease: number
 *     }
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Hashtag set ID is required' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30days'
    const metricsParam = searchParams.get('metrics')
    const requestedMetrics = metricsParam ? metricsParam.split(',') : ['reach', 'engagement', 'clicks']

    // Calculate date range
    const daysBack = timeRange === '7days' ? 7 : timeRange === '30days' ? 30 : timeRange === '90days' ? 90 : 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysBack)

    // Get hashtag set with related data
    const hashtagSet = await (prisma as any).hashtagSet.findFirst({
      where: {
        id,
        userId: user.id
      },
      include: {
        platform: {
          select: {
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        },
        hashtagData: {
          select: {
            id: true,
            hashtag: true,
            category: true,
            usage: true,
            growth: true,
            isTrending: true
          }
        },
        performanceData: {
          where: {
            date: {
              gte: startDate
            }
          },
          orderBy: {
            date: 'desc'
          }
        }
      }
    })

    if (!hashtagSet) {
      return NextResponse.json(
        { error: 'Hashtag set not found' },
        { status: 404 }
      )
    }

    // Get individual hashtag performance data
    const individualPerformance = await Promise.all(
      hashtagSet.hashtagData.map(async (hashtag: any) => {
        const performanceData = await (prisma as any).hashtagPerformance.findMany({
          where: {
            hashtagId: hashtag.id,
            date: {
              gte: startDate
            }
          },
          orderBy: {
            date: 'desc'
          }
        })

        // Aggregate metrics
        const metrics: any = {}
        performanceData.forEach((metric: any) => {
          if (!metrics[metric.metric] || metric.value > (metrics[metric.metric] || 0)) {
            metrics[metric.metric] = metric.value
          }
        })

        // Calculate contribution to overall performance
        const relevanceScore = calculateHashtagRelevanceScore(
          hashtag.hashtag,
          hashtagSet.content,
          hashtagSet.platform.name.toLowerCase()
        )

        return {
          hashtag: hashtag.hashtag,
          category: hashtag.category,
          relevanceScore,
          metrics: {
            reach: metrics.reach || 0,
            engagement: metrics.engagement || 0,
            clicks: metrics.clicks || 0,
            growth: hashtag.growth || 0
          },
          contribution: relevanceScore * (metrics.engagement || 0) / 100
        }
      })
    )

    // Calculate overall performance metrics
    const overallMetrics = calculateOverallMetrics(
      hashtagSet.performanceData,
      individualPerformance,
      requestedMetrics
    )

    // Calculate trends over time
    const performanceTrends = calculatePerformanceTrends(
      hashtagSet.performanceData,
      requestedMetrics
    )

    // Calculate comparison data
    const comparisonData = await calculateComparisonData(
      user.id,
      hashtagSet.platformId,
      overallMetrics,
      startDate
    )

    // Generate AI-powered insights and recommendations
    const aiInsights = await generatePerformanceInsights(
      hashtagSet,
      individualPerformance,
      overallMetrics,
      hashtagSet.platform.name.toLowerCase()
    )

    // Generate optimization suggestions
    const optimizationSuggestions = await generateOptimizationSuggestions(
      hashtagSet,
      individualPerformance,
      overallMetrics,
      hashtagSet.platform.name.toLowerCase()
    )

    return NextResponse.json({
      success: true,
      hashtagSet: {
        id: hashtagSet.id,
        platform: hashtagSet.platform.name,
        contentType: hashtagSet.contentType,
        content: hashtagSet.content,
        hashtags: hashtagSet.hashtags,
        createdAt: hashtagSet.createdAt,
        totalScore: hashtagSet.performance?.initialScore || 0
      },
      performanceMetrics: {
        overall: overallMetrics,
        trends: performanceTrends,
        comparison: comparisonData
      },
      individualHashtagPerformance: individualPerformance,
      insights: aiInsights,
      optimization: optimizationSuggestions
    })

  } catch (error: any) {
    console.error('Hashtag performance error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch hashtag performance' },
      { status: 500 }
    )
  }
}

/**
 * Calculate overall performance metrics
 */
function calculateOverallMetrics(
  performanceData: any[],
  individualPerformance: any[],
  requestedMetrics: string[]
) {
  const metrics: any = {}

  // Aggregate set-level performance
  performanceData.forEach((data: any) => {
    if (requestedMetrics.includes(data.metric)) {
      if (!metrics[data.metric] || data.value > (metrics[data.metric] || 0)) {
        metrics[data.metric] = data.value
      }
    }
  })

  // Aggregate individual hashtag performance
  individualPerformance.forEach((hashtag: any) => {
    Object.keys(hashtag.metrics).forEach(metric => {
      if (requestedMetrics.includes(metric)) {
        metrics[metric] = (metrics[metric] || 0) + hashtag.metrics[metric]
      }
    })
  })

  // Calculate conversion rate if we have clicks and reach
  if (metrics.clicks && metrics.reach) {
    metrics.conversionRate = Math.round((metrics.clicks / metrics.reach) * 100 * 100) / 100
  }

  return metrics
}

/**
 * Calculate performance trends over time
 */
function calculatePerformanceTrends(
  performanceData: any[],
  requestedMetrics: string[]
) {
  const trends: any[] = []

  // Group data by date and metric
  const groupedData: Record<string, Record<string, number>> = {}

  performanceData.forEach((data: any) => {
    if (!requestedMetrics.includes(data.metric)) return

    const dateKey = data.date.toISOString().split('T')[0]
    if (!groupedData[dateKey]) {
      groupedData[dateKey] = {}
    }
    groupedData[dateKey][data.metric] = data.value
  })

  // Convert to trend array
  Object.keys(groupedData).sort().forEach(date => {
    Object.keys(groupedData[date]).forEach(metric => {
      trends.push({
        date,
        metric,
        value: groupedData[date][metric]
      })
    })
  })

  return trends
}

/**
 * Calculate comparison data
 */
async function calculateComparisonData(
  userId: string,
  platformId: string,
  currentMetrics: any,
  startDate: Date
) {
  try {
    // Get user's average performance for this platform
    const userAverage = await (prisma as any).hashtagPerformance.aggregate({
      where: {
        setId: {
          in: await (prisma as any).hashtagSet.findMany({
            where: { userId, platformId },
            select: { id: true }
          }).then((sets: any[]) => sets.map(s => s.id))
        },
        date: {
          gte: startDate
        }
      },
      _avg: {
        value: true
      }
    })

    // Get platform average
    const platformAverage = await (prisma as any).hashtagPerformance.aggregate({
      where: {
        platform: platformId,
        date: {
          gte: startDate
        }
      },
      _avg: {
        value: true
      }
    })

    // Calculate comparison percentages
    const userAvg = userAverage._avg.value || 0
    const platformAvg = platformAverage._avg.value || 0
    const currentAvg = Object.values(currentMetrics).reduce((sum: number, val: any) => sum + (val || 0), 0) / Object.keys(currentMetrics).length

    return {
      vsPreviousPeriod: 15, // Mock data - would calculate from previous period
      vsAverage: Math.round(((currentAvg - userAvg) / userAvg) * 100) || 0,
      ranking: currentAvg > platformAvg ? 'Above Average' : currentAvg < platformAvg ? 'Below Average' : 'Average'
    }
  } catch (error) {
    console.error('Error calculating comparison data:', error)
    return {
      vsPreviousPeriod: 0,
      vsAverage: 0,
      ranking: 'Unknown'
    }
  }
}

/**
 * Generate AI-powered performance insights
 */
async function generatePerformanceInsights(
  hashtagSet: any,
  individualPerformance: any[],
  overallMetrics: any,
  platform: string
) {
  try {
    const prompt = `You are a social media analytics expert. Analyze the following hashtag performance data for ${platform.toUpperCase()} and provide insights.

HASHTAG SET:
Platform: ${platform.toUpperCase()}
Content: ${hashtagSet.content}
Hashtags: ${hashtagSet.hashtags.join(', ')}

INDIVIDUAL PERFORMANCE:
${individualPerformance.map(h => `- ${h.hashtag}: ${JSON.stringify(h.metrics)}`).join('\n')}

OVERALL METRICS:
${JSON.stringify(overallMetrics)}

ANALYSIS TASK:
1. Identify top performing hashtags
2. Identify underperforming hashtags
3. Find optimization opportunities
4. Provide actionable recommendations

FORMAT YOUR RESPONSE AS:
---
[TOP_PERFORMERS]
[List of top 3 hashtags with brief explanation]

[UNDERPERFORMERS]
[List of bottom 3 hashtags with brief explanation]

[OPPORTUNITIES]
[List of 3-5 optimization opportunities]

[RECOMMENDATIONS]
[List of 3-5 actionable recommendations]
---

Provide concise, actionable insights.`

    const aiResponse = await generateWithDeepSeek(prompt)
    return parsePerformanceInsights(aiResponse)
  } catch (error) {
    console.error('Error generating performance insights:', error)
    return {
      topPerformers: [],
      underperformers: [],
      opportunities: [],
      recommendations: []
    }
  }
}

/**
 * Parse performance insights from AI response
 */
function parsePerformanceInsights(aiResponse: string) {
  const insights: any = {
    topPerformers: [],
    underperformers: [],
    opportunities: [],
    recommendations: []
  }

  try {
    const sections = {
      'TOP_PERFORMERS': 'topPerformers',
      'UNDERPERFORMERS': 'underperformers',
      'OPPORTUNITIES': 'opportunities',
      'RECOMMENDATIONS': 'recommendations'
    }

    let currentSection = ''
    const lines = aiResponse.split('\n')

    for (const line of lines) {
      const trimmedLine = line.trim()

      // Check for section headers
      for (const [header, key] of Object.entries(sections)) {
        if (trimmedLine === `[${header}]`) {
          currentSection = key
          break
        }
      }

      // Extract content
      if (currentSection && trimmedLine && !trimmedLine.startsWith('[')) {
        insights[currentSection].push(trimmedLine)
      }
    }
  } catch (error) {
    console.error('Error parsing performance insights:', error)
  }

  return insights
}

/**
 * Generate optimization suggestions
 */
async function generateOptimizationSuggestions(
  hashtagSet: any,
  individualPerformance: any[],
  overallMetrics: any,
  platform: string
) {
  try {
    // Sort hashtags by performance
    const sortedByPerformance = [...individualPerformance].sort((a, b) => 
      (b.metrics.engagement || 0) - (a.metrics.engagement || 0)
    )

    const suggestions: any[] = []
    
    // Suggest removing low performers
    const lowPerformers = sortedByPerformance.slice(-3)
    lowPerformers.forEach(hashtag => {
      if (hashtag.relevanceScore < 50 && (hashtag.metrics.engagement || 0) < 100) {
        suggestions.push({
          action: 'remove',
          hashtag: hashtag.hashtag,
          reason: 'Low relevance and engagement',
          impact: 'Improve overall hashtag quality'
        })
      }
    })

    // Suggest adding trending hashtags
    const trendingCount = hashtagSet.trending?.length || 0
    if (trendingCount < 2) {
      suggestions.push({
        action: 'add',
        hashtag: '#trending',
        reason: 'Increase discoverability with trending tags',
        impact: 'Boost reach by 15-25%'
      })
    }

    // Suggest optimizing category balance
    const categories = individualPerformance.reduce((acc, h) => {
      acc[h.category] = (acc[h.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    if (categories['broad'] > individualPerformance.length * 0.5) {
      suggestions.push({
        action: 'replace',
        hashtag: 'some broad hashtags',
        reason: 'Too many broad hashtags reduces targeting',
        impact: 'Improve audience relevance'
      })
    }

    // Predict improvement
    const predictedImprovement = {
      reachIncrease: Math.round(Math.random() * 30) + 10, // Mock prediction
      engagementIncrease: Math.round(Math.random() * 25) + 5, // Mock prediction
      overallScoreIncrease: Math.round(Math.random() * 15) + 5 // Mock prediction
    }

    return {
      suggestedChanges: suggestions,
      predictedImprovement
    }
  } catch (error) {
    console.error('Error generating optimization suggestions:', error)
    return {
      suggestedChanges: [],
      predictedImprovement: {
        reachIncrease: 0,
        engagementIncrease: 0,
        overallScoreIncrease: 0
      }
    }
  }
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */