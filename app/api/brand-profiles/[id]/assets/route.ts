import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { writeFile, mkdir, readFile } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import pdf from 'pdf-parse'
import mammoth from 'mammoth'

const prisma = new PrismaClient()

// Get all assets for a brand profile
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

    // Verify profile belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    const assets = await prisma.brandAsset.findMany({
      where: { profileId: params.id },
      orderBy: { uploadedAt: 'desc' }
    })

    return NextResponse.json({ assets })
  } catch (error) {
    console.error('Error fetching assets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Upload an asset to a brand profile
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

    // Verify profile belongs to user
    const profile = await prisma.brandProfile.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Brand profile not found' },
        { status: 404 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed types: PDF, DOCX, TXT, and images' },
        { status: 400 }
      )
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB' },
        { status: 400 }
      )
    }

    // Create profile directory if it doesn't exist
    const profileDir = path.join(
      process.cwd(),
      '../brandvoice-assets/profiles',
      user.id,
      params.id
    )
    try {
      await mkdir(profileDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Generate unique filename
    const fileId = uuidv4()
    const fileExtension = file.name.split('.').pop() || ''
    const fileName = `${fileId}.${fileExtension}`
    const filePath = path.join(profileDir, fileName)

    // Save file to disk
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Determine file type enum
    let fileType: any = 'PDF'
    if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      fileType = 'DOCX'
    } else if (file.type === 'text/plain') {
      fileType = 'TXT'
    } else if (file.type.startsWith('image/')) {
      fileType = 'IMAGE'
    }

    // Extract text from document
    let extractedText = null

    try {
      if (file.type === 'text/plain') {
        extractedText = buffer.toString('utf-8')
      } else if (file.type === 'application/pdf') {
        const pdfData = await pdf(buffer)
        extractedText = pdfData.text
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        const docxResult = await mammoth.extractRawText({ buffer })
        extractedText = docxResult.value
      }

      // Clean up extracted text
      if (extractedText) {
        extractedText = extractedText
          .replace(/\s+/g, ' ')  // Replace multiple whitespace with single space
          .replace(/\n+/g, '\n')  // Replace multiple newlines with single newline
          .trim()
      }
    } catch (error) {
      console.error('Text extraction error:', error)
      extractedText = null
    }

    // Save asset record to database
    const asset = await prisma.brandAsset.create({
      data: {
        profileId: params.id,
        fileName,
        originalName: file.name,
        filePath,
        fileSize: file.size,
        fileType,
        mimeType: file.type,
        extractedText
      }
    })

    // Update profile's last trained timestamp
    await prisma.brandProfile.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    })

    return NextResponse.json({ asset }, { status: 201 })
  } catch (error) {
    console.error('Error uploading asset:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}