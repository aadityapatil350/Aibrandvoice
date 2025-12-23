import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { generateScriptPrompt, generateBulkScriptsPrompt } from '@/lib/ai/prompts'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      mode,
      platform,
      topic,
      tone,
      language,
      duration,
      targetAudience,
      keywords,
      includeHook,
      includeCTA,
      bulkCount,
      bulkVariations,
      brandProfile,
    } = body

    // Validate required fields
    if (!topic || !platform || !tone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const promptParams = {
      platform,
      topic,
      tone,
      language: language || 'en',
      duration: duration || '5',
      targetAudience,
      keywords,
      includeHook: includeHook ?? true,
      includeCTA: includeCTA ?? true,
    }

    let prompt: string
    let scripts: any[] = []

    if (mode === 'bulk') {
      // Bulk generation
      prompt = generateBulkScriptsPrompt(promptParams, bulkCount, bulkVariations)
      const response = await generateWithDeepSeek(prompt)

      // Parse multiple scripts from response
      const scriptSections = response.split(/===SCRIPT \d+===/).filter(Boolean)

      scripts = scriptSections.map((content: string, index: number) => ({
        content: content.trim(),
        duration: duration,
        index: index + 1,
      }))

      // If parsing failed, return the whole response as one script
      if (scripts.length === 0) {
        scripts = [{ content: response, duration, index: 1 }]
      }
    } else {
      // Single generation
      prompt = generateScriptPrompt(promptParams)
      const response = await generateWithDeepSeek(prompt)

      scripts = [{
        content: response,
        duration,
        index: 1,
      }]
    }

    return NextResponse.json({
      success: true,
      scripts,
      platform,
      mode,
    })
  } catch (error: any) {
    console.error('Script generation error:', error)
    return NextResponse.json(
      { error: error.message || 'Script generation failed' },
      { status: 500 }
    )
  }
}
