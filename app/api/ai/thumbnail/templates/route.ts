import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createClient } from '@/lib/supabase-server'

/**
 * List available thumbnail templates
 * 
 * GET /api/ai/thumbnail/templates
 * 
 * Query Parameters:
 * - platform: Optional filter by platform (YOUTUBE, INSTAGRAM, TIKTOK, etc.)
 * - page: Page number for pagination (default: 1)
 * - limit: Number of items per page (default: 20)
 * 
 * Response:
 * {
 *   success: true,
 *   templates: [
 *     {
 *       id: string,
 *       name: string,
 *       platform: {
 *         id: string,
 *         name: string,
 *         displayName: string
 *       },
 *       dimensions: { width: number, height: number },
 *       overlays: Array,
 *       isDefault: boolean,
 *       isActive: boolean,
 *       createdAt: string,
 *       updatedAt: string
 *     }
 *   ],
 *   pagination: {
 *     page: number,
 *     limit: number,
 *     total: number,
 *     totalPages: number
 *   }
 * }
 */
export async function GET(request: NextRequest) {
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const platform = searchParams.get('platform')?.toUpperCase()
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // Validate pagination parameters
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      isActive: true
    }

    if (platform) {
      // Validate platform enum
      const validPlatforms = ['YOUTUBE', 'INSTAGRAM', 'TIKTOK', 'LINKEDIN', 'TWITTER', 'BLOG', 'GENERIC']
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json(
          { error: 'Invalid platform. Must be one of: ' + validPlatforms.join(', ') },
          { status: 400 }
        )
      }
      
      where.platform = {
        name: platform,
        isActive: true
      }
    } else {
      where.platform = {
        isActive: true
      }
    }

    // Get total count for pagination
    const total = await prisma.thumbnailTemplate.count({ where })

    // Calculate pagination
    const skip = (page - 1) * limit
    const totalPages = Math.ceil(total / limit)

    // Fetch templates
    const templates = await prisma.thumbnailTemplate.findMany({
      where,
      include: {
        platform: {
          select: {
            id: true,
            name: true,
            displayName: true,
            icon: true,
            color: true
          }
        }
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ],
      skip,
      take: limit
    })

    return NextResponse.json({
      success: true,
      templates: templates.map(template => ({
        id: template.id,
        name: template.name,
        platform: template.platform,
        dimensions: template.dimensions,
        overlays: template.overlays,
        isDefault: template.isDefault,
        isActive: template.isActive,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages
      }
    })

  } catch (error: any) {
    console.error('Template listing error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}