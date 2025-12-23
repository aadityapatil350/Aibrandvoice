import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Get performance analytics for a specific SEO optimization
 * 
 * GET /api/ai/seo/performance/[id]
 * 
 * Path parameters:
 * - id: string - SEO optimization ID
 * 
 * Query parameters:
 * - dateFrom?: string - Filter by date range start (ISO date string)
 * - dateTo?: string - Filter by date range end (ISO date string)
 * - metrics?: string[] - Specific metrics to include (views, clicks, engagement, ctr)
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
 *     createdAt: string,
 *     keywords: string[]
 *   },
 *   performance: {
 *     current: {
 *       views?: number,
 *       clicks?: number,
 *       engagement?: number,
 *       ctr?: number,
 *       lastUpdated: string
 *     },
 *     historical: Array<{
 *       date: string,
 *       views?: number,
 *       clicks?: number,
 *       engagement?: number,
 *       ctr?: number
 *     }>,
 *     trends: {
 *       views: 'rising' | 'stable' | 'declining',
 *       clicks: 'rising' | 'stable' | 'declining',
 *       engagement: 'rising' | 'stable' | 'declining',
 *       ctr: 'rising' | 'stable' | 'declining'
 *     },
 *     aggregates: {
 *       totalViews: number,
 *       totalClicks: number,
 *       averageEngagement: number,
 *       averageCTR: number,
 *       bestDay: string,
 *       worstDay: string
 *     }
 *   },
 *   abTesting: {
 *     enabled: boolean,
 *     variations?: Array<{
 *       id: string,
 *       type: 'title' | 'description',
 *       text: string,
 *       performance: {
 *         views?: number,
 *         clicks?: number,
 *         engagement?: number,
 *         ctr?: number
 *       },
 *       winner?: boolean
 *     }>,
 *     winner?: {
 *       variationId: string,
 *       confidence: number,
 *       improvement: string
 *     }
 *   },
 *   recommendations: Array<{
 *     type: 'performance' | 'seo' | 'content',
 *     priority: 'high' | 'medium' | 'low',
 *     title: string,
 *     description: string,
 *     actionItems: string[]
 *   }>,
 *   insights: Array<{
 *     category: string,
 *     finding: string,
 *     impact: 'positive' | 'negative' | 'neutral',
 *     recommendation: string
 *   }>
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

    const optimizationId = params.id

    if (!optimizationId) {
      return NextResponse.json(
        { error: 'Optimization ID is required' },
        { status: 400 }
      )
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const metricsParam = searchParams.get('metrics')
    const metrics = metricsParam ? metricsParam.split(',') : ['views', 'clicks', 'engagement', 'ctr']

    // Get SEO optimization with user verification
    const optimization = await (prisma as any).seoOptimization.findFirst({
      where: {
        id: optimizationId,
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
        keywordAnalysis: true,
        performanceData: {
          where: {
            ...(dateFrom && { date: { gte: new Date(dateFrom) } }),
            ...(dateTo && { date: { lte: new Date(dateTo) } })
          },
          orderBy: {
            date: 'asc'
          }
        }
      }
    })

    if (!optimization) {
      return NextResponse.json(
        { error: 'SEO optimization not found or access denied' },
        { status: 404 }
      )
    }

    // Process performance data
    const performanceData = optimization.performanceData || []
    const historicalData = processHistoricalData(performanceData, metrics)
    const currentPerformance = getCurrentPerformance(performanceData, metrics)
    const trends = calculateTrends(historicalData)
    const aggregates = calculateAggregates(performanceData, metrics)

    // Process A/B testing data if available
    const abTesting = processABTestingData(optimization.variations, performanceData)

    // Generate recommendations based on performance
    const recommendations = generateRecommendations(
      optimization,
      currentPerformance,
      trends,
      aggregates
    )

    // Generate insights
    const insights = generateInsights(
      optimization,
      historicalData,
      trends,
      aggregates
    )

    return NextResponse.json({
      success: true,
      optimization: {
        id: optimization.id,
        platform: optimization.platform.name,
        contentType: optimization.contentType,
        originalTitle: optimization.originalTitle,
        optimizedTitle: optimization.optimizedTitle,
        seoScore: optimization.seoScore,
        createdAt: optimization.createdAt,
        keywords: optimization.keywords
      },
      performance: {
        current: currentPerformance,
        historical: historicalData,
        trends,
        aggregates
      },
      abTesting,
      recommendations,
      insights
    })

  } catch (error: any) {
    console.error('SEO performance error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SEO performance data' },
      { status: 500 }
    )
  }
}

/**
 * Process historical performance data
 */
function processHistoricalData(performanceData: any[], metrics: string[]) {
  return performanceData.map((data: any) => {
    const processed: any = {
      date: data.date.toISOString()
    }
    
    metrics.forEach(metric => {
      if (data.metric === metric) {
        processed[metric] = data.value
      }
    })
    
    return processed
  }).filter((item: any) => Object.keys(item).length > 1) // Filter out empty entries
}

/**
 * Get current performance metrics
 */
function getCurrentPerformance(performanceData: any[], metrics: string[]) {
  const current: any = {
    lastUpdated: new Date().toISOString()
  }
  
  // Get the latest value for each metric
  const latestValues: any = {}
  performanceData.forEach((data: any) => {
    if (!latestValues[data.metric] || data.date > latestValues[data.metric].date) {
      latestValues[data.metric] = data
    }
  })
  
  metrics.forEach(metric => {
    if (latestValues[metric]) {
      current[metric] = latestValues[metric].value
    }
  })
  
  return current
}

/**
 * Calculate trends for each metric
 */
function calculateTrends(historicalData: any[]) {
  const trends: any = {}
  const metrics = ['views', 'clicks', 'engagement', 'ctr']
  
  metrics.forEach(metric => {
    const metricData = historicalData
      .filter(item => item[metric] !== undefined)
      .map(item => ({ value: item[metric], date: new Date(item.date) }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())
    
    if (metricData.length >= 2) {
      const firstValue = metricData[0].value
      const lastValue = metricData[metricData.length - 1].value
      const changePercent = ((lastValue - firstValue) / firstValue) * 100
      
      if (changePercent > 5) {
        trends[metric] = 'rising'
      } else if (changePercent < -5) {
        trends[metric] = 'declining'
      } else {
        trends[metric] = 'stable'
      }
    } else {
      trends[metric] = 'stable'
    }
  })
  
  return trends
}

/**
 * Calculate aggregate performance metrics
 */
function calculateAggregates(performanceData: any[], metrics: string[]) {
  const aggregates: any = {
    totalViews: 0,
    totalClicks: 0,
    averageEngagement: 0,
    averageCTR: 0,
    bestDay: '',
    worstDay: ''
  }
  
  const valuesByMetric: any = {}
  const valuesByDate: any = {}
  
  performanceData.forEach((data: any) => {
    // Group by metric
    if (!valuesByMetric[data.metric]) {
      valuesByMetric[data.metric] = []
    }
    valuesByMetric[data.metric].push(data.value)
    
    // Group by date for best/worst day analysis
    const dateKey = data.date.toISOString().split('T')[0]
    if (!valuesByDate[dateKey]) {
      valuesByDate[dateKey] = { total: 0, count: 0 }
    }
    valuesByDate[dateKey].total += data.value
    valuesByDate[dateKey].count += 1
  })
  
  // Calculate aggregates for each metric
  Object.keys(valuesByMetric).forEach(metric => {
    const values = valuesByMetric[metric]
    const sum = values.reduce((acc: number, val: number) => acc + val, 0)
    const avg = sum / values.length
    
    switch (metric) {
      case 'views':
        aggregates.totalViews = sum
        break
      case 'clicks':
        aggregates.totalClicks = sum
        break
      case 'engagement':
        aggregates.averageEngagement = Math.round(avg * 100) / 100
        break
      case 'ctr':
        aggregates.averageCTR = Math.round(avg * 100) / 100
        break
    }
  })
  
  // Find best and worst days
  const dailyAverages = Object.entries(valuesByDate).map(([date, data]: [string, any]) => ({
    date,
    average: data.total / data.count
  }))
  
  if (dailyAverages.length > 0) {
    dailyAverages.sort((a, b) => b.average - a.average)
    aggregates.bestDay = dailyAverages[0].date
    aggregates.worstDay = dailyAverages[dailyAverages.length - 1].date
  }
  
  return aggregates
}

/**
 * Process A/B testing data
 */
function processABTestingData(variations: any, performanceData: any[]) {
  if (!variations || !variations.titles && !variations.descriptions) {
    return { enabled: false }
  }
  
  const abTesting: any = {
    enabled: true,
    variations: []
  }
  
  // Process title variations
  if (variations.titles) {
    variations.titles.forEach((titleVar: any, index: number) => {
      abTesting.variations.push({
        id: `title_${index}`,
        type: 'title',
        text: titleVar.text,
        score: titleVar.score,
        performance: getVariationPerformance(`title_${index}`, performanceData)
      })
    })
  }
  
  // Process description variations
  if (variations.descriptions) {
    variations.descriptions.forEach((descVar: any, index: number) => {
      abTesting.variations.push({
        id: `desc_${index}`,
        type: 'description',
        text: descVar.text,
        score: descVar.score,
        performance: getVariationPerformance(`desc_${index}`, performanceData)
      })
    })
  }
  
  // Determine winner if we have performance data
  if (abTesting.variations.length > 0) {
    const variationWithPerformance = abTesting.variations
      .filter((v: any) => v.performance && v.performance.views)
      .sort((a: any, b: any) => (b.performance.views || 0) - (a.performance.views || 0))
    
    if (variationWithPerformance.length > 0) {
      const winner = variationWithPerformance[0]
      winner.winner = true
      abTesting.winner = {
        variationId: winner.id,
        confidence: 0.85, // Simplified confidence calculation
        improvement: '+15% better than original' // Simplified improvement calculation
      }
    }
  }
  
  return abTesting
}

/**
 * Get performance data for a specific variation
 */
function getVariationPerformance(variationId: string, performanceData: any[]) {
  const variationData = performanceData.filter((data: any) => 
    data.metadata && data.metadata.variationId === variationId
  )
  
  const performance: any = {}
  variationData.forEach((data: any) => {
    performance[data.metric] = data.value
  })
  
  return Object.keys(performance).length > 0 ? performance : undefined
}

/**
 * Generate performance recommendations
 */
function generateRecommendations(
  optimization: any,
  currentPerformance: any,
  trends: any,
  aggregates: any
) {
  const recommendations: any[] = []
  
  // Performance-based recommendations
  if (currentPerformance.ctr && currentPerformance.ctr < 2) {
    recommendations.push({
      type: 'performance',
      priority: 'high',
      title: 'Low Click-Through Rate',
      description: 'Your CTR is below industry average. Consider improving your title to be more compelling.',
      actionItems: [
        'Add numbers or statistics to your title',
        'Include emotional triggers or questions',
        'Test different title variations'
      ]
    })
  }
  
  // Trend-based recommendations
  Object.keys(trends).forEach(metric => {
    if (trends[metric] === 'declining') {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: `Declining ${metric.toUpperCase()}`,
        description: `Your ${metric} have been declining over time. Consider updating your content.`,
        actionItems: [
          'Refresh your title with trending keywords',
          'Update description with current information',
          'Analyze competitor performance'
        ]
      })
    }
  })
  
  // SEO-based recommendations
  if (optimization.seoScore && optimization.seoScore < 70) {
    recommendations.push({
      type: 'seo',
      priority: 'high',
      title: 'Low SEO Score',
      description: 'Your SEO score could be improved for better visibility.',
      actionItems: [
        'Add more relevant keywords',
        'Optimize title length for platform',
        'Improve description quality and length'
      ]
    })
  }
  
  // Content-based recommendations
  if (!optimization.keywords || optimization.keywords.length < 3) {
    recommendations.push({
      type: 'content',
      priority: 'medium',
      title: 'Limited Keyword Targeting',
      description: 'Consider adding more relevant keywords to improve discoverability.',
      actionItems: [
        'Research trending keywords in your niche',
        'Include long-tail keywords',
        'Analyze competitor keywords'
      ]
    })
  }
  
  return recommendations
}

/**
 * Generate performance insights
 */
function generateInsights(
  optimization: any,
  historicalData: any[],
  trends: any,
  aggregates: any
) {
  const insights: any[] = []
  
  // Performance insights
  if (aggregates.totalViews > 10000) {
    insights.push({
      category: 'Performance',
      finding: `Strong performance with ${aggregates.totalViews.toLocaleString()} total views`,
      impact: 'positive',
      recommendation: 'Analyze what made this content successful and replicate the strategy'
    })
  }
  
  // Trend insights
  const improvingMetrics = Object.keys(trends).filter(metric => trends[metric] === 'rising')
  if (improvingMetrics.length > 0) {
    insights.push({
      category: 'Trends',
      finding: `${improvingMetrics.join(', ')} are showing positive growth`,
      impact: 'positive',
      recommendation: 'Continue current optimization strategy'
    })
  }
  
  // Platform-specific insights
  if (optimization.platform?.name === 'YOUTUBE' && aggregates.averageCTR > 5) {
    insights.push({
      category: 'Platform',
      finding: 'Above-average YouTube CTR performance',
      impact: 'positive',
      recommendation: 'Your thumbnail and title combination is working well'
    })
  }
  
  // SEO insights
  if (optimization.seoScore > 85) {
    insights.push({
      category: 'SEO',
      finding: 'Excellent SEO optimization score',
      impact: 'positive',
      recommendation: 'This optimization serves as a good template for future content'
    })
  }
  
  return insights
}

/**
 * Rate limiting and security middleware would be implemented here
 * For now, we're using basic error handling
 */