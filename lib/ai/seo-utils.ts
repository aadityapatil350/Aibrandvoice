/**
 * SEO Scoring Algorithms and Utilities
 * 
 * This file contains functions for calculating SEO scores,
 * analyzing content, and providing SEO recommendations.
 */

export interface SeoScoreBreakdown {
  titleScore: number
  descriptionScore: number
  keywordScore: number
  readabilityScore: number
  platformOptimizationScore: number
  overallScore: number
}

export interface SeoAnalysisResult {
  score: number
  breakdown: SeoScoreBreakdown
  recommendations: string[]
  issues: string[]
}

/**
 * Calculate SEO score for title based on platform-specific criteria
 */
export function calculateTitleSeoScore(title: string, platform: string, keywords: string[] = []): number {
  let score = 0
  const maxScore = 100
  
  // Length scoring (30% of total)
  const lengthScore = calculateLengthScore(title, platform, 'title')
  score += lengthScore * 0.3
  
  // Keyword presence (25% of total)
  const keywordScore = calculateKeywordPresenceScore(title, keywords)
  score += keywordScore * 0.25
  
  // Readability and engagement (20% of total)
  const engagementScore = calculateEngagementScore(title)
  score += engagementScore * 0.2
  
  // Platform optimization (25% of total)
  const platformScore = calculatePlatformOptimizationScore(title, platform, 'title')
  score += platformScore * 0.25
  
  return Math.min(Math.round(score), maxScore)
}

/**
 * Calculate SEO score for description based on platform-specific criteria
 */
export function calculateDescriptionSeoScore(description: string, platform: string, keywords: string[] = []): number {
  let score = 0
  const maxScore = 100
  
  // Length scoring (25% of total)
  const lengthScore = calculateLengthScore(description, platform, 'description')
  score += lengthScore * 0.25
  
  // Keyword presence (30% of total)
  const keywordScore = calculateKeywordPresenceScore(description, keywords)
  score += keywordScore * 0.3
  
  // Readability and structure (25% of total)
  const readabilityScore = calculateReadabilityScore(description)
  score += readabilityScore * 0.25
  
  // Platform optimization (20% of total)
  const platformScore = calculatePlatformOptimizationScore(description, platform, 'description')
  score += platformScore * 0.2
  
  return Math.min(Math.round(score), maxScore)
}

/**
 * Calculate optimal length score based on platform and content type
 */
function calculateLengthScore(content: string, platform: string, contentType: 'title' | 'description'): number {
  const platformLimits: Record<string, { title: { min: number; max: number; optimal: number }, description: { min: number; max: number; optimal: number } }> = {
    youtube: {
      title: { min: 30, max: 60, optimal: 50 },
      description: { min: 100, max: 5000, optimal: 150 }
    },
    instagram: {
      title: { min: 0, max: 0, optimal: 0 }, // Instagram doesn't use titles
      description: { min: 50, max: 2200, optimal: 125 }
    },
    tiktok: {
      title: { min: 30, max: 100, optimal: 70 },
      description: { min: 50, max: 150, optimal: 100 }
    },
    linkedin: {
      title: { min: 0, max: 0, optimal: 0 }, // LinkedIn doesn't use titles
      description: { min: 100, max: 1300, optimal: 300 }
    },
    twitter: {
      title: { min: 0, max: 0, optimal: 0 }, // Twitter doesn't use titles
      description: { min: 50, max: 280, optimal: 200 }
    },
    blog: {
      title: { min: 40, max: 60, optimal: 55 },
      description: { min: 120, max: 160, optimal: 150 }
    }
  }
  
  const limits = platformLimits[platform.toLowerCase()] || platformLimits.blog
  const contentLimits = limits[contentType]
  
  if (contentLimits.optimal === 0) return 100 // Platform doesn't use this content type
  
  const contentLength = content.length
  
  if (contentLength >= contentLimits.min && contentLength <= contentLimits.max) {
    // Calculate score based on how close to optimal
    const deviation = Math.abs(contentLength - contentLimits.optimal)
    const maxDeviation = Math.max(contentLimits.optimal - contentLimits.min, contentLimits.max - contentLimits.optimal)
    return Math.max(0, 100 - (deviation / maxDeviation) * 50)
  }
  
  return 0 // Outside acceptable range
}

/**
 * Calculate keyword presence score
 */
function calculateKeywordPresenceScore(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 50 // No keywords to check
  
  const contentLower = content.toLowerCase()
  let presentKeywords = 0
  let totalScore = 0
  
  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase()
    if (contentLower.includes(keywordLower)) {
      presentKeywords++
      // Bonus for exact match
      if (contentLower.includes(` ${keywordLower} `) || contentLower.startsWith(keywordLower) || contentLower.endsWith(keywordLower)) {
        totalScore += 100
      } else {
        totalScore += 80 // Partial match
      }
    }
  }
  
  if (presentKeywords === 0) return 0
  
  // Average score across all keywords, weighted by presence ratio
  const presenceRatio = presentKeywords / keywords.length
  return Math.round((totalScore / keywords.length) * presenceRatio)
}

/**
 * Calculate engagement score based on psychological triggers
 */
function calculateEngagementScore(title: string): number {
  let score = 50 // Base score
  
  // Check for numbers (studies show they increase CTR)
  if (/\d/.test(title)) score += 10
  
  // Check for questions
  if (title.includes('?')) score += 8
  
  // Check for emotional words
  const emotionalWords = ['amazing', 'incredible', 'shocking', 'surprising', 'ultimate', 'essential', 'critical', 'urgent']
  const hasEmotionalWords = emotionalWords.some(word => title.toLowerCase().includes(word))
  if (hasEmotionalWords) score += 8
  
  // Check for power words
  const powerWords = ['how', 'why', 'what', 'when', 'where', 'guide', 'tutorial', 'tips', 'secrets', 'hacks']
  const hasPowerWords = powerWords.some(word => title.toLowerCase().includes(word))
  if (hasPowerWords) score += 8
  
  // Check for year (timeliness)
  if (/\b(20\d{2})\b/.test(title)) score += 6
  
  // Check for listicle format
  if (/\b\d+\s*(ways|tips|steps|methods|techniques|reasons|facts|secrets)\b/i.test(title)) score += 10
  
  return Math.min(score, 100)
}

/**
 * Calculate readability score
 */
function calculateReadabilityScore(content: string): number {
  if (!content || content.length === 0) return 0
  
  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = content.split(/\s+/).filter(w => w.length > 0)
  
  if (sentences.length === 0 || words.length === 0) return 0
  
  const avgWordsPerSentence = words.length / sentences.length
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length
  
  let score = 50 // Base score
  
  // Optimal words per sentence: 15-20
  if (avgWordsPerSentence >= 15 && avgWordsPerSentence <= 20) {
    score += 20
  } else if (avgWordsPerSentence >= 10 && avgWordsPerSentence <= 25) {
    score += 10
  }
  
  // Optimal word length: 4-6 characters
  if (avgWordLength >= 4 && avgWordLength <= 6) {
    score += 20
  } else if (avgWordLength >= 3 && avgWordLength <= 7) {
    score += 10
  }
  
  // Check for variety in sentence length
  const sentenceLengths = sentences.map(s => s.split(/\s+/).length)
  const hasVariety = Math.max(...sentenceLengths) - Math.min(...sentenceLengths) > 5
  if (hasVariety) score += 10
  
  return Math.min(score, 100)
}

/**
 * Calculate platform-specific optimization score
 */
function calculatePlatformOptimizationScore(content: string, platform: string, contentType: 'title' | 'description'): number {
  let score = 50 // Base score
  
  const contentLower = content.toLowerCase()
  
  switch (platform.toLowerCase()) {
    case 'youtube':
      if (contentType === 'title') {
        // YouTube title optimizations
        if (content.includes('|') || content.includes('–')) score += 10 // Separator usage
        if (/\b(how to|tutorial|guide|review|tips|tricks)\b/.test(contentLower)) score += 15
        if (contentLower.includes('2024') || contentLower.includes('2025')) score += 10
      } else {
        // YouTube description optimizations
        if (content.includes('http') || content.includes('www.')) score += 10 // Links
        if (content.includes('#')) score += 10 // Hashtags
        if (content.length > 1000) score += 10 // Detailed descriptions
      }
      break
      
    case 'instagram':
      if (contentType === 'description') {
        if (content.includes('#')) score += 15 // Hashtags are crucial
        if (/@[a-zA-Z0-9_]+/.test(content)) score += 10 // Mentions
        if (content.includes('\n')) score += 10 // Line breaks for readability
      }
      break
      
    case 'tiktok':
      if (contentType === 'title') {
        if (content.includes('#')) score += 15 // Hashtags in title
        if (content.includes('?')) score += 10 // Questions encourage engagement
      }
      if (contentType === 'description') {
        if (content.includes('#')) score += 15
        if (/@[a-zA-Z0-9_]+/.test(content)) score += 10
      }
      break
      
    case 'linkedin':
      if (contentType === 'description') {
        if (/\b(how|why|what|when|where)\b/.test(contentLower)) score += 10 // Question formats
        if (content.includes('http') || content.includes('www.')) score += 10 // Links
        if (content.length > 500) score += 10 // Professional, detailed content
      }
      break
      
    case 'twitter':
      if (contentType === 'description') {
        if (content.includes('#')) score += 15 // Hashtags
        if (/@[a-zA-Z0-9_]+/.test(content)) score += 10 // Mentions
        if (content.length <= 280) score += 20 // Within character limit
      }
      break
      
    case 'blog':
      if (contentType === 'title') {
        if (content.includes('|') || content.includes('–')) score += 10
        if (/\b(ultimate|complete|definitive|comprehensive)\b/.test(contentLower)) score += 15
        if (contentLower.includes('2024') || contentLower.includes('2025')) score += 10
      }
      if (contentType === 'description') {
        if (content.length >= 120 && content.length <= 160) score += 20 // Meta description optimal length
      }
      break
  }
  
  return Math.min(score, 100)
}

/**
 * Generate comprehensive SEO analysis
 */
export function generateSeoAnalysis(
  title: string,
  description: string,
  platform: string,
  keywords: string[] = []
): SeoAnalysisResult {
  const titleScore = calculateTitleSeoScore(title, platform, keywords)
  const descriptionScore = calculateDescriptionSeoScore(description, platform, keywords)
  const keywordScore = calculateKeywordPresenceScore(`${title} ${description}`, keywords)
  const readabilityScore = calculateReadabilityScore(`${title} ${description}`)
  const platformOptimizationScore = Math.round(
    (calculatePlatformOptimizationScore(title, platform, 'title') + 
     calculatePlatformOptimizationScore(description, platform, 'description')) / 2
  )
  
  const breakdown: SeoScoreBreakdown = {
    titleScore,
    descriptionScore,
    keywordScore,
    readabilityScore,
    platformOptimizationScore,
    overallScore: Math.round((titleScore + descriptionScore + keywordScore + readabilityScore + platformOptimizationScore) / 5)
  }
  
  const recommendations = generateRecommendations(breakdown, title, description, platform, keywords)
  const issues = identifyIssues(breakdown, title, description, platform)
  
  return {
    score: breakdown.overallScore,
    breakdown,
    recommendations,
    issues
  }
}

/**
 * Generate SEO recommendations based on analysis
 */
function generateRecommendations(
  breakdown: SeoScoreBreakdown,
  title: string,
  description: string,
  platform: string,
  keywords: string[]
): string[] {
  const recommendations: string[] = []
  
  if (breakdown.titleScore < 70) {
    if (title.length < 30) {
      recommendations.push('Make your title more descriptive and engaging')
    } else if (title.length > 100) {
      recommendations.push('Shorten your title to improve readability and click-through rate')
    }
    
    if (!/\d/.test(title)) {
      recommendations.push('Add numbers to your title to increase engagement')
    }
    
    if (!title.includes('?') && !title.includes('!')) {
      recommendations.push('Consider using questions or emotional triggers in your title')
    }
  }
  
  if (breakdown.descriptionScore < 70) {
    if (description.length < 100) {
      recommendations.push('Expand your description to provide more value and context')
    }
    
    if (!description.includes(keywords[0])) {
      recommendations.push('Include your primary keyword in the description')
    }
    
    if (platform === 'youtube' && !description.includes('http')) {
      recommendations.push('Add relevant links to your description')
    }
  }
  
  if (breakdown.keywordScore < 70) {
    recommendations.push('Ensure your target keywords are naturally included in both title and description')
    recommendations.push('Consider using long-tail keywords for better targeting')
  }
  
  if (breakdown.readabilityScore < 70) {
    recommendations.push('Improve readability with shorter sentences and simpler language')
    recommendations.push('Use formatting like line breaks and emojis for better engagement')
  }
  
  if (breakdown.platformOptimizationScore < 70) {
    recommendations.push(`Add more platform-specific elements for ${platform}`)
    if (platform === 'instagram' || platform === 'tiktok') {
      recommendations.push('Include relevant hashtags to increase discoverability')
    }
  }
  
  return recommendations
}

/**
 * Identify SEO issues based on analysis
 */
function identifyIssues(
  breakdown: SeoScoreBreakdown,
  title: string,
  description: string,
  platform: string
): string[] {
  const issues: string[] = []
  
  if (breakdown.titleScore < 50) {
    issues.push('Title needs significant improvement for better SEO performance')
  }
  
  if (breakdown.descriptionScore < 50) {
    issues.push('Description needs significant improvement for better SEO performance')
  }
  
  if (breakdown.keywordScore < 50) {
    issues.push('Poor keyword optimization - target keywords are missing or poorly placed')
  }
  
  if (breakdown.readabilityScore < 50) {
    issues.push('Content readability is poor - may affect user engagement')
  }
  
  if (breakdown.platformOptimizationScore < 50) {
    issues.push(`Content is not optimized for ${platform} platform best practices`)
  }
  
  return issues
}

/**
 * Extract keywords from content using basic frequency analysis
 */
export function extractKeywords(content: string, maxKeywords: number = 10): string[] {
  if (!content || content.length === 0) return []
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those',
    'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them'
  ])
  
  const words = content.toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word))
  
  // Count word frequency
  const wordFrequency: Record<string, number> = {}
  for (const word of words) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  }
  
  // Sort by frequency and return top keywords
  return Object.entries(wordFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word)
}