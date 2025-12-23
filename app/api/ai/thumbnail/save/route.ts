import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Save generated thumbnail to user's collection
 * 
 * POST /api/ai/thumbnail/save
 * 
 * Request body:
 * {
 *   generationId: string,        // ID of the generation to save
 *   title?: string,             // Custom title (optional)
 *   description?: string,        // Custom description (optional)
 *   tags?: string[],             // Tags for organization (optional)
 *   isPublic?: boolean          // Whether to make it public (optional, default: false)
 * }
 * 
 * Response:
 * {
 *   success: true,
 *   savedThumbnail: {
 *     id: string,
 *     title: string,
 *     description: string,
 *     thumbnailUrl: string,
 *     imageUrl: string,
 *     platform: object,
 *     tags: string[],
 *     isPublic: boolean,
 *     createdAt: string,
 *     updatedAt: string
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      generationId,
      title,
      description,
      tags,
      isPublic = false
    } = body

    // Validate required fields
    if (!generationId) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Find the generation record
    const generation = await prisma.thumbnailGeneration.findFirst({
      where: {
        id: generationId,
        userId: user.id, // Ensure user can only save their own generations
        status: 'COMPLETED' // Only save completed generations
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        },
        template: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!generation) {
      return NextResponse.json(
        { error: 'Generation not found or not completed' },
        { status: 404 }
      )
    }

    // Update the generation with save metadata
    const updatedGeneration = await prisma.thumbnailGeneration.update({
      where: { id: generationId },
      data: {
        title: title || generation.title,
        description: description || generation.description,
        metadata: {
          ...generation.metadata,
          savedAt: new Date().toISOString(),
          tags: tags || [],
          isPublic
        }
      }
    })

    return NextResponse.json({
      success: true,
      savedThumbnail: {
        id: updatedGeneration.id,
        title: updatedGeneration.title,
        description: updatedGeneration.description,
        thumbnailUrl: updatedGeneration.thumbnailUrl,
        imageUrl: updatedGeneration.imageUrl,
        platform: generation.platform,
        template: generation.template,
        dimensions: updatedGeneration.dimensions,
        tags: tags || [],
        isPublic,
        createdAt: updatedGeneration.createdAt,
        updatedAt: updatedGeneration.updatedAt
      }
    })

  } catch (error: any) {
    console.error('Thumbnail save error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to save thumbnail' },
      { status: 500 }
    )
  }
}