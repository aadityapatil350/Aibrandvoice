import { PrismaClient, PlatformType, ContentType, OptimizationMode } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create demo user
  console.log('Creating demo user...')
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@brandvoice.ai' },
    update: {},
    create: {
      supabaseId: 'demo-user-supabase-id',
      email: 'demo@brandvoice.ai',
      fullName: 'Demo User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
      provider: 'email',
      onboardingCompleted: true,
    },
  })
  console.log('✅ Demo user created:', demoUser.email)

  // Create platforms
  console.log('Creating platforms...')
  const platforms = [
    {
      id: 'youtube',
      name: 'youtube',
      displayName: 'YouTube',
      icon: 'youtube',
      color: '#FF0000',
      isActive: true
    },
    {
      id: 'instagram',
      name: 'instagram',
      displayName: 'Instagram',
      icon: 'instagram',
      color: '#E4405F',
      isActive: true
    },
    {
      id: 'tiktok',
      name: 'tiktok',
      displayName: 'TikTok',
      icon: 'tiktok',
      color: '#000000',
      isActive: true
    },
    {
      id: 'linkedin',
      name: 'linkedin',
      displayName: 'LinkedIn',
      icon: 'linkedin',
      color: '#0077B5',
      isActive: true
    },
    {
      id: 'twitter',
      name: 'twitter',
      displayName: 'Twitter',
      icon: 'twitter',
      color: '#1DA1F2',
      isActive: true
    },
    {
      id: 'blog',
      name: 'blog',
      displayName: 'Blog',
      icon: 'blog',
      color: '#FFA500',
      isActive: true
    },
    {
      id: 'generic',
      name: 'generic',
      displayName: 'Generic',
      icon: 'image',
      color: '#808080',
      isActive: true
    },
    {
      id: 'reddit',
      name: 'reddit',
      displayName: 'Reddit',
      icon: 'reddit',
      color: '#FF4500',
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
  console.log('✅ Created', platforms.length, 'platforms')

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

  // Create a brand profile
  console.log('Creating brand profile...')
  const youtubePlatform = await prisma.platform.findUnique({ where: { name: 'youtube' } })
  const instagramPlatform = await prisma.platform.findUnique({ where: { name: 'instagram' } })

  const brandProfile = await prisma.brandProfile.create({
    data: {
      userId: demoUser.id,
      name: 'Tech Insights Pro',
      description: 'A tech education brand focused on making complex topics accessible',
      industry: 'Technology Education',
      targetAudience: 'Software developers, tech enthusiasts, and lifelong learners',
      brandColors: {
        primary: '#FF6B35',
        secondary: '#004E89',
        accent: '#F7931E',
      },
      tone: ['Educational', 'Friendly', 'Professional', 'Engaging'],
      status: 'READY',
      trainingProgress: 100,
      website: 'https://techinsightspro.com',
      uniqueSellingProposition: 'Breaking down complex tech concepts into digestible, actionable insights',
      contentPillars: [
        'AI & Machine Learning',
        'Web Development',
        'Cloud Computing',
        'Developer Productivity',
      ],
      contentTypeFocus: ['Tutorial Videos', 'Quick Tips', 'Deep Dives', 'Industry News'],
      targetKeywords: ['ai', 'machine learning', 'web development', 'cloud', 'programming'],
      communicationStyle: 'Clear and conversational with real-world examples',
      formality: 'casual',
      emotionalTone: 'encouraging',
      complexity: 'moderate',
      callToActionStyle: 'subtle',
      lastTrainedAt: new Date(),
    },
  })
  console.log('✅ Brand profile created:', brandProfile.name)

  // Create sample content optimizations
  console.log('Creating sample content optimizations...')
  const contentOpt1 = await prisma.contentOptimization.create({
    data: {
      userId: demoUser.id,
      brandProfileId: brandProfile.id,
      mode: OptimizationMode.CONTENT_OPTIMIZATION,
      contentType: ContentType.POST,
      originalContent: 'Just learned about React Server Components. They are amazing!',
      selectedPlatforms: [PlatformType.YOUTUBE, PlatformType.LINKEDIN, PlatformType.TWITTER],
      goal: 'engagement',
      language: 'en',
      tone: 'educational',
      targetAudience: 'Web developers',
      optimizedResults: {
        youtube: {
          title: '🚀 React Server Components Explained: The Future of React',
          description:
            'Discover how React Server Components are revolutionizing the way we build web applications. Learn what makes them powerful and when you should use them.',
        },
        linkedin: {
          post: "Just spent the week diving deep into React Server Components.\n\nHere's what makes them game-changing:\n✅ Zero client-side JavaScript\n✅ Direct database access\n✅ Automatic code splitting\n\nThe developer experience is incredible. Are you using RSC in your projects yet?\n\n#React #WebDevelopment",
        },
      },
      performanceScore: 8.5,
      status: 'COMPLETED',
      processingTime: 3200,
    },
  })
  console.log('✅ Created content optimizations')

  // Create saved generation
  console.log('Creating saved generation...')
  await prisma.savedGeneration.create({
    data: {
      userId: demoUser.id,
      name: 'Product Launch Template',
      configuration: {
        mode: 'content_optimization',
        platforms: ['linkedin', 'twitter', 'instagram'],
        goal: 'engagement',
        tone: 'professional',
      },
      results: contentOpt1.optimizedResults as any, // Type assertion for Prisma JsonValue
      tags: ['product-launch', 'template', 'multi-platform'],
      category: 'Product Marketing',
      isFavorite: true,
    },
  })
  console.log('✅ Saved generation created')

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📊 Summary:')
  console.log('   - Users: 1 (demo@brandvoice.ai)')
  console.log('   - Platforms: 8')
  console.log('   - Brand Profiles: 1')
  console.log('   - Content Optimizations: 1')
  console.log('   - Saved Generations: 1')
  console.log('\n✨ You can now sign in with Google or use the demo data!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e)
    await prisma.$disconnect()
    process.exit(1)
  })