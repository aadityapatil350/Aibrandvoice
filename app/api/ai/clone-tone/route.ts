import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { originalTranscript, toneAnalysis, variationCount } = body

    if (!originalTranscript || !toneAnalysis) {
      return NextResponse.json(
        { error: 'Original transcript and tone analysis are required' },
        { status: 400 }
      )
    }

    const count = variationCount || 3

    // Generate prompt for variations
    const variationPrompt = `You are an expert scriptwriter who can mimic writing styles and tones perfectly.

ORIGINAL TRANSCRIPT:
${originalTranscript}

TONE ANALYSIS:
${toneAnalysis}

TASK:
Generate ${count} NEW script variations that EXACTLY match the tone, style, and personality of the original transcript. Each variation should:

1. Match the same tone and speaking style
2. Use similar sentence structures and rhythm
3. Incorporate the same types of phrases and expressions
4. Maintain the same level of formality/casualness
5. Sound like it was written by the SAME person
6. Cover DIFFERENT topics or angles (not just rewording the same content)
7. Be approximately the same length as the original
8. Sound completely natural and human-written, NOT robotic

CRITICAL: These variations should feel like they came from the same creator's voice, but discussing different subjects or taking different approaches.

Format each variation with:
===VARIATION 1===
[Full script here]

===VARIATION 2===
[Full script here]

etc.

Generate ${count} complete variations now:`

    const response = await generateWithDeepSeek(variationPrompt)

    // Parse variations from response
    const variationSections = response.split(/===VARIATION \d+===/).filter(Boolean)

    const variations = variationSections.map((content: string) => content.trim())

    // If parsing failed, return the whole response as one variation
    if (variations.length === 0) {
      return NextResponse.json({
        success: true,
        variations: [response],
      })
    }

    return NextResponse.json({
      success: true,
      variations,
    })
  } catch (error: any) {
    console.error('Tone cloning error:', error)
    return NextResponse.json(
      { error: error.message || 'Tone cloning failed' },
      { status: 500 }
    )
  }
}
