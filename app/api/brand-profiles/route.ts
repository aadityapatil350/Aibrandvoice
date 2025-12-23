import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

// Get all brand profiles for the authenticated user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const profiles = await prisma.brandProfile.findMany({
      where: { userId: user.id },
      include: {
        assets: {
          select: {
            id: true,
            fileName: true,
            originalName: true,
            fileType: true,
            fileSize: true,
            uploadedAt: true,
          }
        },
        _count: {
          select: { assets: true }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ profiles })
  } catch (error) {
    console.error('Error fetching brand profiles:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new brand profile
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (!user || authError) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, industry, targetAudience, brandColors, tone } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Create user directory if it doesn't exist
    const userDir = path.join(process.cwd(), '../brandvoice-assets/profiles', user.id)
    try {
      await mkdir(userDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const profile = await prisma.brandProfile.create({
      data: {
        userId: user.id,
        name,
        description,
        industry,
        targetAudience,
        brandColors,
        tone: tone || [],
        // Advanced fields
        website: body.website,
        uniqueSellingProposition: body.uniqueSellingProposition,
        competitorChannels: body.competitorChannels || [],
        contentPillars: body.contentPillars || [],
        contentTypeFocus: body.contentTypeFocus || [],
        targetKeywords: body.targetKeywords || [],
        communicationStyle: body.communicationStyle,
        formality: body.formality,
        emotionalTone: body.emotionalTone,
        complexity: body.complexity,
        callToActionStyle: body.callToActionStyle,
        competitorAnalysis: body.competitorAnalysis
      },
      include: {
        assets: true,
        _count: {
          select: { assets: true }
        }
      }
    })

    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Error creating brand profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}