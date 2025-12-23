import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

interface CompetitorAnalysis {
  channelName: string
  subscribers: number
  videoCount: number
  avgViews: number
  topContent: string[]
  contentThemes: string[]
  postingFrequency: string
  voiceCharacteristics: {
    tone: string[]
    complexity: string
    formality: string
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { channels, industry } = await request.json()

    if (!channels || !Array.isArray(channels)) {
      return NextResponse.json(
        { error: 'Channels array is required' },
        { status: 400 }
      )
    }

    const analysis: CompetitorAnalysis[] = []
    const insights = {
      suggestedTones: [] as string[],
      commonThemes: [] as string[],
      successfulFormats: [] as string[],
      postingPatterns: [] as string[]
    }

    // Analyze each competitor channel
    for (const channelUrl of channels) {
      if (!channelUrl) continue

      try {
        const channelId = extractChannelId(channelUrl)
        if (!channelId) {
          console.error(`Invalid channel URL: ${channelUrl}`)
          continue
        }

        const channelData = await analyzeYouTubeChannel(channelId, industry)
        if (channelData) {
          analysis.push(channelData)

          // Collect insights across all competitors
          channelData.voiceCharacteristics.tone.forEach(tone => {
            if (!insights.suggestedTones.includes(tone)) {
              insights.suggestedTones.push(tone)
            }
          })
        }
      } catch (error) {
        console.error(`Error analyzing channel ${channelUrl}:`, error)
      }
    }

    // Generate additional insights
    if (analysis.length > 0) {
      // Find common content themes
      const allThemes = analysis.flatMap(a => a.contentThemes)
      const themeFrequency = allThemes.reduce((acc, theme) => {
        acc[theme] = (acc[theme] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      insights.commonThemes = Object.entries(themeFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([theme]) => theme)

      // Identify successful formats
      const allContent = analysis.flatMap(a => a.topContent)
      insights.successfulFormats = [...new Set(allContent)].slice(0, 3)
    }

    return NextResponse.json({
      analysis,
      insights,
      summary: {
        totalCompetitors: analysis.length,
        avgSubscribers: analysis.reduce((sum, a) => sum + a.subscribers, 0) / analysis.length || 0,
        topPerformingThemes: insights.commonThemes.slice(0, 3)
      }
    })

  } catch (error) {
    console.error('Competitor analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractChannelId(url: string): string | null {
  // Extract channel ID from various YouTube URL formats
  const patterns = [
    /youtube\.com\/channel\/([^\/\?]+)/,
    /youtube\.com\/@([^\/\?]+)/,
    /youtube\.com\/c\/([^\/\?]+)/
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

async function analyzeYouTubeChannel(channelId: string, industry: string): Promise<CompetitorAnalysis | null> {
  try {
    // For demonstration, we'll simulate channel analysis
    // In production, you would use YouTube Data API v3
    // You'll need to add the API key to your .env file: YOUTUBE_API_KEY

    // Simulated data based on industry patterns
    const simulatedData = generateSimulatedChannelData(channelId, industry)

    return simulatedData
  } catch (error) {
    console.error('Error analyzing YouTube channel:', error)
    return null
  }
}

function generateSimulatedChannelData(channelId: string, industry: string): CompetitorAnalysis {
  // This is a simulation. In production, replace with actual YouTube API calls

  const channelName = `Channel_${channelId.slice(0, 8)}`

  const industryData = {
    'Technology': {
      avgSubscribers: 50000,
      avgViews: 10000,
      themes: ['Software tutorials', 'Tech reviews', 'Industry news', 'Coding tips', 'Product demos'],
      tones: ['Professional', 'Technical', 'Educational'],
      formats: ['Tutorials', 'Product reviews', 'Industry analysis']
    },
    'Fashion & Beauty': {
      avgSubscribers: 100000,
      avgViews: 25000,
      themes: ['Makeup tutorials', 'Fashion hauls', 'Style tips', 'Product reviews', 'Trend reports'],
      tones: ['Casual', 'Friendly', 'Creative', 'Inspiring'],
      formats: ['Tutorials', 'Haul videos', 'GRWM (Get Ready With Me)', 'Lookbooks']
    },
    'Fitness & Wellness': {
      avgSubscribers: 75000,
      avgViews: 15000,
      themes: ['Workout routines', 'Nutrition tips', 'Wellness advice', 'Fitness challenges', 'Motivation'],
      tones: ['Motivating', 'Energetic', 'Educational', 'Supportive'],
      formats: ['Workout videos', 'Meal prep', 'Q&A', 'Challenge videos']
    },
    'Education': {
      avgSubscribers: 150000,
      avgViews: 30000,
      themes: ['Educational content', 'Study tips', 'Subject explanations', 'Career advice', 'Learning strategies'],
      tones: ['Educational', 'Professional', 'Encouraging', 'Clear'],
      formats: ['Lectures', 'Tutorials', 'Explainer videos', 'Study guides']
    }
  }

  const defaultData = {
    avgSubscribers: 25000,
    avgViews: 5000,
    themes: ['Industry content', 'Tips & tricks', 'News & updates', 'Tutorials', 'Q&A'],
    tones: ['Professional', 'Friendly', 'Informative'],
    formats: ['How-to videos', 'Industry insights', 'Tutorials', 'News']
  }

  const data = industryData[industry as keyof typeof industryData] || defaultData

  // Add some randomness to make it realistic
  const randomMultiplier = 0.5 + Math.random() * 1.5

  return {
    channelName,
    subscribers: Math.floor(data.avgSubscribers * randomMultiplier),
    videoCount: Math.floor(100 + Math.random() * 900),
    avgViews: Math.floor(data.avgViews * randomMultiplier),
    topContent: data.formats.slice(0, 3),
    contentThemes: data.themes.slice(0, 4),
    postingFrequency: Math.random() > 0.5 ? '2-3 times per week' : 'Weekly',
    voiceCharacteristics: {
      tone: data.tones,
      complexity: Math.random() > 0.5 ? 'moderate' : 'simple',
      formality: Math.random() > 0.5 ? 'mixed' : 'casual'
    }
  }
}

// Production implementation would use YouTube Data API v3:
/*
async function getYouTubeChannelData(channelId: string, apiKey: string) {
  const baseUrl = 'https://www.googleapis.com/youtube/v3'

  // Get channel details
  const channelResponse = await fetch(
    `${baseUrl}/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`
  )
  const channelData = await channelResponse.json()

  // Get recent videos to analyze content
  const videosResponse = await fetch(
    `${baseUrl}/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=10&key=${apiKey}`
  )
  const videosData = await videosResponse.json()

  // Process and analyze the data
  // ...
}
*/