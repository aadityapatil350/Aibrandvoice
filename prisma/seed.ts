import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create platforms
  const platforms = [
    {
      id: 'youtube',
      name: 'YOUTUBE',
      displayName: 'YouTube',
      icon: 'youtube',
      color: '#FF0000',
      isActive: true
    },
    {
      id: 'instagram',
      name: 'INSTAGRAM',
      displayName: 'Instagram',
      icon: 'instagram',
      color: '#E4405F',
      isActive: true
    },
    {
      id: 'tiktok',
      name: 'TIKTOK',
      displayName: 'TikTok',
      icon: 'tiktok',
      color: '#000000',
      isActive: true
    },
    {
      id: 'linkedin',
      name: 'LINKEDIN',
      displayName: 'LinkedIn',
      icon: 'linkedin',
      color: '#0077B5',
      isActive: true
    },
    {
      id: 'twitter',
      name: 'TWITTER',
      displayName: 'Twitter',
      icon: 'twitter',
      color: '#1DA1F2',
      isActive: true
    },
    {
      id: 'blog',
      name: 'BLOG',
      displayName: 'Blog',
      icon: 'blog',
      color: '#FFA500',
      isActive: true
    },
    {
      id: 'generic',
      name: 'GENERIC',
      displayName: 'Generic',
      icon: 'image',
      color: '#808080',
      isActive: true
    }
  ]

  for (const platform of platforms) {
    await prisma.platform.upsert({
      where: { name: platform.name },
      update: platform,
      create: platform
    })
  }

  // Create thumbnail templates
  const templates = [
    {
      id: 'youtube-default',
      name: 'YouTube Default',
      platformId: 'youtube',
      dimensions: { width: 1280, height: 720 },
      overlays: [
        {
          type: 'text',
          position: { x: 50, y: 80 },
          size: { width: 1000, height: 100 },
          style: {
            fontSize: 48,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 20
          },
          zIndex: 2,
          isVisible: true
        },
        {
          type: 'image',
          position: { x: 0, y: 0 },
          size: { width: 1280, height: 720 },
          zIndex: 1,
          isVisible: true
        }
      ],
      isDefault: true,
      isActive: true
    },
    {
      id: 'instagram-square',
      name: 'Instagram Square',
      platformId: 'instagram',
      dimensions: { width: 1080, height: 1080 },
      overlays: [
        {
          type: 'text',
          position: { x: 50, y: 80 },
          size: { width: 800, height: 100 },
          style: {
            fontSize: 36,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 15
          },
          zIndex: 2,
          isVisible: true
        },
        {
          type: 'image',
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 1080 },
          zIndex: 1,
          isVisible: true
        }
      ],
      isDefault: true,
      isActive: true
    },
    {
      id: 'tiktok-vertical',
      name: 'TikTok Vertical',
      platformId: 'tiktok',
      dimensions: { width: 1080, height: 1920 },
      overlays: [
        {
          type: 'text',
          position: { x: 50, y: 200 },
          size: { width: 800, height: 100 },
          style: {
            fontSize: 42,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 15
          },
          zIndex: 2,
          isVisible: true
        },
        {
          type: 'image',
          position: { x: 0, y: 0 },
          size: { width: 1080, height: 1920 },
          zIndex: 1,
          isVisible: true
        }
      ],
      isDefault: true,
      isActive: true
    },
    {
      id: 'linkedin-professional',
      name: 'LinkedIn Professional',
      platformId: 'linkedin',
      dimensions: { width: 1200, height: 627 },
      overlays: [
        {
          type: 'text',
          position: { x: 50, y: 60 },
          size: { width: 900, height: 80 },
          style: {
            fontSize: 32,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 15
          },
          zIndex: 2,
          isVisible: true
        },
        {
          type: 'image',
          position: { x: 0, y: 0 },
          size: { width: 1200, height: 627 },
          zIndex: 1,
          isVisible: true
        }
      ],
      isDefault: true,
      isActive: true
    },
    {
      id: 'twitter-card',
      name: 'Twitter Card',
      platformId: 'twitter',
      dimensions: { width: 1200, height: 675 },
      overlays: [
        {
          type: 'text',
          position: { x: 50, y: 60 },
          size: { width: 900, height: 80 },
          style: {
            fontSize: 30,
            fontWeight: 'bold',
            color: '#FFFFFF',
            textAlign: 'center',
            backgroundColor: 'rgba(0,0,0,0.7)',
            padding: 15
          },
          zIndex: 2,
          isVisible: true
        },
        {
          type: 'image',
          position: { x: 0, y: 0 },
          size: { width: 1200, height: 675 },
          zIndex: 1,
          isVisible: true
        }
      ],
      isDefault: true,
      isActive: true
    }
  ]

  for (const template of templates) {
    await prisma.thumbnailTemplate.upsert({
      where: { id: template.id },
      update: template,
      create: template
    })
  }

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })