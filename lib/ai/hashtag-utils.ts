/**
 * Hashtag Generator Utilities
 * 
 * This file contains functions for calculating hashtag relevance scores,
 * analyzing trending hashtags, categorizing hashtags, and providing
 * hashtag recommendations for different social media platforms.
 */

export interface HashtagScoreBreakdown {
  relevanceScore: number
  popularityScore: number
  competitionScore: number
  trendScore: number
  platformOptimizationScore: number
  overallScore: number
}

export interface HashtagAnalysisResult {
  hashtag: string
  score: number
  breakdown: HashtagScoreBreakdown
  category: string
  isTrending: boolean
  usage: number
  growth: number
  recommendations: string[]
}

export interface HashtagSetAnalysis {
  totalScore: number
  categoryDistribution: Record<string, number>
  trendingCount: number
  nicheCount: number
  broadCount: number
  recommendations: string[]
  issues: string[]
}

export interface TrendingHashtag {
  hashtag: string
  category: string
  usage: number
  growth: number
  engagement: number
  posts: number
  reach: number
  lastUpdated: Date
}

/**
 * Calculate hashtag relevance score based on content and platform
 */
export function calculateHashtagRelevanceScore(
  hashtag: string,
  content: string,
  platform: string,
  targetAudience?: string
): number {
  let score = 0
  const maxScore = 100
  
  // Content relevance (40% of total)
  const contentScore = calculateContentRelevance(hashtag, content)
  score += contentScore * 0.4
  
  // Platform optimization (25% of total)
  const platformScore = calculatePlatformOptimization(hashtag, platform)
  score += platformScore * 0.25
  
  // Audience targeting (20% of total)
  const audienceScore = calculateAudienceTargeting(hashtag, targetAudience)
  score += audienceScore * 0.2
  
  // Hashtag quality (15% of total)
  const qualityScore = calculateHashtagQuality(hashtag)
  score += qualityScore * 0.15
  
  return Math.min(Math.round(score), maxScore)
}

/**
 * Calculate content relevance score for a hashtag
 */
function calculateContentRelevance(hashtag: string, content: string): number {
  if (!content || content.length === 0) return 30 // Base score if no content
  
  const contentLower = content.toLowerCase()
  const hashtagLower = hashtag.toLowerCase().replace('#', '')
  
  let score = 30 // Base score
  
  // Exact match in content
  if (contentLower.includes(hashtagLower)) {
    score += 40
  }
  
  // Partial matches
  const words = contentLower.split(/\s+/)
  const hashtagWords = hashtagLower.split(/[\s_-]/)
  
  for (const word of hashtagWords) {
    if (words.includes(word)) {
      score += 15
    }
  }
  
  // Semantic relevance (simple keyword matching)
  const relatedKeywords = getRelatedKeywords(hashtagLower)
  for (const keyword of relatedKeywords) {
    if (contentLower.includes(keyword)) {
      score += 5
    }
  }
  
  return Math.min(score, 100)
}

/**
 * Calculate platform optimization score for a hashtag
 */
function calculatePlatformOptimization(hashtag: string, platform: string): number {
  let score = 50 // Base score
  
  const hashtagLower = hashtag.toLowerCase().replace('#', '')
  const hashtagLength = hashtagLower.length
  
  switch (platform.toLowerCase()) {
    case 'instagram':
      // Instagram favors 5-20 characters hashtags
      if (hashtagLength >= 5 && hashtagLength <= 20) score += 30
      else if (hashtagLength >= 3 && hashtagLength <= 25) score += 15
      
      // Bonus for popular formats
      if (hashtagLower.includes('trending') || hashtagLower.includes('viral')) score += 10
      if (/^[a-z]+$/.test(hashtagLower)) score += 10 // No numbers or special chars
      break
      
    case 'tiktok':
      // TikTok favors shorter, punchier hashtags
      if (hashtagLength >= 3 && hashtagLength <= 15) score += 30
      else if (hashtagLength <= 20) score += 15
      
      // Bonus for trending formats
      if (hashtagLower.includes('fyp') || hashtagLower.includes('viral') || hashtagLower.includes('trending')) score += 15
      if (hashtagLower.match(/^[a-z0-9]+$/)) score += 5 // Alphanumeric is fine
      break
      
    case 'twitter':
      // Twitter favors concise hashtags due to character limit
      if (hashtagLength <= 10) score += 30
      else if (hashtagLength <= 15) score += 15
      
      // Bonus for conversation hashtags
      if (hashtagLower.match(/^[a-z]+$/)) score += 10
      break
      
    case 'linkedin':
      // LinkedIn favors professional, descriptive hashtags
      if (hashtagLength >= 8 && hashtagLength <= 25) score += 30
      else if (hashtagLength >= 5 && hashtagLength <= 30) score += 15
      
      // Bonus for professional terms
      if (hashtagLower.includes('business') || hashtagLower.includes('professional') || 
          hashtagLower.includes('career') || hashtagLower.includes('industry')) score += 10
      break
      
    case 'youtube':
      // YouTube favors descriptive, searchable hashtags
      if (hashtagLength >= 5 && hashtagLength <= 25) score += 30
      else if (hashtagLength >= 3 && hashtagLength <= 30) score += 15
      
      // Bonus for content-specific terms
      if (hashtagLower.includes('tutorial') || hashtagLower.includes('review') || 
          hashtagLower.includes('guide') || hashtagLower.includes('howto')) score += 10
      break
      
    default:
      // Generic platform optimization
      if (hashtagLength >= 5 && hashtagLength <= 20) score += 20
      break
  }
  
  return Math.min(score, 100)
}

/**
 * Calculate audience targeting score for a hashtag
 */
function calculateAudienceTargeting(hashtag: string, targetAudience?: string): number {
  if (!targetAudience || targetAudience.length === 0) return 50 // Neutral score
  
  const audienceLower = targetAudience.toLowerCase()
  const hashtagLower = hashtag.toLowerCase().replace('#', '')
  
  let score = 30 // Base score
  
  // Age group targeting
  const ageGroups = ['teen', 'young', 'adult', 'mature', 'senior', 'genz', 'millennial', 'genx', 'boomer']
  for (const age of ageGroups) {
    if (audienceLower.includes(age) && hashtagLower.includes(age)) {
      score += 20
    }
  }
  
  // Interest targeting
  const interests = ['tech', 'fashion', 'food', 'travel', 'fitness', 'music', 'art', 'gaming', 'sports']
  for (const interest of interests) {
    if (audienceLower.includes(interest) && hashtagLower.includes(interest)) {
      score += 15
    }
  }
  
  // Professional targeting
  const professional = ['business', 'career', 'startup', 'entrepreneur', 'marketing', 'finance']
  for (const prof of professional) {
    if (audienceLower.includes(prof) && hashtagLower.includes(prof)) {
      score += 15
    }
  }
  
  // Geographic targeting
  const geo = ['global', 'local', 'city', 'country', 'international', 'regional']
  for (const g of geo) {
    if (audienceLower.includes(g) && hashtagLower.includes(g)) {
      score += 10
    }
  }
  
  return Math.min(score, 100)
}

/**
 * Calculate hashtag quality score
 */
function calculateHashtagQuality(hashtag: string): number {
  let score = 50 // Base score
  
  const hashtagLower = hashtag.toLowerCase().replace('#', '')
  
  // Length appropriateness
  if (hashtagLower.length >= 3 && hashtagLower.length <= 20) {
    score += 20
  } else if (hashtagLower.length >= 2 && hashtagLower.length <= 25) {
    score += 10
  }
  
  // Readability
  if (/^[a-z]+$/.test(hashtagLower)) {
    score += 15 // Simple, readable
  } else if (/^[a-z0-9]+$/.test(hashtagLower)) {
    score += 10 // Acceptable
  } else if (hashtagLower.includes('_') || hashtagLower.includes('-')) {
    score += 5 // Less ideal but usable
  }
  
  // Avoid spam indicators
  const spamIndicators = ['follow', 'like', 'comment', 'share', 'tagsforlikes', 'instagood']
  const isSpammy = spamIndicators.some(spam => hashtagLower.includes(spam))
  if (!isSpammy) {
    score += 15
  }
  
  // Uniqueness (simple heuristic)
  const commonWords = ['the', 'and', 'for', 'with', 'best', 'good', 'new', 'top']
  const isCommon = commonWords.some(word => hashtagLower === word)
  if (!isCommon && hashtagLower.length > 4) {
    score += 10
  }
  
  return Math.min(score, 100)
}

/**
 * Get related keywords for semantic relevance checking
 */
function getRelatedKeywords(hashtag: string): string[] {
  const keywordMap: Record<string, string[]> = {
    'tech': ['technology', 'software', 'digital', 'computer', 'programming'],
    'food': ['cooking', 'recipe', 'restaurant', 'cuisine', 'meal'],
    'travel': ['vacation', 'trip', 'journey', 'adventure', 'destination'],
    'fitness': ['workout', 'exercise', 'health', 'gym', 'training'],
    'fashion': ['style', 'clothing', 'outfit', 'trend', 'wear'],
    'business': ['startup', 'entrepreneur', 'company', 'corporate', 'industry'],
    'music': ['song', 'album', 'artist', 'concert', 'melody'],
    'art': ['creative', 'design', 'painting', 'drawing', 'artistic'],
    'gaming': ['game', 'player', 'video', 'console', 'esports'],
    'sports': ['athlete', 'competition', 'match', 'team', 'player']
  }
  
  const related: string[] = []
  for (const [key, keywords] of Object.entries(keywordMap)) {
    if (hashtag.includes(key)) {
      related.push(...keywords)
    }
  }
  
  return related
}

/**
 * Categorize hashtags based on their characteristics
 */
export function categorizeHashtag(hashtag: string, platform: string): string {
  const hashtagLower = hashtag.toLowerCase().replace('#', '')
  
  // Trending indicators
  if (hashtagLower.includes('trending') || hashtagLower.includes('viral') || 
      hashtagLower.includes('fyp') || hashtagLower.includes('hot')) {
    return 'trending'
  }
  
  // Niche indicators
  if (hashtagLower.length > 15 || hashtagLower.includes('community') || 
      hashtagLower.includes('niche') || hashtagLower.includes('specific')) {
    return 'niche'
  }
  
  // Broad indicators
  if (['love', 'instagood', 'photooftheday', 'fashion', 'beautiful', 'happy', 'cute', 'followme'].includes(hashtagLower)) {
    return 'broad'
  }
  
  // Platform-specific categories
  switch (platform.toLowerCase()) {
    case 'instagram':
      if (hashtagLower.includes('reels') || hashtagLower.includes('igtv')) return 'instagram'
      if (hashtagLower.includes('story') || hashtagLower.includes('igtv')) return 'instagram'
      break
      
    case 'tiktok':
      if (hashtagLower.includes('duet') || hashtagLower.includes('stitch')) return 'tiktok'
      if (hashtagLower.includes('challenge') || hashtagLower.includes('trend')) return 'tiktok'
      break
      
    case 'linkedin':
      if (hashtagLower.includes('professional') || hashtagLower.includes('career')) return 'professional'
      if (hashtagLower.includes('business') || hashtagLower.includes('industry')) return 'business'
      break
  }
  
  // Content-based categories
  if (['tutorial', 'howto', 'guide', 'tips', 'learn'].some(word => hashtagLower.includes(word))) {
    return 'educational'
  }
  
  if (['funny', 'meme', 'humor', 'lol', 'comedy'].some(word => hashtagLower.includes(word))) {
    return 'entertainment'
  }
  
  if (['motivation', 'inspiration', 'success', 'goals'].some(word => hashtagLower.includes(word))) {
    return 'inspirational'
  }
  
  return 'general'
}

/**
 * Calculate overall hashtag set analysis
 */
export function analyzeHashtagSet(
  hashtags: string[],
  content: string,
  platform: string,
  targetAudience?: string
): HashtagSetAnalysis {
  const analyses = hashtags.map(hashtag => ({
    hashtag,
    score: calculateHashtagRelevanceScore(hashtag, content, platform, targetAudience),
    category: categorizeHashtag(hashtag, platform)
  }))
  
  // Calculate category distribution
  const categoryDistribution: Record<string, number> = {}
  analyses.forEach(({ category }) => {
    categoryDistribution[category] = (categoryDistribution[category] || 0) + 1
  })
  
  // Count different types
  const trendingCount = analyses.filter(a => a.category === 'trending').length
  const nicheCount = analyses.filter(a => a.category === 'niche').length
  const broadCount = analyses.filter(a => a.category === 'broad').length
  
  // Calculate total score
  const totalScore = Math.round(
    analyses.reduce((sum, a) => sum + a.score, 0) / hashtags.length
  )
  
  // Generate recommendations
  const recommendations = generateHashtagSetRecommendations(
    analyses,
    platform,
    hashtags.length
  )
  
  // Identify issues
  const issues = identifyHashtagSetIssues(analyses, platform)
  
  return {
    totalScore,
    categoryDistribution,
    trendingCount,
    nicheCount,
    broadCount,
    recommendations,
    issues
  }
}

/**
 * Generate recommendations for hashtag sets
 */
function generateHashtagSetRecommendations(
  analyses: Array<{ hashtag: string; score: number; category: string }>,
  platform: string,
  totalHashtags: number
): string[] {
  const recommendations: string[] = []
  
  // Hashtag count recommendations
  const optimalCounts: Record<string, { min: number; max: number; ideal: number }> = {
    instagram: { min: 5, max: 30, ideal: 15 },
    tiktok: { min: 3, max: 10, ideal: 5 },
    twitter: { min: 1, max: 3, ideal: 2 },
    linkedin: { min: 3, max: 10, ideal: 5 },
    youtube: { min: 3, max: 15, ideal: 8 }
  }
  
  const optimal = optimalCounts[platform.toLowerCase()] || optimalCounts.instagram
  
  if (totalHashtags < optimal.min) {
    recommendations.push(`Add more hashtags (aim for ${optimal.ideal}-${optimal.max} for ${platform})`)
  } else if (totalHashtags > optimal.max) {
    recommendations.push(`Reduce hashtags to ${optimal.max} or fewer for better engagement on ${platform}`)
  }
  
  // Category balance recommendations
  const trendingCount = analyses.filter(a => a.category === 'trending').length
  const nicheCount = analyses.filter(a => a.category === 'niche').length
  const broadCount = analyses.filter(a => a.category === 'broad').length
  
  if (trendingCount === 0) {
    recommendations.push('Include 1-2 trending hashtags to increase discoverability')
  }
  
  if (nicheCount === 0) {
    recommendations.push('Add niche hashtags to target specific audiences')
  }
  
  if (broadCount > totalHashtags * 0.5) {
    recommendations.push('Reduce broad hashtags and add more specific, relevant tags')
  }
  
  // Quality recommendations
  const lowScoreHashtags = analyses.filter(a => a.score < 60)
  if (lowScoreHashtags.length > 0) {
    recommendations.push(`Improve or replace low-scoring hashtags: ${lowScoreHashtags.map(h => h.hashtag).join(', ')}`)
  }
  
  return recommendations
}

/**
 * Identify issues with hashtag sets
 */
function identifyHashtagSetIssues(
  analyses: Array<{ hashtag: string; score: number; category: string }>,
  platform: string
): string[] {
  const issues: string[] = []
  
  // Check for low overall score
  const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length
  if (avgScore < 60) {
    issues.push('Overall hashtag relevance is low - consider revising your hashtag strategy')
  }
  
  // Check for duplicates or similar hashtags
  const hashtagTexts = analyses.map(a => a.hashtag.toLowerCase())
  const duplicates = hashtagTexts.filter((item, index) => hashtagTexts.indexOf(item) !== index)
  if (duplicates.length > 0) {
    issues.push('Remove duplicate or very similar hashtags')
  }
  
  // Check for spam indicators
  const spammyHashtags = analyses.filter(a => {
    const text = a.hashtag.toLowerCase()
    return ['tagsforlikes', 'follow4follow', 'like4like', 'instagood'].some(spam => text.includes(spam))
  })
  if (spammyHashtags.length > 0) {
    issues.push('Remove spam-like hashtags that may reduce engagement')
  }
  
  // Platform-specific issues
  switch (platform.toLowerCase()) {
    case 'instagram':
      if (analyses.length < 5) {
        issues.push('Instagram performs best with 5-30 hashtags per post')
      }
      break
      
    case 'tiktok':
      if (analyses.length > 10) {
        issues.push('TikTok works best with fewer, more targeted hashtags (3-5 is optimal)')
      }
      break
      
    case 'twitter':
      if (analyses.length > 3) {
        issues.push('Twitter has character limits - use 1-3 highly relevant hashtags')
      }
      break
  }
  
  return issues
}

/**
 * Simulate trending hashtag data (in production, this would come from API calls)
 */
export function getTrendingHashtags(platform: string, category?: string): TrendingHashtag[] {
  // This is a mock implementation
  // In production, you would fetch real data from platform APIs or third-party services
  
  const baseTrending: TrendingHashtag[] = [
    {
      hashtag: '#trending',
      category: 'trending',
      usage: 1000000,
      growth: 15.5,
      engagement: 8.2,
      posts: 50000,
      reach: 5000000,
      lastUpdated: new Date()
    },
    {
      hashtag: '#viral',
      category: 'trending',
      usage: 850000,
      growth: 12.3,
      engagement: 7.8,
      posts: 42000,
      reach: 4200000,
      lastUpdated: new Date()
    },
    {
      hashtag: '#fyp',
      category: 'tiktok',
      usage: 2000000,
      growth: 8.7,
      engagement: 6.5,
      posts: 100000,
      reach: 10000000,
      lastUpdated: new Date()
    },
    {
      hashtag: '#instagood',
      category: 'instagram',
      usage: 1500000,
      growth: 5.2,
      engagement: 5.1,
      posts: 75000,
      reach: 7500000,
      lastUpdated: new Date()
    },
    {
      hashtag: '#love',
      category: 'broad',
      usage: 5000000,
      growth: 2.1,
      engagement: 4.3,
      posts: 250000,
      reach: 25000000,
      lastUpdated: new Date()
    }
  ]
  
  // Filter by category if specified
  if (category && category !== 'all') {
    return baseTrending.filter(tag => tag.category === category)
  }
  
  // Platform-specific filtering
  switch (platform.toLowerCase()) {
    case 'tiktok':
      return baseTrending.filter(tag => 
        tag.category === 'tiktok' || tag.category === 'trending'
      )
    case 'instagram':
      return baseTrending.filter(tag => 
        tag.category === 'instagram' || tag.category === 'trending' || tag.category === 'broad'
      )
    case 'twitter':
      return baseTrending.slice(0, 3) // Fewer for Twitter
    default:
      return baseTrending
  }
}

/**
 * Extract hashtags from text content
 */
export function extractHashtags(content: string): string[] {
  const hashtagRegex = /#[\w]+/g
  const matches = content.match(hashtagRegex) || []
  return matches.map(tag => tag.trim())
}

/**
 * Clean and normalize hashtag text
 */
export function normalizeHashtag(hashtag: string): string {
  return hashtag
    .replace(/^#+/, '') // Remove leading #
    .replace(/[^a-zA-Z0-9\s_-]/g, '') // Remove special chars except spaces, underscore, dash
    .replace(/\s+/g, '') // Remove spaces
    .toLowerCase()
}