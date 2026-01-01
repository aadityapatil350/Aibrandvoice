// Fixed prompts that properly handle content types and platform-specific formatting

interface ContentTypeParams {
  platform: string
  contentType: string
  topic: string
  goal: string
  tone: string
  language: string
  targetAudience?: string
  keywords?: string[]
  videoDuration?: string // For YouTube scripts
}

// Platform-specific content type configurations
const platformContentConfigs: Record<string, Record<string, string>> = {
  YOUTUBE: {
    TITLE: `Generate 5-10 optimized YouTube video title options.

TITLE BEST PRACTICES:
- Length: 50-60 characters for optimal display, up to 100 is acceptable
- Place primary keywords in first 5 words
- Use numbers for listicles (e.g., "5 Ways to...", "10 Tips for...")
- Create curiosity gaps without being misleading
- Use power words: Amazing, Secret, Ultimate, Complete, Step-by-Step
- Match the {TONE} style throughout

TITLE STYLES TO INCLUDE:
1. **Listicle**: "X Ways to..." or "X Tips for..."
2. **How-To**: "How to..." with clear outcome
3. **Question**: "Why..." or "Can You..."
4. **Bold Statement**: Strong claim or revelation
5. **Comparison**: "X vs Y" or "Better Than..."
6. **Urgency**: "Stop...", "Don't...", "Before You..."

FOR EACH TITLE, PROVIDE:
- The title itself (in quotes)
- Brief explanation of strategy (why it works)
- Target CTR prediction (High/Medium/Low)

RESPONSE FORMAT:
Option 1: "[Title]"
Strategy: [Why this title works]
CTR: [High/Medium/Low]

Option 2: "[Title]"
Strategy: [Why this title works]
CTR: [High/Medium/Low]

[Continue for all options]

RECOMMENDATIONS AT END:
🏆 Best for Search (SEO)
🎯 Best for Click-Through
⚡ Most Creative/Risky`,

    DESCRIPTION: `Generate an engaging video description (first 100-150 characters are critical).
Structure: Hook → Value proposition → Content summary → CTA → Links → Hashtags
Include: SEO keywords naturally, timestamps for long videos

Format: Return complete description with newlines.`,

    POST: `Generate an engaging YouTube Community post (max 500 characters).
Style: Casual, conversational, behind-the-scenes feel
Include: Poll question or engaging statement

Format: Return complete post text.`,

    SCRIPT: `Generate a complete YouTube video script.

SCRIPT STRUCTURE:
1. **Hook/Opening** (first 30 seconds): Grab attention immediately
2. **Introduction**: Brief context and what viewers will learn
3. **Main Content**: Organized into clear sections with key points
4. **Conclusion**: Summary and key takeaways
5. **Call-to-Action**: Subscribe, like, comment, link

SCRIPT STYLE:
- Conversational and natural (say "hey guys" not "hello viewers")
- Include personal anecdotes and examples
- Add personality and energy
- Use transitions between sections
- Include [PAUSE] markers for emphasis
- Add visual cues in brackets like [SHOW CHART], [B-ROLL:...]

DURATION GUIDELINES:
- Hook must be in first 30 seconds
- Main content should deliver value throughout
- Pacing should match the video length
- Include timestamps for sections if video is 10+ minutes

Format: Complete script with clear sections, visual cues, and natural dialogue.`,
  },

  INSTAGRAM: {
    CAPTION: `Generate an Instagram post caption (2200 characters max, first 125 critical).
Structure: Hook → Story/value → Engagement → CTA → Hashtags
Style: {TONE}, conversational, uses line breaks and emojis naturally
First line: Must stop the scroll

Format: Complete caption with 20-30 hashtags at the end.`,

    REEL: `Generate an Instagram Reel script (15-90 seconds, optimal 30-60).
Structure: Visual hook → Quick value → Viral moment → CTA
Include: [ON SCREEN:] text overlay suggestions, [AUDIO:] mood suggestions
Format: Vertical video, 9:16 aspect ratio

Format: Script with visual/audio cues in brackets.`,

    STORY: `Generate an Instagram Story sequence (3-5 slides).
Each slide: 1-2 seconds, minimal text, visual focus
Include: Interactive elements (polls, questions, stickers)
Format: Slide-by-slide breakdown

Format:
Slide 1: [description]
Slide 2: [description]
etc.`,

    CAROUSEL: `Generate an Instagram carousel outline (5-10 slides).
Each slide: Single key point or visual
Cover: Strong headline, stopping power
Last slide: CTA
Content flow: Tell a story across slides

Format:
Slide 1 (Cover): [text/visual]
Slide 2: [content]
etc.`,

    SCRIPT: `Generate an Instagram Reel/Video script.

SCRIPT STRUCTURE:
1. **Visual Hook** (first 1-3 seconds): Grab attention instantly
2. **Problem/Setup**: Quick context or relatable situation
3. **Solution/Content**: Main value delivery
4. **Payoff/Result**: Satisfying conclusion or result
5. **Call-to-Action**: Follow, like, share, link in bio

SCRIPT STYLE:
- Fast-paced and energetic
- Visual-first thinking (describe what's on screen)
- Trending audio suggestions
- Text overlay ideas
- Quick cuts and transitions
- Include [CUT TO], [TEXT ON SCREEN], [SOUND EFFECT] cues

DURATION GUIDELINES:
- 15-30 sec: Ultra-fast, single key point, instant payoff
- 1-3 min: Build story, 2-3 key points, more detailed explanation

Format: Complete script with visual/audio cues, timing suggestions, and text overlays.`,
  },

  TWITTER: {
    POST: `Generate a single tweet (under 280 characters).
Make it: Quotable, valuable, engaging
Include: 1-2 relevant hashtags, space for engagement

Format: Complete tweet text.`,

    THREAD: `Generate a Twitter thread (5-8 tweets, each under 280 chars).
Tweet 1: Strong hook, standalone value
Tweets 2-6: Main content, one point per tweet
Final tweet: Summary + CTA
Numbering: Use 1/8, 2/8 format

Format: Each tweet on new line with numbering.`,
  },

  LINKEDIN: {
    POST: `Generate a LinkedIn post (under 1300 characters, 3-4 min read).
Structure: Professional hook → Problem → Solution → Key insights → CTA
Style: {TONE}, use line breaks, personal tone
Format: Short paragraphs, bullet points for readability
Include: 2-3 relevant industry hashtags

Format: Complete post with proper formatting.`,

    ARTICLE: `Generate a LinkedIn article outline.
Structure: Compelling headline → Introduction → 3-5 key sections → Conclusion
Each section: Main point + bullet points
Length: 1500-2000 words when expanded
Style: Thought leadership, actionable insights

Format: Structured outline with headings.`,
  },

  REDDIT: {
    REDDIT_POST: `Generate a Reddit text post.
Title: Intriguing but not clickbait (under 80 chars)
Body: Use proper markdown, tell a story or provide value
Style: Authentic, transparent, community-focused
Format: Paragraphs, bullet points, TL;DR at end
No: Self-promotion, blog spam, excessive marketing

Format: Title first, then body with markdown.`,

    REDDIT_COMMENT: `Generate an engaging Reddit comment.
Add value to the discussion, be helpful
Style: Conversational, knowledgeable, not salesy
Length: 1-3 paragraphs

Format: Complete comment text.`,

    REDDIT_AMA: `Generate an AMA (Ask Me Anything) introduction.
Establish: Credibility, background, why you're doing this
Include: Suggested questions to get started
Style: Authentic, transparent, ready for anything

Format: Introduction + 3-5 starter questions.`,
  },

  BLOG: {
    ARTICLE: `Generate a complete blog article.
Title: SEO-optimized (50-60 characters)
Length: 800-1200 words
Structure:
- Compelling headline
- Introduction (hook + thesis)
- 3-5 H2 headings with content
- Bullet points for scannability
- Conclusion + CTA

Style: {TONE}, informative, well-researched
SEO: Include keywords naturally, use meta description

Format: Full article with markdown headings.`,

    TITLE: `Generate an SEO-optimized blog title.
Length: 50-60 characters for SEO, up to 70 for display
Include: Primary keyword, power words, numbers
Make it: Compelling, clear, benefit-driven

Format: Return ONLY the title text.`,

    DESCRIPTION: `Generate a meta description for the blog post.
Length: 150-160 characters
Include: Primary keyword, benefit, CTA
Make it: Compelling for search results

Format: Complete meta description text.`,
  },
}

const goalModifiers: Record<string, string> = {
  sales: `With a SALES focus:
- Emphasize benefits over features
- Include social proof elements
- Create urgency or scarcity
- Clear value proposition
- Strong buying CTA
- Address objections proactively`,

  engagement: `With an ENGAGEMENT focus:
- Ask questions throughout
- Include shareable moments
- Create conversation starters
- Emotional connection points
- Community-building language
- Engagement-focused CTA (comment, share, save)`,

  reach: `With a REACH focus:
- Universal appeal, broad topics
- Trending elements and references
- Highly shareable content
- Viral-optimized moments
- Discoverability keywords/hashtags
- Share-focused CTA`,

  clicks: `With a CLICKS focus:
- Curiosity gaps and teasers
- Clear value proposition upfront
- Promise of more value at link
- Urgency or FOMO elements
- Strategic link placement
- Click-driving CTA`,

  followers: `With a FOLLOWER GROWTH focus:
- Showcase expertise or personality
- Consistency promise
- Value delivery
- Community invitation
- Follow-worthy content
- Subscribe/follow CTA`,
}

const toneModifiers: Record<string, string> = {
  professional: `Maintain PROFESSIONAL tone:
- Expert language and terminology
- Credible, authoritative voice
- Industry insights and data
- Minimal slang, formal but approachable`,

  casual: `Maintain CASUAL tone:
- Conversational, friendly language
- Everyday expressions and colloquialisms
- Relatable, down-to-earth voice
- Natural, unforced style`,

  viral: `Maintain VIRAL tone:
- High energy and excitement
- Trendy language and references
- Provocative statements
- Emotional triggers
- Quotable moments`,

  educational: `Maintain EDUCATIONAL tone:
- Teaching and explaining focus
- Clear examples and analogies
- Step-by-step approach
- Informative, valuable content
- Learn-focused outcomes`,

  storytelling: `Maintain STORYTELLING tone:
- Narrative-driven content
- Personal anecdotes and examples
- Emotional journey
- Transformation arc
- Character-driven moments`,

  humorous: `Maintain HUMOROUS tone:
- Witty, light-hearted content
- Clever wordplay and puns
- Relatable humor
- Entertaining while valuable
- Fun, not silly`,

  inspiring: `Maintain INSPIRING tone:
- Motivational language
- Transformation focus
- Empowerment messaging
- Positive outlook
- Aspirational content`,
}

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

export function generateContentTypePrompt(params: ContentTypeParams): string {
  const languageName = languageNames[params.language] || 'English'
  const platform = params.platform.toUpperCase()
  const contentType = params.contentType.toUpperCase()

  // Get the content type template
  const contentTemplate = platformContentConfigs[platform]?.[contentType]

  if (!contentTemplate) {
    return generateGenericPrompt(params)
  }

  let prompt = `You are an expert social media content creator specializing in ${platform} ${contentType.toLowerCase()} generation.

TASK: ${contentTemplate}

PLATFORM: ${platform}
CONTENT TYPE: ${contentType}
TOPIC: ${params.topic}

LANGUAGE CRITICAL: Write ALL content in ${languageName}. Use native expressions, idioms, and cultural context natural to ${languageName} speakers.

${goalModifiers[params.goal] || goalModifiers.engagement}

${toneModifiers[params.tone] || toneModifiers.professional}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}\n` : ''}${params.keywords && params.keywords.length > 0 ? `KEYWORDS TO INCLUDE: ${params.keywords.join(', ')}\n` : ''}${params.videoDuration ? `VIDEO DURATION: ${getVideoDurationText(params.platform, params.videoDuration)}\n` : ''}

CRITICAL REMINDERS:
- Return content in the exact format specified above
- Make it feel NATIVE to ${platform} (not generic or cross-posted)
- Optimize for ${params.goal} goal specifically
- Match ${params.tone} tone throughout
- Write authentically in ${languageName}
- Follow ${platform} best practices
- No markdown formatting unless specified
- No explanations outside of the requested content`

  return prompt

}

function getVideoDurationText(platform: string, duration: string): string {
  const platformUpper = platform.toUpperCase()

  if (platformUpper === 'INSTAGRAM') {
    const instagramDurationMap: Record<string, string> = {
      'shorts': 'Instagram Reel (15-30 seconds) - ultra-fast paced, instant hook, viral moment',
      '1-3': 'Long Reel (1-3 minutes) - fast-paced, build story, 2-3 key points',
    }
    return instagramDurationMap[duration] || instagramDurationMap['shorts']
  }

  // Default to YouTube durations
  const durationMap: Record<string, string> = {
    'shorts': 'YouTube Short (under 60 seconds) - ultra-fast paced, instant hook, quick payoff',
    '1-3': 'Short video (1-3 minutes) - fast-paced, get to value quickly, no fluff',
    '5-10': 'Medium video (5-10 minutes) - moderate pacing, build anticipation, detailed examples',
    '10-20': 'Long video (10-20 minutes) - thorough exploration, multiple examples, deep dive',
    '20+': 'Deep dive (20+ minutes) - comprehensive coverage, all aspects covered, storytelling',
  }
  return durationMap[duration] || durationMap['5-10']
}

function generateGenericPrompt(params: ContentTypeParams): string {
  const languageName = languageNames[params.language] || 'English'

  return `You are an expert social media content creator.

Generate a ${params.contentType.toUpperCase()} for ${params.platform.toUpperCase()}.

TOPIC: ${params.topic}
PLATFORM: ${params.platform.toUpperCase()}
CONTENT TYPE: ${params.contentType.toUpperCase()}
GOAL: ${params.goal}
TONE: ${params.tone}
LANGUAGE: ${languageName} - Write ALL content in ${languageName}

${goalModifiers[params.goal] || ''}

${toneModifiers[params.tone] || ''}

${params.targetAudience ? `TARGET AUDIENCE: ${params.targetAudience}\n` : ''}${params.keywords && params.keywords.length > 0 ? `KEYWORDS: ${params.keywords.join(', ')}\n` : ''}

Generate complete, ready-to-post content optimized for ${params.platform} following best practices.

Return in this JSON format:
{
  "title": "Title if applicable",
  "content": "Main content body",
  "caption": "Caption if applicable",
  "hook": "Opening hook",
  "cta": "Call to action",
  "hashtags": ["tag1", "tag2"]
}

CRITICAL: Return valid JSON only, no markdown. Write in ${languageName}.`
}

export function generateBulkContentTypePrompt(params: ContentTypeParams, count: number): string {
  const basePrompt = generateContentTypePrompt(params)

  return `${basePrompt.replace('Return in this JSON format:', 'Return multiple variations in this JSON format:')}

{
  "variations": [
    {
      "title": "Variation 1 title",
      "content": "Variation 1 content with different angle",
      "caption": "Variation 1 caption",
      "hook": "Variation 1 hook",
      "cta": "Variation 1 CTA",
      "hashtags": ["var1_tag1", "var1_tag2"]
    }
    // ... ${count} total variations
  ]
}

Generate ${count} COMPLETELY DIFFERENT and UNIQUE variations.
Each must explore different angles, hooks, and approaches while maintaining the ${params.tone} tone and optimizing for ${params.goal}.`
}
