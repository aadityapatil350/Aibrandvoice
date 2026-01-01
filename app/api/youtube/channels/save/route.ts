import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      channelId,
      title,
      description,
      thumbnailUrl,
      subscriberCount,
      videoCount,
      viewCount,
      isCompetitor,
      isInspirational,
    } = body

    // Check if channel already exists
    let channel = await prisma.youTubeChannel.findUnique({
      where: { channelId }
    })

    if (channel) {
      // Update existing channel
      channel = await prisma.youTubeChannel.update({
        where: { channelId },
        data: {
          subscriberCount: subscriberCount || channel.subscriberCount,
          videoCount: videoCount || channel.videoCount,
          viewCount: viewCount ? BigInt(viewCount) : channel.viewCount,
          isCompetitor: isCompetitor !== undefined ? isCompetitor : channel.isCompetitor,
          isInspirational: isInspirational !== undefined ? isInspirational : channel.isInspirational,
        }
      })
    } else {
      // Create new channel
      channel = await prisma.youTubeChannel.create({
        data: {
          userId: user.id,
          channelId,
          title,
          description,
          thumbnailUrl,
          subscriberCount: subscriberCount || 0,
          videoCount: videoCount || 0,
          viewCount: viewCount ? BigInt(viewCount) : BigInt(0),
          isCompetitor: isCompetitor || false,
          isInspirational: isInspirational || false,
        }
      })
    }

    return NextResponse.json({ channel, message: 'Channel saved successfully' })
  } catch (error: any) {
    console.error('Save Channel Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save channel' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const listType = searchParams.get('listType') || 'all'
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = { userId: user.id }

    if (listType === 'competitors') {
      where.isCompetitor = true
    } else if (listType === 'inspiration') {
      where.isInspirational = true
    }

    const [channels, total] = await Promise.all([
      prisma.youTubeChannel.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.youTubeChannel.count({ where })
    ])

    // Convert BigInt to string for serialization
    const serializedChannels = channels.map(channel => ({
      ...channel,
      viewCount: channel.viewCount.toString()
    }))

    return NextResponse.json({ channels: serializedChannels, total, limit, offset })
  } catch (error: any) {
    console.error('Get Saved Channels Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved channels' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const channelId = searchParams.get('channelId')

    if (!channelId) {
      return NextResponse.json({ error: 'Channel ID required' }, { status: 400 })
    }

    await prisma.youTubeChannel.deleteMany({
      where: {
        channelId,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Channel deleted successfully' })
  } catch (error: any) {
    console.error('Delete Channel Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete channel' },
      { status: 500 }
    )
  }
}
