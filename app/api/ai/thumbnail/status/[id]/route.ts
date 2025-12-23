import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * Check thumbnail generation status
 * 
 * GET /api/ai/thumbnail/status/:id
 * 
 * URL Parameters:
 * - id: The generation ID to check status for
 * 
 * Response:
 * {
 *   success: true,
 *   generation: {
 *     id: string,
 *     status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
 *     thumbnailUrl?: string,        // Available when status is COMPLETED
 *     imageUrl?: string,           // Original image URL
 *     progress?: number,            // Progress percentage (0-100)
 *     createdAt: string,
 *     updatedAt: string,
 *     metadata?: object
 *   }
 * }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Generation ID is required' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Find the generation record
    const generation = await prisma.thumbnailGeneration.findFirst({
      where: {
        id,
        userId: user.id // Ensure user can only access their own generations
      },
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            displayName: true
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
        { error: 'Generation not found' },
        { status: 404 }
      )
    }

    // Calculate progress based on status
    let progress = 0
    switch (generation.status) {
      case 'PENDING':
        progress = 10
        break
      case 'PROCESSING':
        progress = 50
        break
      case 'COMPLETED':
        progress = 100
        break
      case 'FAILED':
        progress = 0
        break
    }

    return NextResponse.json({
      success: true,
      generation: {
        id: generation.id,
        status: generation.status,
        thumbnailUrl: generation.thumbnailUrl,
        imageUrl: generation.imageUrl,
        progress,
        title: generation.title,
        description: generation.description,
        platform: generation.platform,
        template: generation.template,
        dimensions: generation.dimensions,
        createdAt: generation.createdAt,
        updatedAt: generation.updatedAt,
        metadata: generation.metadata
      }
    })

  } catch (error: any) {
    console.error('Thumbnail status check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check generation status' },
      { status: 500 }
    )
  }
}