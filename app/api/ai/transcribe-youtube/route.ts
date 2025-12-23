import { NextRequest, NextResponse } from 'next/server'
import { generateWithDeepSeek } from '@/lib/ai/deepseek'
import { YoutubeTranscript } from 'youtube-transcript'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { youtubeUrl } = body

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: 'YouTube URL is required' },
        { status: 400 }
      )
    }

    // Extract video ID from URL
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      return NextResponse.json(
        { error: 'Invalid YouTube URL' },
        { status: 400 }
      )
    }

    console.log('Fetching transcript for video:', videoId)

    // Get transcript using youtube-transcript library
    let transcript = ''
    try {
      // Try with language options
      const transcriptData = await YoutubeTranscript.fetchTranscript(videoId, {
        lang: 'en',
      })

      console.log('Raw transcript data:', transcriptData ? transcriptData.length : 0, 'segments')

      if (!transcriptData || transcriptData.length === 0) {
        throw new Error('No transcript data returned')
      }

      // Combine all transcript segments
      transcript = transcriptData.map((item: any) => item.text).join(' ').trim()

      console.log('Transcript fetched successfully, length:', transcript.length)
    } catch (error: any) {
      console.error('youtube-transcript error details:', error.message, error.stack)

      // Provide more specific error messages
      let errorMessage = 'Failed to fetch transcript. '
      if (error.message?.includes('Transcript is disabled')) {
        errorMessage += 'Transcripts are disabled for this video.'
      } else if (error.message?.includes('No transcripts available')) {
        errorMessage += 'No captions available for this video.'
      } else {
        errorMessage += 'Make sure the video has captions enabled and is publicly available.'
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      )
    }

    if (!transcript) {
      return NextResponse.json(
        { error: 'Failed to fetch transcript. Make sure the video has captions available.' },
        { status: 400 }
      )
    }

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
      transcript,
      toneAnalysis,
      videoId,
    })
  } catch (error: any) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      { error: error.message || 'Transcription failed' },
      { status: 500 }
    )
  }
}

function extractVideoId(url: string): string | null {
  try {
    const urlObj = new URL(url)

    // Handle youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v')
    }

    // Handle youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }

    return null
  } catch {
    return null
  }
}
