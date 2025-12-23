import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateUniversalOptimizerPrompt, generateBulkOptimizerPrompt } from '@/lib/ai/prompts'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Generate the prompt
    const prompt = bulkMode
      ? generateBulkOptimizerPrompt(
          {
            mode,
            platforms,
            contentType,
            content,
            topic,
            url,
            goal,
            language,
            tone,
            targetAudience,
            keywords,
            brandVoice,
            adFormat,
            ctaType,
          },
          bulkCount
        )
      : generateUniversalOptimizerPrompt({
          mode,
          platforms,
          contentType,
          content,
          topic,
          url,
          goal,
          language,
          tone,
          targetAudience,
          keywords,
          brandVoice,
          adFormat,
          ctaType,
        })

    // Call DeepSeek AI
    const aiResponse = await generateWithDeepSeek(prompt)

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
      return NextResponse.json(
        { error: 'Failed to parse AI response', raw: aiResponse },
        { status: 500 }
      )
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
        optimizedResults: parsedResponse,
        performanceScore: parsedResponse.overallScore || null,
        suggestions: parsedResponse.recommendations || null,
        adFormat: adFormat || null,
        ctaType: ctaType || null,
        processingTime,
        status: 'COMPLETED',
      },
    })

    // Save platform-specific content
    if (parsedResponse.results && Array.isArray(parsedResponse.results)) {
      for (const result of parsedResponse.results) {
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
      results: parsedResponse,
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
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
