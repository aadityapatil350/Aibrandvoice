import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Train voice model for a brand profile
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the Prisma user by Supabase ID
    const prismaUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    })

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify profile belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: prismaUser.id
      },
      include: {
        assets: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    // Check if there are assets to train on
    const textAssets = profile.assets.filter(asset =>
      asset.fileType === 'PDF' ||
      asset.fileType === 'DOCX' ||
      asset.fileType === 'TXT' ||
      asset.extractedText
    )

    if (textAssets.length === 0) {
      return NextResponse.json(
        { error: 'No text assets available for training. Please upload documents first.' },
        { status: 400 }
      )
    }

    // Create training record
    const training = await prisma.voiceTraining.create({
      data: {
        profileId: params.id,
        userId: prismaUser.id,
        modelVersion: 'deepseek-chat',
        trainingData: {
          assetCount: textAssets.length,
          assetIds: textAssets.map(a => a.id),
          profileInfo: {
            name: profile.name,
            description: profile.description,
            industry: profile.industry,
            targetAudience: profile.targetAudience,
            tone: profile.tone
          }
        },
        status: 'PROCESSING',
        trainingStartedAt: new Date()
      }
    })

    // Update profile status
    await prisma.brandProfile.update({
      where: { id: params.id },
      data: {
        status: 'TRAINING',
        trainingProgress: 0
      }
    })

    // Start training process in background
    processVoiceTraining(training.id, params.id, textAssets, profile).catch(error => {
      console.error('Voice training failed:', error)
    })

    return NextResponse.json({
      training,
      message: 'Voice training started successfully'
    }, { status: 202 })
  } catch (error) {
    console.error('Error starting voice training:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Get training status
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Find the Prisma user by Supabase ID
    const prismaUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    })

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get latest training for this profile
    const training = await prisma.voiceTraining.findFirst({
      where: {
        profileId: params.id,
        userId: prismaUser.id
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!training) {
      return NextResponse.json(
        { error: 'No training found for this profile' },
        { status: 404 }
      )
    }

    return NextResponse.json({ training })
  } catch (error) {
    console.error('Error fetching training status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Background function to process voice training
async function processVoiceTraining(
  trainingId: string,
  profileId: string,
  assets: any[],
  profile: any
) {
  try {
    // Update progress: Starting analysis
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        trainingData: {
          status: 'Extracting text content from assets...',
          progress: 10
        }
      }
    })

    // Update profile progress
    await prisma.brandProfile.update({
      where: { id: profileId },
      data: { trainingProgress: 10 }
    })

    // Collect all text content
    const textAssets = assets.filter(asset => asset.extractedText)
    if (textAssets.length === 0) {
      throw new Error('No text content found in uploaded assets')
    }

    const allTexts = textAssets.map(asset => asset.extractedText).join('\n\n')

    if (!allTexts || allTexts.length < 100) {
      throw new Error('Insufficient text content for training. Minimum 100 characters required.')
    }

    // Update progress: Text extracted
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        trainingData: {
          status: 'Analyzing brand voice patterns...',
          progress: 30,
          textLength: allTexts.length,
          assetCount: textAssets.length
        }
      }
    })

    await prisma.brandProfile.update({
      where: { id: profileId },
      data: { trainingProgress: 30 }
    })

    // Update progress: Preparing for AI analysis
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        trainingData: {
          status: 'Contacting DeepSeek AI for voice analysis...',
          progress: 50
        }
      }
    })

    await prisma.brandProfile.update({
      where: { id: profileId },
      data: { trainingProgress: 50 }
    })

    // Call DeepSeek API to create voice model
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: `You are an AI assistant specializing in brand voice analysis. Analyze the following text content to extract the unique voice characteristics, tone, and style of this brand.

Brand Information:
- Name: ${profile.name}
- Industry: ${profile.industry || 'Not specified'}
- Target Audience: ${profile.targetAudience || 'Not specified'}
- Desired Tone: ${profile.tone?.join(', ') || 'Not specified'}

Please provide a comprehensive JSON analysis with the following structure:
{
  "personalityTraits": ["trait1", "trait2"],
  "communicationStyle": {
    "formality": "formal/casual/mixed",
    "complexity": "simple/moderate/complex",
    "emotionalTone": "neutral/warm/energetic/professional"
  },
  "writingPatterns": {
    "sentenceLength": "short/medium/long/mixed",
    "paragraphStructure": "concise/detailed/mixed",
    "punctuationStyle": "minimal/moderate/extensive"
  },
  "vocabulary": {
    "technicalTerms": boolean,
    "industryJargon": boolean,
    "emotionalLanguage": boolean,
    "callToActionStyle": "direct/subtle/none"
  },
  "keyPhrases": ["phrase1", "phrase2"],
  "voiceSummary": "Brief summary of the brand voice",
  "recommendedUsage": ["content type 1", "content type 2"]
}`
          },
          {
            role: 'user',
            content: `Here is the brand content to analyze. Extract the unique voice characteristics:\n\n${allTexts.substring(0, 12000)}`
          }
        ],
        temperature: 0.3,
        max_tokens: 3000
      })
    })

    // Update progress: Processing AI response
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        trainingData: {
          status: 'Processing AI voice analysis...',
          progress: 80
        }
      }
    })

    await prisma.brandProfile.update({
      where: { id: profileId },
      data: { trainingProgress: 80 }
    })

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.statusText}`)
    }

    const data = await response.json()
    const voiceAnalysis = data.choices[0].message.content

    // Parse the JSON response to validate it
    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(voiceAnalysis)
    } catch (e) {
      // If not valid JSON, store as raw text
      parsedAnalysis = { rawAnalysis: voiceAnalysis }
    }

    // Update training with results
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        status: 'COMPLETED',
        vectorEmbeddings: {
          voiceAnalysis: parsedAnalysis,
          model: 'deepseek-chat',
          tokensUsed: data.usage?.total_tokens || 0,
          textLength: allTexts.length,
          sampleText: allTexts.substring(0, 200) + '...',
          trainedAt: new Date().toISOString()
        },
        completedAt: new Date()
      }
    })

    // Update profile status
    await prisma.brandProfile.update({
      where: { id: profileId },
      data: {
        status: 'READY',
        trainingProgress: 100,
        lastTrainedAt: new Date(),
        voiceModel: 'deepseek-chat'
      }
    })

    console.log(`Voice training completed for profile ${profileId}`)

  } catch (error) {
    console.error('Voice training error:', error)

    // Update training with error
    await prisma.voiceTraining.update({
      where: { id: trainingId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        trainingData: {
          failedAt: new Date().toISOString()
        }
      }
    })

    // Update profile status
    await prisma.brandProfile.update({
      where: { id: profileId },
      data: {
        status: 'ERROR',
        trainingProgress: 0
      }
    })
  }
}