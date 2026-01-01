import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

// GET - Fetch all filter presets for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const presets = await prisma.youTubeFilterPreset.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ presets })
  } catch (error: any) {
    console.error('Failed to fetch filter presets:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch filter presets' },
      { status: 500 }
    )
  }
}

// POST - Save a new filter preset
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, filters } = body

    if (!name || !filters) {
      return NextResponse.json(
        { error: 'Name and filters are required' },
        { status: 400 }
      )
    }

    const preset = await prisma.youTubeFilterPreset.create({
      data: {
        userId: user.id,
        name,
        filters: filters as any,
      }
    })

    return NextResponse.json({ preset })
  } catch (error: any) {
    console.error('Failed to save filter preset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save filter preset' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a filter preset
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const presetId = searchParams.get('presetId')

    if (!presetId) {
      return NextResponse.json(
        { error: 'Preset ID is required' },
        { status: 400 }
      )
    }

    // Verify ownership before deleting
    const preset = await prisma.youTubeFilterPreset.findUnique({
      where: { id: presetId }
    })

    if (!preset) {
      return NextResponse.json({ error: 'Preset not found' }, { status: 404 })
    }

    if (preset.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await prisma.youTubeFilterPreset.delete({
      where: { id: presetId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Failed to delete filter preset:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete filter preset' },
      { status: 500 }
    )
  }
}
