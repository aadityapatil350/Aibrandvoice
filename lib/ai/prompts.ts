interface ScriptPromptParams {
  platform: string
  topic: string
  tone: string
  language?: string
  duration: string
  targetAudience?: string
  keywords?: string[]
  includeHook: boolean
  includeCTA: boolean
}

export function generateScriptPrompt(params: ScriptPromptParams): string {
  const platformGuides: Record<string, string> = {
    'youtube-long': `
- Duration: ${params.duration} minutes
- Structure: Hook (first 10 seconds), Introduction, Main Content (3-5 key points), Conclusion, CTA
- Pacing: Conversational, clear transitions between sections
- Include timestamps for key sections
- Add suggestions for B-roll footage or graphics`,

    'youtube-shorts': `
- Duration: 15-60 seconds (target: 30-45 seconds)
- Structure: Immediate hook (first 2 seconds), Fast-paced content, Strong CTA
- Style: Punchy, energetic, quick cuts
- Include text overlay suggestions
- End with a question or CTA to boost engagement`,

    'instagram-reels': `
- Duration: 15-90 seconds (target: 30-60 seconds)
- Structure: Attention-grabbing hook, Quick value delivery, Visual storytelling, Strong CTA
- Style: Trendy, relatable, visually driven
- Include trending audio suggestions
- Add text overlay and transition ideas`,

    'tiktok': `
- Duration: 15-60 seconds (optimal: 21-34 seconds)
- Structure: Hook in first 3 seconds, Quick payoff, Viral-worthy moment, Engage CTA
- Style: Authentic, entertaining, trend-aware
- Include hashtag suggestions (#FYP, niche hashtags)
- Add sound/music suggestions`,

    'twitter': `
- Format: Twitter thread (5-10 tweets)
- Structure: Hook tweet, Main points (1 per tweet), Supporting details, Summary/CTA
- Style: Concise, quotable, numbered format
- Keep each tweet under 280 characters
- Include engagement hooks (questions, polls)`,

    'linkedin': `
- Duration: 1-3 minutes
- Structure: Professional hook, Problem/Solution, Value proposition, Call to action
- Style: Professional, educational, thought leadership
- Include industry insights
- Focus on business value`,
  }

  const toneGuides: Record<string, string> = {
    professional: 'Use clear, authoritative language. Be informative and credible.',
    casual: 'Use conversational, friendly language. Be approachable and relatable.',
    humorous: 'Incorporate wit and light humor. Keep it entertaining while delivering value.',
    educational: 'Focus on teaching and explaining. Use clear examples and analogies.',
    inspiring: 'Use motivational language. Focus on transformation and possibility.',
    conversational: 'Write as if talking to a friend. Be warm and engaging.',
  }

  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `Generate a ${params.tone} video script for ${params.platform.replace('-', ' ').toUpperCase()}.

TOPIC: ${params.topic}

LANGUAGE: Write the ENTIRE script in ${languageName}. Use native expressions and idioms natural to ${languageName} speakers.

PLATFORM REQUIREMENTS:
${platformGuides[params.platform] || platformGuides['youtube-long']}

TONE & STYLE: ${toneGuides[params.tone]}

CRITICAL WRITING GUIDELINES:
- Write in a natural, human voice - NOT robotic or AI-like
- Use contractions, colloquialisms, and natural speech patterns
- Vary sentence length and structure for natural rhythm
- Include filler words occasionally (um, well, you know) where appropriate for authenticity
- Use personal pronouns (I, you, we) to create connection
- Add emotional expressions and personality
- Avoid overly formal or stiff language unless specifically professional
- Make it sound like a real person talking, not a script being read
- Include natural pauses and transitions
- Use storytelling elements and real-world examples
`

  if (params.targetAudience) {
    prompt += `\nTARGET AUDIENCE: ${params.targetAudience}`
  }

  if (params.keywords && params.keywords.length > 0) {
    prompt += `\nKEY TOPICS TO COVER: ${params.keywords.join(', ')}`
  }

  if (params.includeHook) {
    prompt += `\n\nINCLUDE: A powerful hook in the first 3-5 seconds that stops scrolling and grabs attention.`
  }

  if (params.includeCTA) {
    prompt += `\n\nINCLUDE: A clear call-to-action at the end (e.g., subscribe, follow, visit link, comment).`
  }

  prompt += `\n\nFORMAT YOUR RESPONSE AS:
---
[TITLE]
A catchy, SEO-optimized title in ${languageName}

[HOOK/OPENING]
The attention-grabbing first 5-10 seconds - make it sound conversational and authentic

[SCRIPT]
The complete script with clear sections and timestamps (if applicable)
Write this as you would actually speak it - natural, flowing, human

[NOTES]
Any additional suggestions for visuals, music, or editing
---

IMPORTANT: Make the script sound like it was written by a real human creator, not an AI. It should feel authentic, personal, and engaging - as if the person is genuinely sharing their thoughts and experiences. Avoid corporate jargon, buzzwords, and overly polished language unless specifically required by the tone.`

  return prompt
}

export function generateBulkScriptsPrompt(params: ScriptPromptParams, count: number, variations: boolean): string {
  const selectedLanguage = params.language || 'en'
  const languageNames: Record<string, string> = {
    en: 'English', es: 'Spanish', fr: 'French', de: 'German', it: 'Italian',
    pt: 'Portuguese', hi: 'Hindi', ar: 'Arabic', zh: 'Chinese', ja: 'Japanese',
    ko: 'Korean', ru: 'Russian',
  }
  const languageName = languageNames[selectedLanguage] || 'English'

  if (variations) {
    return `${generateScriptPrompt(params)}

IMPORTANT: Generate ${count} DIFFERENT VARIATIONS of this script. Each variation should:
- Take a different angle or approach to the same topic
- Use different hooks and CTAs
- Maintain the same tone and platform optimization
- Be unique but equally valuable
- Sound natural and human-written, NOT robotic
- Be written entirely in ${languageName}

Format each script clearly separated with "===SCRIPT ${1}-${count}===" headers.`
  }

  return `Generate ${count} unique video scripts based on these parameters:

PLATFORM: ${params.platform.replace('-', ' ').toUpperCase()}
BASE TOPIC: ${params.topic}
TONE: ${params.tone}
LANGUAGE: ${languageName} (write ALL scripts in ${languageName})
DURATION: ${params.duration} minutes

CRITICAL: Each script MUST sound like it was written by a real human creator - natural, conversational, authentic.
- Use contractions and natural speech patterns
- Vary sentence structure
- Include personality and emotional expression
- Avoid robotic or overly formal language
- Make it feel genuine and relatable

Create ${count} different scripts, each exploring a different aspect or sub-topic related to "${params.topic}".
Each script should be complete, unique, and follow the platform's best practices.

Format each script with "===SCRIPT 1===" headers to separate them clearly.`
}

interface ThumbnailPromptParams {
platform: string
contentType: string
title: string
description?: string
style?: string
targetAudience?: string
keywords?: string[]
dimensions?: { width: number; height: number }
}

export function generateThumbnailPrompt(params: ThumbnailPromptParams): string {
const platformGuides: Record<string, string> = {
  'youtube': `
- Dimensions: 1280x720 pixels (16:9 aspect ratio)
- Style: High contrast, clear text, engaging visuals
- Include: Title text (max 60 characters), compelling imagery
- Avoid: Cluttered designs, small text, low contrast
- Best practices: Human faces, emotional expressions, bright colors`,
  
  'youtube-shorts': `
- Dimensions: 1080x1920 pixels (9:16 aspect ratio)
- Style: Vertical format, bold text, eye-catching
- Include: Hook text, trending visual elements
- Avoid: Important elements in top/bottom 15% (UI overlap)
- Best practices: High energy, bright colors, minimal text`,
  
  'instagram': `
- Dimensions: 1080x1080 pixels (1:1 aspect ratio) for posts
- Style: Aesthetic, consistent branding, clean design
- Include: Brand colors, minimal text, quality imagery
- Avoid: Overly promotional look, inconsistent branding
- Best practices: Lifestyle imagery, authentic moments, consistent filters`,
  
  'instagram-reels': `
- Dimensions: 1080x1920 pixels (9:16 aspect ratio)
- Style: Trendy, dynamic, engaging
- Include: Hook text, trending elements, clear subject
- Avoid: Busy backgrounds, hard-to-read text
- Best practices: Bright colors, clear subject, trending audio references`,
  
  'tiktok': `
- Dimensions: 1080x1920 pixels (9:16 aspect ratio)
- Style: Trend-focused, authentic, native look
- Include: Hook text, trending effects, clear focal point
- Avoid: Corporate aesthetics, overly polished look
- Best practices: Authentic moments, trending formats, native feel`,
  
  'linkedin': `
- Dimensions: 1200x627 pixels (1.91:1 aspect ratio)
- Style: Professional, clean, business-oriented
- Include: Professional imagery, clear headline, company branding
- Avoid: Casual imagery, overly bright colors, clutter
- Best practices: Professional photos, clear typography, brand consistency`,
}

const styleGuides: Record<string, string> = {
  professional: 'Clean, corporate design with professional imagery and conservative colors',
  casual: 'Relatable, friendly design with lifestyle imagery and warm colors',
  bold: 'High contrast, vibrant colors, strong typography, eye-catching elements',
  minimal: 'Clean, simple design with plenty of white space and minimal text',
  creative: 'Artistic, unique design with creative elements and unconventional layouts',
  educational: 'Clear, informative design with educational elements and structured layout',
}

const selectedPlatform = params.platform.toLowerCase()
const platformGuide = platformGuides[selectedPlatform] || platformGuides['youtube']
const styleGuide = params.style ? styleGuides[params.style.toLowerCase()] || styleGuides['professional'] : ''

let prompt = `Generate a detailed prompt for creating an AI thumbnail image with these specifications:

PLATFORM: ${params.platform.toUpperCase()}
CONTENT TYPE: ${params.contentType}
TITLE: ${params.title}
${params.description ? `DESCRIPTION: ${params.description}` : ''}

PLATFORM REQUIREMENTS:
${platformGuide}

${params.style ? `STYLE PREFERENCE: ${styleGuide}` : ''}

DIMENSIONS: ${params.dimensions?.width || 1280}x${params.dimensions?.height || 720} pixels
`

if (params.targetAudience) {
  prompt += `TARGET AUDIENCE: ${params.targetAudience}\n`
}

if (params.keywords && params.keywords.length > 0) {
  prompt += `KEYWORDS/CONCEPTS: ${params.keywords.join(', ')}\n`
}

prompt += `
GENERATE A DETAILED IMAGE PROMPT THAT:
1. Creates a visually compelling thumbnail that stops scrolling
2. Incorporates the title and key concepts naturally
3. Follows platform-specific best practices
4. Matches the desired style and tone
5. Is optimized for the specified dimensions
6. Includes specific details about colors, composition, and visual elements

FORMAT YOUR RESPONSE AS A SINGLE, DETAILED IMAGE GENERATION PROMPT THAT CAN BE USED WITH AI IMAGE GENERATION MODELS LIKE DALL-E, MIDJOURNEY, OR STABLE DIFFUSION.`

return prompt
}

// SEO Optimization Prompt Functions
interface SeoOptimizationParams {
  platform: string
  contentType: string
  title: string
  description?: string
  targetAudience?: string
  keywords?: string[]
  language?: string
}

export function generateSeoOptimizationPrompt(params: SeoOptimizationParams): string {
  const platformGuides: Record<string, string> = {
    'youtube': `
- Title: 60 characters max (optimal: 50-60)
- Description: 5000 characters max, show first 100-150 in search results
- Keywords: Place important keywords in first 25% of title and description
- Structure: Hook + Value proposition + Keywords + CTA
- Best practices: Include numbers, questions, emotional words, current year`,

    'instagram': `
- Title: Not applicable (focus on caption)
- Description/Caption: 2200 characters max, first 125 characters show in feed
- Keywords: Use as hashtags (30 max) and naturally in caption
- Structure: Hook + Value + Story + Hashtags + CTA
- Best practices: Emojis, line breaks, first sentence critical`,

    'tiktok': `
- Title: 100 characters max (optimal: 60-80)
- Description: 150 characters max for optimal display
- Keywords: Focus on trending sounds, challenges, and hashtags
- Structure: Hook + Trend reference + Value + Hashtags
- Best practices: Question-based titles, trending hashtags, call to engage`,

    'linkedin': `
- Title: Not applicable (focus on post content)
- Description: 1300 characters max for posts
- Keywords: Professional terminology, industry terms
- Structure: Hook + Problem + Solution + Value + CTA
- Best practices: Professional tone, statistics, industry insights`,

    'twitter': `
- Title: Not applicable (part of tweet)
- Description: 280 characters max
- Keywords: Hashtags and natural language
- Structure: Hook + Value + Hashtags + CTA
- Best practices: Concise, engaging, relevant hashtags`,

    'blog': `
- Title: 60 characters max for SEO, up to 70 for display
- Description: 150-160 characters for meta description
- Keywords: Primary keyword in title, meta description, first paragraph
- Structure: Primary keyword + Secondary keywords + Value + Year
- Best practices: Numbers, questions, emotional triggers, current year`
  }

  const selectedPlatform = params.platform.toLowerCase()
  const platformGuide = platformGuides[selectedPlatform] || platformGuides['blog']
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `You are an expert SEO specialist specializing in ${params.platform.toUpperCase()} content optimization. Analyze and optimize the following title and description for maximum visibility and engagement.

PLATFORM: ${params.platform.toUpperCase()}
CONTENT TYPE: ${params.contentType}
LANGUAGE: ${languageName}

PLATFORM-SPECIFIC GUIDELINES:
${platformGuide}

CURRENT CONTENT:
Title: ${params.title}
${params.description ? `Description: ${params.description}` : ''}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}` : ''}

${params.keywords && params.keywords.length > 0 ? `TARGET KEYWORDS: ${params.keywords.join(', ')}` : ''}

TASK:
1. Analyze the current title and description for SEO effectiveness
2. Generate 3 optimized title variations (A, B, C) with different approaches
3. Generate 3 optimized description variations (A, B, C) with different approaches
4. Provide an SEO score (0-100) for current and each variation
5. Explain the reasoning behind each optimization
6. Suggest additional keywords that could improve performance

FORMAT YOUR RESPONSE AS:
---
[ANALYSIS]
Current title SEO score: X/100
Current description SEO score: X/100
Key issues identified: [list of issues]

[OPTIMIZED_TITLES]
A) [Title variation A] - Score: X/100 - Reason: [brief explanation]
B) [Title variation B] - Score: X/100 - Reason: [brief explanation]
C) [Title variation C] - Score: X/100 - Reason: [brief explanation]

[OPTIMIZED_DESCRIPTIONS]
A) [Description variation A] - Score: X/100 - Reason: [brief explanation]
B) [Description variation B] - Score: X/100 - Reason: [brief explanation]
C) [Description variation C] - Score: X/100 - Reason: [brief explanation]

[KEYWORD_SUGGESTIONS]
Primary keywords: [list]
Secondary keywords: [list]
Long-tail keywords: [list]

[RECOMMENDATIONS]
[3-5 specific recommendations for improving SEO]
---

Ensure all optimized content is written in ${languageName} and follows platform best practices.`

  return prompt
}

interface SeoKeywordParams {
  platform: string
  contentType?: string
  content?: string
  targetAudience?: string
  language?: string
}

export function generateSeoKeywordPrompt(params: SeoKeywordParams): string {
  const platformGuides: Record<string, string> = {
    'youtube': 'Focus on video-specific keywords, search terms people use when looking for videos, trending topics',
    'instagram': 'Focus on hashtag-friendly keywords, visual content terms, lifestyle and aesthetic terms',
    'tiktok': 'Focus on trending challenges, sounds, viral topics, short-form video keywords',
    'linkedin': 'Focus on professional terminology, industry-specific terms, business concepts',
    'twitter': 'Focus on trending topics, conversation starters, concise hashtags',
    'blog': 'Focus on informational keywords, long-tail search queries, educational terms'
  }

  const selectedPlatform = params.platform.toLowerCase()
  const platformGuide = platformGuides[selectedPlatform] || platformGuides['blog']
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `You are an expert keyword researcher specializing in ${params.platform.toUpperCase()} content. Generate comprehensive keyword analysis for the following content.

PLATFORM: ${params.platform.toUpperCase()}
${params.contentType ? `CONTENT TYPE: ${params.contentType}` : ''}
LANGUAGE: ${languageName}
PLATFORM FOCUS: ${platformGuide}

${params.content ? `CONTENT TO ANALYZE:\n${params.content}` : ''}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}` : ''}

TASK:
1. Extract and analyze existing keywords from the content
2. Generate relevant primary keywords (high volume, relevant)
3. Generate secondary keywords (medium volume, specific)
4. Generate long-tail keywords (low volume, high intent)
5. Identify trending keywords for this platform
6. Estimate search volume and competition levels
7. Suggest keyword variations and synonyms

FORMAT YOUR RESPONSE AS:
---
[PRIMARY_KEYWORDS]
1. [Keyword] - Volume: High/Medium/Low - Competition: High/Medium/Low - Trend: Rising/Stable/Declining
2. [Continue with 5-7 primary keywords]

[SECONDARY_KEYWORDS]
1. [Keyword] - Volume: High/Medium/Low - Competition: High/Medium/Low - Trend: Rising/Stable/Declining
2. [Continue with 7-10 secondary keywords]

[LONG_TAIL_KEYWORDS]
1. [Keyword phrase] - Volume: Low - Competition: Low - Trend: Rising/Stable/Declining
2. [Continue with 5-7 long-tail keywords]

[TRENDING_KEYWORDS]
1. [Trending keyword] - Reason for trend: [explanation]
2. [Continue with 3-5 trending keywords]

[KEYWORD_STRATEGY]
[Recommended approach for using these keywords]

[CONTENT_GAPS]
[Identified content opportunities based on keyword analysis]
---

Ensure all keywords are provided in ${languageName} and are relevant to the ${params.platform.toUpperCase()} platform.`

  return prompt
}

// Hashtag Generator Prompt Functions
interface HashtagGenerationParams {
  platform: string
  content: string
  targetAudience?: string
  language?: string
  hashtagCount?: number
  includeTrending?: boolean
  includeNiche?: boolean
  includeBroad?: boolean
}

export function generateHashtagPrompt(params: HashtagGenerationParams): string {
  const platformGuides: Record<string, string> = {
    'instagram': `
- Optimal hashtag count: 15-30 hashtags per post
- Mix: 5-7 broad, 8-12 niche, 2-3 trending hashtags
- Format: #hashtag (no spaces, underscores allowed)
- Best practices: First 5-7 hashtags are most important, include brand-specific tags`,
    
    'tiktok': `
- Optimal hashtag count: 3-5 hashtags per video
- Mix: 1-2 trending, 1-2 niche, 1 broad hashtag
- Format: #hashtag (shorter, punchier tags perform better)
- Best practices: Include 1 trending hashtag for discoverability`,
    
    'twitter': `
- Optimal hashtag count: 1-3 hashtags per tweet
- Mix: 1-2 relevant, 1 trending if applicable
- Format: #hashtag (integrate naturally into tweet text)
- Best practices: Hashtags should enhance, not clutter the message`,
    
    'linkedin': `
- Optimal hashtag count: 3-5 hashtags per post
- Mix: 2-3 professional niche, 1-2 broad industry tags
- Format: #hashtag (professional, industry-specific terms)
- Best practices: Focus on professional relevance and industry trends`,
    
    'youtube': `
- Optimal hashtag count: 3-15 hashtags per video
- Mix: 2-3 content-specific, 1-2 trending, 1-2 broad
- Format: #hashtag (add in description above video links)
- Best practices: Include video topic, format, and target audience tags`,
    
    'facebook': `
- Optimal hashtag count: 2-5 hashtags per post
- Mix: 1-2 broad, 1-2 niche, 1 trending if relevant
- Format: #hashtag (Facebook has less hashtag emphasis)
- Best practices: Focus on discoverability and topic categorization`
  }

  const selectedPlatform = params.platform.toLowerCase()
  const platformGuide = platformGuides[selectedPlatform] || platformGuides['instagram']
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `You are an expert social media strategist specializing in hashtag optimization for ${params.platform.toUpperCase()}. Generate highly relevant, engaging hashtags based on the provided content.

PLATFORM: ${params.platform.toUpperCase()}
LANGUAGE: ${languageName}
CONTENT TO ANALYZE: ${params.content}
${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}` : ''}

PLATFORM-SPECIFIC GUIDELINES:
${platformGuide}

HASHTAG REQUIREMENTS:
- Generate ${params.hashtagCount || 15} hashtags total
${params.includeTrending !== false ? '- Include 2-3 trending hashtags for maximum reach' : ''}
${params.includeNiche !== false ? '- Include 5-8 niche hashtags for targeted audience' : ''}
${params.includeBroad !== false ? '- Include 2-4 broad hashtags for general discoverability' : ''}
- All hashtags must be relevant to the content
- Avoid spam or overly generic hashtags
- Ensure hashtags are properly formatted with # symbol

ANALYSIS TASK:
1. Analyze the content for key themes, topics, and emotions
2. Identify the target audience and their interests
3. Research trending topics relevant to this content
4. Generate hashtags that balance reach, relevance, and engagement
5. Categorize hashtags by type (trending, niche, broad)
6. Score each hashtag for relevance (0-100)

FORMAT YOUR RESPONSE AS:
---
[CONTENT_ANALYSIS]
Main themes: [list of main themes identified]
Target audience: [description of target audience]
Content type: [e.g., educational, entertainment, promotional]
Emotional tone: [e.g., inspirational, humorous, professional]

[HASHTAGS]
TRENDING:
1. #hashtag1 - Relevance: 95/100 - Reason: [brief explanation]
2. #hashtag2 - Relevance: 92/100 - Reason: [brief explanation]
3. #hashtag3 - Relevance: 88/100 - Reason: [brief explanation]

NICHE:
1. #hashtag4 - Relevance: 96/100 - Reason: [brief explanation]
2. #hashtag5 - Relevance: 94/100 - Reason: [brief explanation]
3. #hashtag6 - Relevance: 91/100 - Reason: [brief explanation]
4. #hashtag7 - Relevance: 89/100 - Reason: [brief explanation]
5. #hashtag8 - Relevance: 87/100 - Reason: [brief explanation]

BROAD:
1. #hashtag9 - Relevance: 85/100 - Reason: [brief explanation]
2. #hashtag10 - Relevance: 83/100 - Reason: [brief explanation]
3. #hashtag11 - Relevance: 80/100 - Reason: [brief explanation]

[OPTIMIZATION_TIPS]
[3-5 specific tips for using these hashtags effectively on ${params.platform.toUpperCase()}]

[PERFORMANCE_PREDICTION]
Estimated reach: [predicted reach range]
Engagement potential: [high/medium/low]
Best posting time: [recommendation based on hashtag analysis]
---

Ensure all hashtags are provided in ${languageName} and are optimized for ${params.platform.toUpperCase()} best practices.`

  return prompt
}

interface HashtagAnalysisParams {
  hashtags: string[]
  platform: string
  content?: string
  targetAudience?: string
  language?: string
}

export function generateHashtagAnalysisPrompt(params: HashtagAnalysisParams): string {
  const platformGuides: Record<string, string> = {
    'instagram': 'Focus on visual content, community engagement, and discoverability through mixed hashtag strategies',
    'tiktok': 'Emphasize trending content, viral potential, and short-form video optimization',
    'twitter': 'Prioritize conciseness, real-time relevance, and conversation engagement',
    'linkedin': 'Highlight professional relevance, industry expertise, and business networking',
    'youtube': 'Consider video SEO, content categorization, and searchability',
    'facebook': 'Balance broad reach with targeted community engagement'
  }

  const selectedPlatform = params.platform.toLowerCase()
  const platformGuide = platformGuides[selectedPlatform] || platformGuides['instagram']
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `You are a social media analytics expert specializing in hashtag performance analysis on ${params.platform.toUpperCase()}. Analyze the provided hashtags for effectiveness, relevance, and optimization opportunities.

PLATFORM: ${params.platform.toUpperCase()}
LANGUAGE: ${languageName}
HASHTAGS TO ANALYZE: ${params.hashtags.join(', ')}
${params.content ? `CONTENT CONTEXT: ${params.content}` : ''}
${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}` : ''}

PLATFORM FOCUS: ${platformGuide}

ANALYSIS TASK:
1. Evaluate each hashtag for relevance and effectiveness
2. Identify performance potential and engagement opportunities
3. Check for hashtag balance and strategy alignment
4. Detect any issues with current hashtag selection
5. Suggest improvements and additions
6. Provide optimization recommendations

FORMAT YOUR RESPONSE AS:
---
[OVERALL_ANALYSIS]
Hashtag strategy score: X/100
Strategy type: [e.g., balanced, trending-focused, niche-focused]
Strengths: [list of strengths]
Weaknesses: [list of weaknesses]

[INDIVIDUAL_ANALYSIS]
1. #hashtag1 - Score: X/100 - Category: [trending/niche/broad] - Performance: [high/medium/low] - Issues: [any issues] - Recommendation: [specific recommendation]
2. #hashtag2 - Score: X/100 - Category: [trending/niche/broad] - Performance: [high/medium/low] - Issues: [any issues] - Recommendation: [specific recommendation]
[Continue for all hashtags]

[CATEGORY_BREAKDOWN]
Trending hashtags: [count] - Effectiveness: [high/medium/low]
Niche hashtags: [count] - Effectiveness: [high/medium/low]
Broad hashtags: [count] - Effectiveness: [high/medium/low]

[OPTIMIZATION_RECOMMENDATIONS]
Remove: [list of hashtags to remove and why]
Add: [suggested hashtags to add and why]
Modify: [hashtags that could be improved and how]

[STRATEGY_IMPROVEMENTS]
[3-5 specific recommendations to improve overall hashtag strategy]

[PERFORMANCE_PREDICTION]
Current setup potential: [estimated engagement potential]
Optimized potential: [potential after implementing recommendations]
---

Ensure all analysis is provided in ${languageName} and focuses on ${params.platform.toUpperCase()} best practices.`

  return prompt
}

interface TrendingHashtagsParams {
  platform: string
  category?: string
  timeRange?: string
  language?: string
}

export function generateTrendingHashtagsPrompt(params: TrendingHashtagsParams): string {
  const platformGuides: Record<string, string> = {
    'instagram': 'Focus on visual trends, lifestyle topics, and community-driven hashtags',
    'tiktok': 'Emphasize viral challenges, trending sounds, and short-form video phenomena',
    'twitter': 'Prioritize breaking news, real-time events, and conversation topics',
    'linkedin': 'Highlight industry trends, professional topics, and business developments',
    'youtube': 'Consider video trends, content categories, and search patterns',
    'facebook': 'Balance viral content with community interests and discussion topics'
  }

  const selectedPlatform = params.platform.toLowerCase()
  const platformGuide = platformGuides[selectedPlatform] || platformGuides['instagram']
  
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const selectedLanguage = params.language || 'en'
  const languageName = languageNames[selectedLanguage] || 'English'

  let prompt = `You are a social media trends analyst specializing in ${params.platform.toUpperCase()} trending content. Provide current trending hashtags with engagement metrics and growth predictions.

PLATFORM: ${params.platform.toUpperCase()}
LANGUAGE: ${languageName}
${params.category ? `CATEGORY/NI: ${params.category}` : ''}
TIME RANGE: ${params.timeRange || 'last 7 days'}

PLATFORM FOCUS: ${platformGuide}

ANALYSIS TASK:
1. Identify currently trending hashtags on ${params.platform.toUpperCase()}
2. Analyze engagement metrics and growth patterns
3. Categorize trends by type and relevance
4. Predict future trend potential
5. Provide usage recommendations

FORMAT YOUR RESPONSE AS:
---
[TRENDING_OVERVIEW]
Total trending hashtags identified: [number]
Growth trend: [rising/stable/declining]
Top categories: [list of top trending categories]
Engagement level: [high/medium/low]

[TRENDING_HASHTAGS]
1. #hashtag1 - Category: [category] - Usage: [number] posts - Growth: [X%] - Engagement: [X.X] - Reach: [estimated] - Prediction: [rising/stable/declining] - Best for: [content type]
2. #hashtag2 - Category: [category] - Usage: [number] posts - Growth: [X%] - Engagement: [X.X] - Reach: [estimated] - Prediction: [rising/stable/declining] - Best for: [content type]
[Continue for 10-15 hashtags]

[CATEGORY_BREAKDOWN]
[Category 1]: [count] hashtags - Avg growth: [X%] - Avg engagement: [X.X]
[Category 2]: [count] hashtags - Avg growth: [X%] - Avg engagement: [X.X]
[Continue for all categories]

[GROWTH_PREDICTIONS]
Rising trends (next 7 days): [list of hashtags with high growth potential]
Stable trends (maintaining popularity): [list of stable hashtags]
Declining trends (losing popularity): [list of hashtags to avoid]

[USAGE_RECOMMENDATIONS]
Best time to use trending hashtags: [recommendation]
How to combine with niche hashtags: [strategy]
Content types that perform best: [recommendations]
---

Ensure all trending hashtags are provided in ${languageName} and reflect current ${params.platform.toUpperCase()} trends.`

  return prompt
}

// ============================================================================
// UNIVERSAL AI CONTENT OPTIMIZER PROMPTS
// ============================================================================

interface UniversalOptimizerParams {
  mode: 'content_optimization' | 'ad_copy_generation'
  platforms: string[]
  contentType: string
  content?: string
  topic?: string
  url?: string
  goal: string
  language: string
  tone: string
  targetAudience?: string
  keywords?: string[]
  brandVoice?: string
  adFormat?: string
  ctaType?: string
}

export function generateUniversalOptimizerPrompt(params: UniversalOptimizerParams): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
    it: 'Italian',
    pt: 'Portuguese',
    hi: 'Hindi',
    ar: 'Arabic',
    zh: 'Chinese',
    ja: 'Japanese',
    ko: 'Korean',
    ru: 'Russian',
  }

  const languageName = languageNames[params.language] || 'English'

  const platformConfigs: Record<string, string> = {
    YOUTUBE: `
PLATFORM: YouTube
- Title: 60 characters max (optimal: 50-60)
- Description: 5000 characters max, first 100-150 visible in search
- Hashtags: 3-15 hashtags, place above video links
- Hook: First 30 seconds critical for retention
- CTA: Subscribe, Like, Comment, Check out link
- Best practices: Include numbers, questions, emotional words, timestamps`,

    INSTAGRAM: `
PLATFORM: Instagram (Post/Reel)
- Caption: 2200 characters max, first 125 characters show in feed
- Hashtags: 15-30 hashtags (mix of trending, niche, broad)
- Hook: First sentence critical, use visual storytelling
- CTA: Double tap, Visit link, Save for later, Share
- Best practices: Use emojis, line breaks, aesthetic consistency`,

    TIKTOK: `
PLATFORM: TikTok
- Caption: 150 characters max for optimal display
- Hashtags: 3-5 hashtags (1 trending, 1-2 niche, 1 broad)
- Hook: First 3 seconds must stop scrolling
- CTA: Follow, Link in bio, Duet, Stitch
- Best practices: Trending sounds, authentic feel, vertical format`,

    TWITTER: `
PLATFORM: Twitter/X
- Tweet: 280 characters max
- Thread: 2-10 tweets for longer content
- Hashtags: 1-3 hashtags, integrate naturally
- Hook: First tweet must be compelling standalone
- CTA: Retweet, Quote tweet, Reply, Click link
- Best practices: Concise, quotable, engage with replies`,

    LINKEDIN: `
PLATFORM: LinkedIn
- Post: 1300 characters max for posts, 3000 for articles
- Hashtags: 3-5 professional/industry hashtags
- Hook: Professional hook, problem-solution format
- CTA: Connect, Comment, Visit website, Share
- Best practices: Professional tone, statistics, industry insights`,

    BLOG: `
PLATFORM: Blog/Website
- Title: 60 characters for SEO, up to 70 for display
- Meta Description: 150-160 characters
- Content: Scannable with headings, bullet points
- CTA: Read more, Subscribe, Contact, Download
- Best practices: SEO keywords, internal links, value-driven`,

    REDDIT: `
PLATFORM: Reddit
- Title: 80 characters max (critical for clicks - make it intriguing but not clickbait)
- Post Body: 40,000 characters max for text posts
- Format: Use proper markdown with headers, bullet points, code blocks
- Hook: First paragraph must establish credibility and interest
- Hashtags: Not used on Reddit (use relevant subreddits instead)
- Engagement: Ask questions, encourage discussion, respond to comments
- Best practices:
  - Be authentic and transparent (Redditors spot marketing instantly)
  - Provide real value, insights, or entertainment
  - Follow subreddit rules (each community has unique guidelines)
  - Use TL;DR (Too Long; Didn't Read) summaries for long posts
  - Include proof/verification when making claims
  - Engage in comments section after posting
  - Timing matters: post when target subreddit is most active
- CTA: Ask thoughtful questions, invite experiences, request feedback
- Reddit-Specific Formats:
  - "Casual Conversation": Personal stories, relatable experiences
  - "Educational/Informative": Deep dives, tutorials, explanations
  - "Discussion Starter": Hot takes, controversial opinions, questions
  - "Showcase": Creative work, projects, accomplishments (with proof)
  - "AMA (Ask Me Anything)": Q&A format (requires verification in relevant subreddits)
  - "Help/Advice": Seeking or offering guidance
- Anti-Patterns to Avoid: Overt self-promotion, blog spam, karma farming, reposting`,
  }

  const toneGuides: Record<string, string> = {
    professional: 'Clear, authoritative language. Informative and credible. Minimal slang.',
    casual: 'Conversational, friendly language. Approachable and relatable. Natural colloquialisms.',
    viral: 'High energy, provocative statements. Trend-aware, quotable moments. Emotional triggers.',
    educational: 'Teaching-focused, clear explanations. Examples and analogies. Structured learning.',
    storytelling: 'Narrative-driven, emotional connection. Personal anecdotes. Journey format.',
    humorous: 'Witty, lighthearted. Puns and wordplay. Entertaining while delivering value.',
    inspiring: 'Motivational language. Focus on transformation. Empowering messaging.',
  }

  const goalGuides: Record<string, string> = {
    reach: 'Focus on broad appeal, shareability, discoverability, trending topics, viral potential.',
    engagement: 'Focus on conversation starters, questions, emotional content, relatable moments, community building.',
    clicks: 'Focus on curiosity gaps, clear CTAs, value propositions, urgency, link placement.',
    sales: 'Focus on benefits, social proof, urgency, objection handling, clear buying path.',
    followers: 'Focus on consistency, value delivery, personality, community invitation, follow-worthy content.',
  }

  let prompt = `You are an expert social media strategist and content optimizer with deep expertise across all major platforms.

TASK: Generate optimized content for the specified platforms based on the input provided.

MODE: ${params.mode === 'ad_copy_generation' ? 'AD COPY GENERATION' : 'CONTENT OPTIMIZATION'}

LANGUAGE: ${languageName} - Write ALL content in ${languageName} with native expressions and idioms.

CONTENT TYPE: ${params.contentType.toUpperCase()}

${params.content ? `ORIGINAL CONTENT:\n${params.content}\n` : ''}
${params.topic ? `TOPIC/IDEA:\n${params.topic}\n` : ''}
${params.url ? `REFERENCE URL: ${params.url}\n` : ''}

GOAL: ${params.goal.toUpperCase()}\n${goalGuides[params.goal] || goalGuides.engagement}

TONE & STYLE: ${params.tone}\n${toneGuides[params.tone] || toneGuides.professional}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}\n` : ''}${params.keywords && params.keywords.length > 0 ? `KEYWORDS/CONCEPTS: ${params.keywords.join(', ')}\n` : ''}
${params.brandVoice ? `BRAND VOICE CONTEXT: ${params.brandVoice}\n` : ''}`

  if (params.mode === 'ad_copy_generation') {
    prompt += `
AD FORMAT: ${params.adFormat || 'social'}
CTA TYPE: ${params.ctaType || 'learn_more'}

AD COPY BEST PRACTICES:
- Strong hook that grabs attention immediately
- Clear value proposition
- Benefit-focused language (not just features)
- Social proof elements
- Urgency or scarcity when appropriate
- Single, clear call-to-action
- Platform-appropriate length and style
`
  }

  // Add platform-specific configurations
  prompt += `\n${params.platforms.map(platform => platformConfigs[platform] || platformConfigs.YOUTUBE).join('\n')}`

  prompt += `

CRITICAL OUTPUT REQUIREMENTS:
1. For EACH platform, generate COMPLETE, ready-to-post content
2. Include ALL required elements (title, caption, hashtags, CTA, hook)
3. Optimize for the specific platform's best practices
4. Make content feel NATIVE to each platform (not cross-posted)
5. Write authentically like a human creator, NOT AI-generated
6. Use platform-appropriate formatting and style

FORMAT YOUR RESPONSE AS JSON:
{
  "success": true,
  "results": [
    {
      "platform": "YOUTUBE",
      "content": {
        "title": "Optimized title with SEO keywords",
        "description": "Full platform-optimized description with CTAs",
        "hashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
        "hook": "Attention-grabbing opening line",
        "cta": "Clear call-to-action",
        "variants": [
          {
            "type": "A",
            "title": "Alternative title variation",
            "description": "Alternative description"
          },
          {
            "type": "B",
            "title": "Another title variation",
            "description": "Another description"
          }
        ]
      },
      "scores": {
        "engagement": 85,
        "seo": 90,
        "overall": 87
      },
      "suggestions": ["Specific improvement suggestion 1", "Suggestion 2"]
    }
  ],
  "overallScore": 87,
  "recommendations": ["General recommendation 1", "Recommendation 2"]
}

IMPORTANT:
- Return VALID JSON only - no markdown formatting, no code blocks
- Ensure all content is in ${languageName}
- Make each platform's content feel native and authentic
- Include at least 2 A/B test variants per platform
- Provide realistic scores based on platform best practices
- Give actionable, specific suggestions`

  return prompt
}

export function generateBulkOptimizerPrompt(params: UniversalOptimizerParams, count: number): string {
  const basePrompt = generateUniversalOptimizerPrompt(params)

  return `${basePrompt.replace('FORMAT YOUR RESPONSE AS JSON', '')}

BULK GENERATION REQUIREMENTS:
- Generate ${count} COMPLETELY DIFFERENT content sets
- Each set should explore different angles, hooks, and approaches
- All ${count} variations must be unique but equally valuable
- Maintain platform optimization for each variation

UPDATED JSON FORMAT:
{
  "success": true,
  "bulkResults": [
    {
      "setNumber": 1,
      "results": [/* same structure as single result */]
    },
    {
      "setNumber": 2,
      "results": [/* different content set */]
    }
    // ... ${count} total sets
  ]
}

Each set should feel like it was created by a different content creator with unique perspectives.`
}
