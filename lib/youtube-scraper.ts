import { Transcript } from 'youtube-transcript-api'

interface ChannelData {
  channelName: string
  subscriberCount: number
  videoCount: number
  description: string
  publishedAt: string
  country: string
}

interface VideoData {
  videoId: string
  title: string
  description: string
  publishedAt: string
  viewCount: number
  likeCount: number
  commentCount: number
  duration: string
  tags: string[]
  categoryId: string
}

interface ContentAnalysis {
  themes: string[]
  keywords: string[]
  tone: string[]
  complexity: 'simple' | 'moderate' | 'complex'
  formality: 'formal' | 'casual' | 'mixed'
  contentTypes: string[]
  postingFrequency: string
}

export class YouTubeScraper {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Extract channel ID from various YouTube URL formats
   */
  extractChannelId(url: string): string | null {
    const patterns = [
      /youtube\.com\/channel\/([^\/\?]+)/,
      /youtube\.com\/@([^\/\?]+)/,
      /youtube\.com\/c\/([^\/\?]+)/,
      /youtube\.com\/([^\/\?]+)(?:\?|$)/
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match) return match[1]
    }

    return null
  }

  /**
   * Get channel information
   */
  async getChannelInfo(channelId: string): Promise<ChannelData | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelId}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.items || data.items.length === 0) {
        return null
      }

      const channel = data.items[0]
      return {
        channelName: channel.snippet.title,
        subscriberCount: parseInt(channel.statistics.subscriberCount),
        videoCount: parseInt(channel.statistics.videoCount),
        description: channel.snippet.description,
        publishedAt: channel.snippet.publishedAt,
        country: channel.snippet.country || 'Unknown'
      }
    } catch (error) {
      console.error('Error fetching channel info:', error)
      return null
    }
  }

  /**
   * Get top performing videos from a channel
   */
  async getTopVideos(channelId: string, maxResults: number = 10): Promise<VideoData[]> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&order=viewCount&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      )

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.statusText}`)
      }

      const searchData = await response.json()
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

      // Get detailed video statistics
      const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id=${videoIds}&key=${this.apiKey}`
      )

      const detailsData = await detailsResponse.json()

      return searchData.items.map((item: any, index: number) => {
        const details = detailsData.items[index]
        return {
          videoId: item.id.videoId,
          title: item.snippet.title,
          description: item.snippet.description,
          publishedAt: item.snippet.publishedAt,
          viewCount: parseInt(details.statistics.viewCount),
          likeCount: parseInt(details.statistics.likeCount || '0'),
          commentCount: parseInt(details.statistics.commentCount || '0'),
          duration: details.contentDetails.duration,
          tags: item.snippet.tags || [],
          categoryId: item.snippet.categoryId
        }
      })
    } catch (error) {
      console.error('Error fetching videos:', error)
      return []
    }
  }

  /**
   * Get transcript from a video
   */
  async getVideoTranscript(videoId: string): Promise<string | null> {
    try {
      // Note: In a production environment, you might want to use a more robust solution
      // This is a simplified implementation

      // For production, consider using:
      // 1. Official YouTube transcript API
      // 2. Third-party services like AssemblyAI or Deepgram
      // 3. Self-hosted transcription with models like Whisper

      // Mock implementation - replace with actual transcript fetching
      return null // Placeholder
    } catch (error) {
      console.error('Error fetching transcript:', error)
      return null
    }
  }

  /**
   * Analyze content patterns from videos
   */
  async analyzeContent(videos: VideoData[], channelDescription: string): Promise<ContentAnalysis> {
    const allTitles = videos.map(v => v.title.toLowerCase())
    const allDescriptions = videos.map(v => v.description.toLowerCase())
    const allTags = videos.flatMap(v => v.tags).map(tag => tag.toLowerCase())

    // Extract common themes and keywords
    const themes = this.extractThemes(allTitles, allDescriptions, allTags)
    const keywords = this.extractKeywords(allTitles, allDescriptions, channelDescription)

    // Analyze tone based on language patterns
    const tone = this.analyzeTone(allTitles, allDescriptions)

    // Determine complexity based on vocabulary and sentence structure
    const complexity = this.analyzeComplexity(allTitles, allDescriptions)

    // Determine formality level
    const formality = this.analyzeFormality(allTitles, allDescriptions)

    // Identify content types
    const contentTypes = this.identifyContentTypes(allTitles, allDescriptions)

    // Calculate posting frequency
    const postingFrequency = this.calculatePostingFrequency(videos)

    return {
      themes,
      keywords,
      tone,
      complexity,
      formality,
      contentTypes,
      postingFrequency
    }
  }

  /**
   * Extract common themes from content
   */
  private extractThemes(titles: string[], descriptions: string[], tags: string[]): string[] {
    const allText = [...titles, ...descriptions, ...tags].join(' ')
    const words = allText.split(/\s+/).filter(word => word.length > 3)

    // Count word frequency
    const wordFreq = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Filter and sort common words
    const commonWords = Object.entries(wordFreq)
      .filter(([word]) => !this.isStopWord(word))
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)

    return commonWords
  }

  /**
   * Extract relevant keywords
   */
  private extractKeywords(titles: string[], descriptions: string[], channelDescription: string): string[] {
    // Similar to extractThemes but more focused on industry-specific terms
    const allText = [...titles, ...descriptions, channelDescription.toLowerCase()].join(' ')

    // Look for industry-specific patterns
    const industryKeywords = [
      'tutorial', 'review', 'guide', 'tips', 'how to', 'tutorial', 'demo',
      'news', 'update', 'latest', 'breaking', 'analysis', 'insights',
      'beginner', 'advanced', 'expert', 'master', 'learn', 'education'
    ]

    return industryKeywords.filter(keyword => allText.includes(keyword))
  }

  /**
   * Analyze tone from content
   */
  private analyzeTone(titles: string[], descriptions: string[]): string[] {
    const toneIndicators = {
      'professional': ['professional', 'expert', 'industry', 'business', 'corporate'],
      'casual': ['hey guys', "what's up", 'guys', 'everyone', 'friends'],
      'educational': ['learn', 'tutorial', 'guide', 'how to', 'education'],
      'entertaining': ['fun', 'funny', 'amazing', 'awesome', 'cool', 'exciting'],
      'inspiring': ['inspiration', 'motivation', 'success', 'achieve', 'dream'],
      'technical': ['technical', 'code', 'programming', 'algorithm', 'system'],
      'friendly': ['welcome', 'hello', 'join', 'community', 'together']
    }

    const allText = [...titles, ...descriptions].join(' ').toLowerCase()
    const detectedTones: string[] = []

    Object.entries(toneIndicators).forEach(([tone, indicators]) => {
      const matches = indicators.filter(indicator => allText.includes(indicator)).length
      if (matches > 0) {
        detectedTones.push(tone)
      }
    })

    return detectedTones.length > 0 ? detectedTones : ['neutral']
  }

  /**
   * Analyze content complexity
   */
  private analyzeComplexity(titles: string[], descriptions: string[]): 'simple' | 'moderate' | 'complex' {
    const allText = [...titles, ...descriptions].join(' ')
    const avgWordLength = allText.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / allText.split(/\s+/).length

    const technicalTerms = ['implementation', 'optimization', 'architecture', 'methodology', 'framework'].filter(term =>
      allText.toLowerCase().includes(term)
    ).length

    if (avgWordLength > 6 || technicalTerms > 5) return 'complex'
    if (avgWordLength > 5 || technicalTerms > 2) return 'moderate'
    return 'simple'
  }

  /**
   * Analyze formality level
   */
  private analyzeFormality(titles: string[], descriptions: string[]): 'formal' | 'casual' | 'mixed' {
    const allText = [...titles, ...descriptions].join(' ').toLowerCase()

    const formalIndicators = ['therefore', 'furthermore', 'consequently', 'however', 'additionally', 'moreover']
    const casualIndicators = ['gonna', 'wanna', 'kinda', 'sorta', "i'm", "you're", 'lol', 'omg']

    const formalCount = formalIndicators.filter(indicator => allText.includes(indicator)).length
    const casualCount = casualIndicators.filter(indicator => allText.includes(indicator)).length

    if (formalCount > casualCount * 1.5) return 'formal'
    if (casualCount > formalCount * 1.5) return 'casual'
    return 'mixed'
  }

  /**
   * Identify content types
   */
  private identifyContentTypes(titles: string[], descriptions: string[]): string[] {
    const allText = [...titles, ...descriptions].join(' ').toLowerCase()

    const contentTypePatterns = {
      'Tutorial': ['tutorial', 'how to', 'guide', 'learn', 'step by step'],
      'Review': ['review', 'test', 'opinion', 'hands on', 'experience'],
      'News': ['news', 'update', 'latest', 'breaking', 'announcement'],
      'Interview': ['interview', 'conversation', 'discussion', 'talk'],
      'Demo': ['demo', 'demonstration', 'showcase', 'preview'],
      'Vlog': ['vlog', 'day in my life', 'my routine', 'behind the scenes'],
      'Challenge': ['challenge', 'try', 'attempt', 'experiment'],
      'Comparison': ['vs', 'versus', 'comparison', 'difference', 'better']
    }

    const detectedTypes: string[] = []
    Object.entries(contentTypePatterns).forEach(([type, patterns]) => {
      if (patterns.some(pattern => allText.includes(pattern))) {
        detectedTypes.push(type)
      }
    })

    return detectedTypes.length > 0 ? detectedTypes : ['General']
  }

  /**
   * Calculate posting frequency
   */
  private calculatePostingFrequency(videos: VideoData[]): string {
    if (videos.length < 2) return 'Insufficient data'

    const dates = videos.map(v => new Date(v.publishedAt)).sort((a, b) => a.getTime() - b.getTime())
    const oldestDate = dates[0]
    const newestDate = dates[dates.length - 1]
    const daysDiff = (newestDate.getTime() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)

    const avgDaysBetweenPosts = daysDiff / videos.length

    if (avgDaysBetweenPosts < 2) return 'Daily'
    if (avgDaysBetweenPosts < 4) return '2-3 times per week'
    if (avgDaysBetweenPosts < 8) return 'Weekly'
    if (avgDaysBetweenPosts < 15) return 'Bi-weekly'
    return 'Monthly'
  }

  /**
   * Check if a word is a stop word
   */
  private isStopWord(word: string): boolean {
    const stopWords = ['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us']
    return stopWords.includes(word.toLowerCase())
  }
}

export default YouTubeScraper