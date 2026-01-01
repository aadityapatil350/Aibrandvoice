import { PrismaClient, BrandProfileStatus, AssetType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating demo brand profile...')

  // First, get the first user from the database (or create one if needed)
  let user = await prisma.user.findFirst()

  if (!user) {
    console.log('No user found. Please create a user first via the app.')
    return
  }

  console.log(`Using user: ${user.email}`)

  // Create demo brand profile
  const demoProfile = await prisma.brandProfile.upsert({
    where: {
      id: 'demo-tech-influencer-profile'
    },
    update: {},
    create: {
      id: 'demo-tech-influencer-profile',
      userId: user.id,
      name: 'TechFluencer',
      description: 'A tech content creator focused on making complex technology accessible to everyone. I create videos about the latest gadgets, software tutorials, and tech industry insights.',
      industry: 'Technology',
      targetAudience: 'Tech enthusiasts aged 18-35, early adopters, developers, and professionals looking to stay updated with technology trends. Primarily based in India with global reach.',
      website: 'https://youtube.com/@techfluencer',
      uniqueSellingProposition: 'Breaking down complex tech concepts into simple, relatable content with a mix of humor and practical insights.',
      tone: ['Professional', 'Friendly', 'Educational', 'Engaging', 'Authentic'],
      brandColors: {
        primary: '#FF6B35',
        secondary: '#004E89',
        accent: '#FFA62B',
        background: '#F7F9FC',
        text: '#1A1A2E'
      },
      competitorChannels: [
        'https://youtube.com/@marquesbrownlee',
        'https://youtube.com/@LinusTechTips',
        'https://youtube.com/@UnboxTherapy'
      ],
      contentPillars: [
        'Product Reviews & Unboxings',
        'Tech Tutorials & How-Tos',
        'Industry News & Commentary',
        'Software & App Recommendations',
        'Career Advice in Tech'
      ],
      contentTypeFocus: ['YouTube Videos', 'Shorts', 'Tweets', 'LinkedIn Posts', 'Instagram Reels'],
      targetKeywords: [
        'tech review',
        'gadgets 2024',
        'best smartphone',
        'laptop comparison',
        'tech tips',
        'software tutorial',
        'coding for beginners',
        'tech career advice'
      ],
      communicationStyle: 'Conversational and informative, using real-world analogies to explain technical concepts.',
      formality: 'casual',
      emotionalTone: 'Optimistic and enthusiastic',
      complexity: 'moderate',
      callToActionStyle: 'subtle',
      competitorAnalysis: {
        topCompetitors: [
          {
            name: 'MKBHD',
            strengths: ['High production quality', 'Early access to products', 'Neutral reviews'],
            weaknesses: ['Less frequent uploads', 'Minimal personality']
          },
          {
            name: 'Linus Tech Tips',
            strengths: ['Entertaining', 'Deep technical knowledge', 'Community engagement'],
            weaknesses: ['Long videos', 'Can be too technical for beginners']
          }
        ],
        opportunities: [
          'Focus on budget-friendly tech for emerging markets',
          'Create more content in regional languages',
          'Emphasize practical use cases over specs'
        ]
      },
      status: BrandProfileStatus.READY,
      trainingProgress: 100,
      lastTrainedAt: new Date()
    }
  })

  console.log(`Demo brand profile created: ${demoProfile.name} (ID: ${demoProfile.id})`)

  // Create some demo assets
  const demoAssets = [
    {
      profileId: demoProfile.id,
      fileName: 'sample_tech_review.pdf',
      originalName: 'Sample_Tech_Review_Transcript.pdf',
      filePath: `/profiles/${user.id}/sample_tech_review.pdf`,
      fileSize: 125000,
      fileType: AssetType.PDF,
      mimeType: 'application/pdf',
      extractedText: 'Welcome back to the channel! Today we\'re reviewing the latest smartphone that\'s been making waves in the tech community...'
    },
    {
      profileId: demoProfile.id,
      fileName: 'brand_voice_guide.txt',
      originalName: 'Brand_Voice_Guide.txt',
      filePath: `/profiles/${user.id}/brand_voice_guide.txt`,
      fileSize: 4500,
      fileType: AssetType.TXT,
      mimeType: 'text/plain',
      extractedText: 'Our brand voice is approachable, knowledgeable, and authentic. We avoid jargon unless we explain it...'
    },
    {
      profileId: demoProfile.id,
      fileName: 'content_samples.docx',
      originalName: 'Content_Samples.docx',
      filePath: `/profiles/${user.id}/content_samples.docx`,
      fileSize: 89000,
      fileType: AssetType.DOCX,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      extractedText: 'Top 10 Tech Trends to Watch in 2024... 5 Apps That Will Change Your Productivity...'
    }
  ]

  for (const asset of demoAssets) {
    await prisma.brandAsset.upsert({
      where: {
        id: `demo-asset-${asset.fileName.split('.')[0]}`
      },
      update: {},
      create: {
        id: `demo-asset-${asset.fileName.split('.')[0]}`,
        ...asset
      }
    })
  }

  console.log(`Created ${demoAssets.length} demo assets`)
  console.log('Demo brand profile seeding complete!')
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
