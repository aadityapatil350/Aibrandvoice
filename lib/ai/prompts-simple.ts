// Simplified, platform-specific prompts for better content generation

interface SimpleContentParams {
  platform: string // YOUTUBE, INSTAGRAM, TIKTOK, TWITTER, LINKEDIN, REDDIT, BLOG
  contentType: string
  topic: string
  goal: string // sales, engagement, reach, clicks, followers
  tone: string // professional, casual, viral, educational, storytelling, humorous, inspiring
  language: string
  targetAudience?: string
  keywords?: string[]
}

export function generatePlatformSpecificPrompt(params: SimpleContentParams): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    gu: 'Gujarati',
    bn: 'Bengali',
    pa: 'Punjabi',
  }

  const languageName = languageNames[params.language] || 'English'

  // Platform-specific instructions
  const platformInstructions: Record<string, string> = {
    YOUTUBE: `
Platform: YouTube
- Title: 50-60 characters, SEO-optimized with keywords
- Description: First 100-150 characters are critical (shown in search)
- Structure: Hook (first 30 sec) → Main content → Value → CTA
- Hashtags: 3-5 relevant hashtags above video links
- CTA Examples: "Subscribe for more!", "Check link in description", "Like if this helped"`,

    INSTAGRAM: `
Platform: Instagram (Post/Reel)
- Caption: First 125 characters show in feed (make them count!)
- Structure: Hook → Story/Value → Engagement → CTA
- Hashtags: 20-30 hashtags mix (5 trending, 15 niche, 5 broad)
- Visual: Describe what visuals would work
- CTA Examples: "Double tap if you agree", "Link in bio", "Save this for later"`,

    TIKTOK: `
Platform: TikTok
- Caption: Under 150 characters for best display
- Hook: First 3 seconds must stop the scroll
- Structure: Instant hook → Quick value → Viral moment → CTA
- Hashtags: 3-5 hashtags (include 1 trending)
- CTA Examples: "Follow for more", "Link in bio", "Duet this",
- Style: Authentic, trend-aware, native feel`,

    TWITTER: `
Platform: Twitter/X
- Tweet: Keep under 280 characters
- Thread: Break into 2-5 tweets for longer content
- Structure: Hook tweet → Main points → Engagement
- Hashtags: 1-2 relevant hashtags
- CTA Examples: "Retweet if you agree", "Reply with thoughts", "Click link below"`,

    LINKEDIN: `
Platform: LinkedIn
- Post: Under 1300 characters (3-4 minute read)
- Structure: Professional hook → Problem → Solution → CTA
- Style: Professional but conversational, use line breaks
- Hashtags: 3-5 industry/professional hashtags
- CTA Examples: "Connect with me", "Comment below", "Visit our website",
- Best practices: Use personal stories, statistics, industry insights`,

    REDDIT: `
Platform: Reddit
- Title: Make it intriguing but not clickbait (under 80 chars)
- Post: Use proper formatting (paragraphs, bullet points)
- Style: Authentic, transparent, community-focused
- Hook: First paragraph establishes credibility
- CTA: Ask questions, invite discussion (not self-promotion)
- Best practices: No hashtags, provide value, follow subreddit rules`,

    BLOG: `
Platform: Blog/Website
- Title: SEO-optimized, 50-60 characters
- Meta Description: 150-160 characters for search results
- Content: Use headings (H2, H3), bullet points, short paragraphs
- Structure: Hook → Problem → Solution → CTA
- Keywords: Naturally include in first 100 words
- CTA Examples: "Read more", "Subscribe", "Get started", "Learn more"`,
  }

  // Goal-specific instructions
  const goalInstructions: Record<string, string> = {
    sales: 'Focus on: Benefits over features, social proof, urgency, clear value proposition, overcoming objections, buying path',
    engagement: 'Focus on: Conversation starters, questions, emotional content, relatable stories, community building, shareability',
    reach: 'Focus on: Broad appeal, trending topics, shareability, viral potential, discoverability, universal themes',
    clicks: 'Focus on: Curiosity gaps, clear CTAs, value proposition, urgency, link placement, compelling teasers',
    followers: 'Focus on: Value delivery, personality, consistency, community invitation, follow-worthy content, expertise showcase',
  }

  // Tone-specific instructions
  const toneInstructions: Record<string, string> = {
    professional: 'Use: Clear language, industry terminology, credible tone, minimal slang, expert perspective',
    casual: 'Use: Conversational tone, everyday language, friendly approach, relatable examples, natural expressions',
    viral: 'Use: High energy, provocative statements, quotable moments, emotional triggers, trend-aware phrases',
    educational: 'Use: Clear explanations, teaching format, examples and analogies, step-by-step approach, valuable insights',
    storytelling: 'Use: Narrative format, personal anecdotes, emotional journey, relatable characters, transformation arc',
    humorous: 'Use: Light-hearted tone, clever wordplay, relatable humor, entertaining style, witty observations',
    inspiring: 'Use: Motivational language, transformation focus, empowerment, positive outlook, aspirational messaging',
  }

  // Build the prompt
  let prompt = `You are a expert social media content creator specializing in ${params.platform}. Create engaging, platform-native content.

TOPIC: ${params.topic}
CONTENT TYPE: ${params.contentType}
GOAL: ${params.goal.toUpperCase()} - ${goalInstructions[params.goal] || goalInstructions.engagement}
TONE: ${params.tone} - ${toneInstructions[params.tone] || toneInstructions.professional}
LANGUAGE: ${languageName} (Write ALL content in ${languageName})

${platformInstructions[params.platform] || platformInstructions.INSTAGRAM}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}\n` : ''}${params.keywords && params.keywords.length > 0 ? `KEYWORDS TO INCLUDE: ${params.keywords.join(', ')}\n` : ''}

---

Generate complete, ready-to-post content in this exact JSON format:

{
  "title": "Compelling title optimized for ${params.platform}",
  "hook": "Attention-grabbing first line that stops the scroll",
  "content": "Main content body with platform-appropriate formatting and length",
  "cta": "Clear call-to-action that drives the ${params.goal} goal",
  "hashtags": ["hashtag1", "hashtag2", "hashtag3"],
  "visualIdea": "Brief description of suggested visuals (for visual platforms)"
}

CRITICAL:
- Return VALID JSON only - no markdown, no code blocks, no explanations
- Make content feel NATIVE to ${params.platform} (not generic)
- Write in ${languageName} with natural expressions
- Optimize for the ${params.goal} goal
- Match the ${params.tone} tone perfectly
- Include platform-specific best practices
- Hashtags should be relevant and platform-appropriate`

  return prompt
}

export function generateBulkContentPrompt(params: SimpleContentParams, count: number): string {
  const languageNames: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam',
    mr: 'Marathi',
    gu: 'Gujarati',
    bn: 'Bengali',
    pa: 'Punjabi',
  }
  const languageName = languageNames[params.language] || 'English'

  const basePrompt = generatePlatformSpecificPrompt(params)

  return `${basePrompt.replace('Generate complete, ready-to-post content in this exact JSON format:', `Generate ${count} COMPLETELY DIFFERENT content variations in this JSON format:`)}

{
  "variations": [
    {
      "title": "Variation 1 - compelling title",
      "hook": "Variation 1 - attention-grabbing hook",
      "content": "Variation 1 - main content with different angle",
      "cta": "Variation 1 - call-to-action",
      "hashtags": ["var1_tag1", "var1_tag2", "var1_tag3"],
      "visualIdea": "Variation 1 - visual concept"
    },
    {
      "title": "Variation 2 - different approach",
      "hook": "Variation 2 - unique hook",
      "content": "Variation 2 - alternative content with new perspective",
      "cta": "Variation 2 - call-to-action",
      "hashtags": ["var2_tag1", "var2_tag2", "var2_tag3"],
      "visualIdea": "Variation 2 - visual concept"
    }
    // ... ${count} total variations
  ]
}

CRITICAL:
- Each variation must be COMPLETELY UNIQUE
- Use different angles, hooks, and approaches
- All must be optimized for ${params.goal} goal
- Maintain ${params.tone} tone throughout
- All in ${languageName}`
}
