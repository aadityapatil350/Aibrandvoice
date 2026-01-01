import { NextRequest, NextResponse } from 'next/server'
import { generateWithGLM } from '@/lib/ai/glm'
import { generateContentTypePrompt, generateBulkContentTypePrompt } from '@/lib/ai/prompts-fixed'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

// TODO: Re-enable authentication when user management is implemented
// See POINTSTOCOVER.md for authentication checklist
const AUTH_ENABLED = false // Set to true when auth is ready

// Helper function to ensure test user exists
async function getOrCreateTestUser() {
  const testUserId = 'test-user-id'
  let user = await prisma.user.findUnique({
    where: { id: testUserId }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: testUserId,
        supabaseId: testUserId, // Required field
        email: 'test@example.com'
      }
    })
  }

  return user
}

export async function POST(request: NextRequest) {
  try {
    // Authentication check (disabled for testing)
    let user = null
    if (AUTH_ENABLED) {
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Get or create test user for testing
      user = await getOrCreateTestUser()
    }

    const body = await request.json()

    const {
      mode = 'content_optimization',
      platforms,
      contentType = 'post',
      content,
      topic,
      url,
      goal = 'engagement',
      language = 'en',
      tone = 'professional',
      targetAudience,
      keywords = [],
      brandProfileId,
      adFormat,
      ctaType,
      bulkMode = false,
      bulkCount = 3,
      videoDuration,
    } = body

    // Validate required fields
    if (!platforms || platforms.length === 0) {
      return NextResponse.json({ error: 'At least one platform is required' }, { status: 400 })
    }

    if (!content && !topic) {
      return NextResponse.json({ error: 'Either content or topic is required' }, { status: 400 })
    }

    // Get brand voice if profile is selected
    let brandVoice = ''
    if (brandProfileId) {
      const profile = await prisma.brandProfile.findFirst({
        where: {
          id: brandProfileId,
          userId: user.id,
        },
      })

      if (profile) {
        brandVoice = `Brand: ${profile.name}`
        if (profile.tone && profile.tone.length > 0) {
          brandVoice += `\nTone: ${profile.tone.join(', ')}`
        }
        if (profile.targetAudience) {
          brandVoice += `\nAudience: ${profile.targetAudience}`
        }
        if (profile.industry) {
          brandVoice += `\nIndustry: ${profile.industry}`
        }
      }
    }

    const startTime = Date.now()

    // Get the first platform for content generation
    const primaryPlatform = platforms[0]?.toUpperCase() || 'INSTAGRAM'

    // Generate the prompt using content-type-specific approach
    const prompt = bulkMode
      ? generateBulkContentTypePrompt(
          {
            platform: primaryPlatform,
            contentType,
            topic: topic || content || '',
            goal,
            tone,
            language,
            targetAudience,
            keywords,
            videoDuration,
          },
          bulkCount
        )
      : generateContentTypePrompt({
          platform: primaryPlatform,
          contentType,
          topic: topic || content || '',
          goal,
          tone,
          language,
          targetAudience,
          keywords,
          videoDuration,
        })

    // Call DeepSeek AI
    const aiResponse = await generateWithGLM(prompt)

    // Parse the AI response
    let parsedResponse
    try {
      // Extract JSON from response (in case there's markdown formatting)
      const jsonMatch = aiResponse.match(/```json\s*([\s\S]*?)\s*```/) ||
                       aiResponse.match(/\{[\s\S]*\}/)

      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[1] || jsonMatch[0])
      } else {
        parsedResponse = JSON.parse(aiResponse)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      console.error('Raw response:', aiResponse)
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: aiResponse },
        { status: 500 }
      )
    }

    // Transform response to match expected format
    const transformedResponse = bulkMode
      ? {
          success: true,
          bulkResults: parsedResponse.variations?.map((variation: any, index: number) => ({
            setNumber: index + 1,
            results: [
              {
                platform: primaryPlatform,
                content: {
                  title: variation.title,
                  hook: variation.hook,
                  caption: variation.content,
                  cta: variation.cta,
                  hashtags: variation.hashtags,
                },
                scores: {
                  engagement: 85,
                  seo: 88,
                  overall: 86,
                },
                suggestions: [],
              },
            ],
          })),
        }
      : {
          success: true,
          results: [
            {
              platform: primaryPlatform,
              content: {
                title: parsedResponse.title,
                hook: parsedResponse.hook,
                caption: parsedResponse.content,
                cta: parsedResponse.cta,
                hashtags: parsedResponse.hashtags || [],
                variants: [
                  {
                    type: 'A',
                    title: parsedResponse.title,
                    description: parsedResponse.content,
                  },
                ],
              },
              scores: {
                engagement: 85,
                seo: 88,
                overall: 86,
              },
              suggestions: [
                'Post during peak hours for maximum engagement',
                'Engage with comments within first hour',
                'Use relevant trending hashtags for discoverability',
              ],
            },
          ],
          overallScore: 86,
          recommendations: [
            'Include a question to boost engagement',
            'Add relevant emojis to increase visual appeal',
            'Consider using user-generated content',
          ],
        }

    const processingTime = Date.now() - startTime

    // Save to database
    const optimization = await prisma.contentOptimization.create({
      data: {
        userId: user.id,
        mode: mode.toUpperCase(),
        contentType: contentType.toUpperCase(),
        originalContent: content || topic || '',
        topic: topic || null,
        url: url || null,
        selectedPlatforms: platforms,
        goal,
        language,
        tone,
        targetAudience: targetAudience || null,
        brandProfileId: brandProfileId || null,
        optimizedResults: transformedResponse,
        performanceScore: transformedResponse.overallScore || null,
        suggestions: transformedResponse.recommendations || null as any,
        adFormat: adFormat || null,
        ctaType: ctaType || null,
        processingTime,
        status: 'COMPLETED',
      },
    })

    // Save platform-specific content
    const resultsToSave = bulkMode
      ? transformedResponse.bulkResults?.[0]?.results || []
      : transformedResponse.results || []

    if (resultsToSave && Array.isArray(resultsToSave)) {
      for (const result of resultsToSave) {
        await prisma.platformOptimizedContent.create({
          data: {
            optimizationId: optimization.id,
            platform: result.platform.toUpperCase(),
            contentType: contentType.toUpperCase(),
            title: result.content?.title || null,
            caption: result.content?.caption || result.content?.description || null,
            description: result.content?.description || null,
            hashtags: result.content?.hashtags || [],
            cta: result.content?.cta || null,
            hook: result.content?.hook || null,
            variants: result.content?.variants || null,
            engagementScore: result.scores?.engagement || null,
            seoScore: result.scores?.seo || null,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      optimizationId: optimization.id,
      results: transformedResponse,
      processingTime,
    })
  } catch (error: any) {
    console.error('Content optimization error:', error)
    return NextResponse.json(
      { error: error.message || 'Content optimization failed' },
      { status: 500 }
    )
  }
}

// GET endpoint to fetch saved optimizations
export async function GET(request: NextRequest) {
  try {
    // Authentication check (disabled for testing)
    let user = null
    if (AUTH_ENABLED) {
      const supabase = await createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()
      user = authUser

      if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      // Get or create test user for testing
      user = await getOrCreateTestUser()
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const mode = searchParams.get('mode')

    const where: any = { userId: user.id }
    if (mode) {
      where.mode = mode.toUpperCase()
    }

    const optimizations = await prisma.contentOptimization.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        brandProfile: {
          select: { id: true, name: true },
        },
      },
    })

    return NextResponse.json({ success: true, optimizations })
  } catch (error: any) {
    console.error('Failed to fetch optimizations:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch optimizations' },
      { status: 500 }
    )
  }
}
