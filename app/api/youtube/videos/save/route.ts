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
      youtubeVideoId,
      title,
      description,
      channelId,
      channelTitle,
      thumbnailUrl,
      publishedAt,
      viewCount,
      likeCount,
      commentCount,
      duration,
      tags,
      categoryId,
      engagementRate,
      notes,
      tagsCustom,
      isFavorite,
    } = body

    // Check if video already exists
    let video = await prisma.youTubeVideo.findUnique({
      where: { youtubeVideoId }
    })

    if (video) {
      // Update existing video
      video = await prisma.youTubeVideo.update({
        where: { youtubeVideoId },
        data: {
          notes: notes || video.notes,
          tagsCustom: tagsCustom || video.tagsCustom,
          isFavorite: isFavorite !== undefined ? isFavorite : video.isFavorite,
        }
      })
    } else {
      // Create new video
      video = await prisma.youTubeVideo.create({
        data: {
          userId: user.id,
          youtubeVideoId,
          title,
          description,
          channelId,
          channelTitle,
          thumbnailUrl,
          publishedAt: new Date(publishedAt),
          viewCount: viewCount || 0,
          likeCount: likeCount || 0,
          commentCount: commentCount || 0,
          duration,
          tags: tags || [],
          categoryId,
          engagementRate: engagementRate || 0,
          notes,
          tagsCustom: tagsCustom || [],
          isFavorite: isFavorite || false,
        }
      })
    }

    return NextResponse.json({ video, message: 'Video saved successfully' })
  } catch (error: any) {
    console.error('Save Video Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save video' },
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

    if (listType === 'favorites') {
      where.isFavorite = true
    }

    const [videos, total] = await Promise.all([
      prisma.youTubeVideo.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.youTubeVideo.count({ where })
    ])

    return NextResponse.json({ videos, total, limit, offset })
  } catch (error: any) {
    console.error('Get Saved Videos Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved videos' },
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
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID required' }, { status: 400 })
    }

    await prisma.youTubeVideo.deleteMany({
      where: {
        youtubeVideoId: videoId,
        userId: user.id
      }
    })

    return NextResponse.json({ message: 'Video deleted successfully' })
  } catch (error: any) {
    console.error('Delete Video Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete video' },
      { status: 500 }
    )
  }
}
