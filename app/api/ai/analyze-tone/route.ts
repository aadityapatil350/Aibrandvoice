import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transcript } = body

    if (!transcript || transcript.trim().length < 50) {
      return NextResponse.json(
        { error: 'Transcript is required and must be at least 50 characters' },
        { status: 400 }
      )
    }

    console.log('Analyzing tone for transcript, length:', transcript.length)

    // Analyze tone using DeepSeek
    const toneAnalysisPrompt = `Analyze the tone and writing style of this video transcript. Provide a detailed analysis including:

1. Overall Tone (e.g., professional, casual, humorous, educational)
2. Key Characteristics (sentence structure, vocabulary level, emotional tone)
3. Speaking Patterns (how they start sentences, common phrases, rhythm)
4. Personality Traits (enthusiastic, reserved, energetic, calm)

Transcript:
${transcript}

Provide a concise but comprehensive analysis in 3-4 sentences.`

    const toneAnalysis = await generateWithDeepSeek(toneAnalysisPrompt)

    return NextResponse.json({
      success: true,
      toneAnalysis,
    })
  } catch (error: any) {
    console.error('Tone analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Tone analysis failed' },
      { status: 500 }
    )
  }
}
