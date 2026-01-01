import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Add channel to brand profile
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

    // Check if profile exists and belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: prismaUser.id
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { channelId, channelUrl, type } = body

    // Support both channelId (from saved channels) and channelUrl (direct URL)
    const identifier = channelId || channelUrl

    if (!identifier) {
      return NextResponse.json(
        { error: 'Channel ID or URL is required' },
        { status: 400 }
      )
    }

    if (type !== 'competitor' && type !== 'inspiration') {
      return NextResponse.json(
        { error: 'Type must be either "competitor" or "inspiration"' },
        { status: 400 }
      )
    }

    // Get current channels array
    const channelsArray = type === 'competitor'
      ? profile.competitorChannels || []
      : profile.inspirationChannels || []

    // Check if channel already exists in the array
    if (channelsArray.includes(identifier)) {
      return NextResponse.json(
        { error: 'Channel already added to this profile' },
        { status: 400 }
      )
    }

    // Create the updated array
    const updatedChannels = [...channelsArray, identifier]

    // Update profile with the new channel
    const updatedProfile = await prisma.brandProfile.update({
      where: { id: params.id },
      data: {
        [type === 'competitor' ? 'competitorChannels' : 'inspirationChannels']: updatedChannels
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
    console.error('Error adding channel to profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Remove channel from brand profile
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

    // Find the Prisma user by Supabase ID
    const prismaUser = await prisma.user.findUnique({
      where: { supabaseId: user.id }
    })

    if (!prismaUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if profile exists and belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: prismaUser.id
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')
    const type = searchParams.get('type') || 'competitor'

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID is required' },
        { status: 400 }
      )
    }

    if (type !== 'competitor' && type !== 'inspiration') {
      return NextResponse.json(
        { error: 'Type must be either "competitor" or "inspiration"' },
        { status: 400 }
      )
    }

    // Remove channel from the appropriate array
    const channelsArray = type === 'competitor'
      ? profile.competitorChannels || []
      : profile.inspirationChannels || []

    const filteredChannels = channelsArray.filter((id: string) => id !== channelId)

    // Update profile with the filtered array
    const updatedProfile = await prisma.brandProfile.update({
      where: { id: params.id },
      data: {
        [type === 'competitor' ? 'competitorChannels' : 'inspirationChannels']: filteredChannels
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
    console.error('Error removing channel from profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
