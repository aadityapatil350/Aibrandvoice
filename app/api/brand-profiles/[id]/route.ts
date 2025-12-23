import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Get a specific brand profile
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

    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: user.id
      },
      include: {
        assets: {
          orderBy: { uploadedAt: 'desc' }
        },
        voiceTrainings: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching brand profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a brand profile
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, industry, targetAudience, brandColors, tone } = body

    // Check if profile exists and belongs to user
    const existingProfile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    const updatedProfile = await prisma.brandProfile.update({
      where: { id: params.id },
      data: {
        name,
        description,
        industry,
        targetAudience,
        brandColors,
        tone,
        // Advanced fields
        website: body.website,
        uniqueSellingProposition: body.uniqueSellingProposition,
        competitorChannels: body.competitorChannels,
        contentPillars: body.contentPillars,
        contentTypeFocus: body.contentTypeFocus,
        targetKeywords: body.targetKeywords,
        communicationStyle: body.communicationStyle,
        formality: body.formality,
        emotionalTone: body.emotionalTone,
        complexity: body.complexity,
        callToActionStyle: body.callToActionStyle,
        competitorAnalysis: body.competitorAnalysis,
        updatedAt: new Date()
      },
      include: {
        assets: true,
        _count: {
          select: { assets: true }
        }
      }
    })

    return NextResponse.json({ profile: updatedProfile })
  } catch (error) {
    console.error('Error updating brand profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a brand profile
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if profile exists and belongs to user
    const existingProfile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    await prisma.brandProfile.delete({
      where: { id: params.id }
    })

    // TODO: Delete physical files from storage
    // This would involve deleting the profile's folder from ../brandvoice-assets/profiles/[userId]/[profileId]

    return NextResponse.json({ message: 'Brand profile deleted successfully' })
  } catch (error) {
    console.error('Error deleting brand profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}