import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTechBrandProfile() {
  // Get the first user (you'll need to be logged in)
  const users = await prisma.user.findMany({
    take: 1,
    orderBy: { createdAt: 'asc' }
  })

  if (users.length === 0) {
    console.error('No users found. Please sign up first.')
    return
  }

  const user = users[0]
  console.log(`Creating tech brand profile for user: ${user.email}`)

  // Check if tech profile already exists
  const existing = await prisma.brandProfile.findFirst({
    where: {
      userId: user.id,
      name: { contains: 'Tech' }
    }
  })

  if (existing) {
    console.log('Tech brand profile already exists:', existing.name)
    return
  }

  // Create the tech brand profile
  const profile = await prisma.brandProfile.create({
    data: {
      userId: user.id,
      name: 'TechVibe Academy',
      description: 'Empowering tech enthusiasts with cutting-edge tutorials, reviews, and industry insights. Making complex technology accessible to everyone.',
      industry: 'Technology',
      targetAudience: 'Tech enthusiasts, developers, and digital creators aged 18-35 looking to stay ahead of technology trends',
      brandColors: ['#6366F1', '#8B5CF6', '#A855F7'],
      tone: ['EDUCATIONAL', 'CASUAL'],
      status: 'READY',

      // Advanced fields
      website: 'https://techvibe.academy',
      uniqueSellingProposition: 'Breaking down complex tech concepts into digestible, actionable content with real-world applications',

      // Competitor channels (popular tech YouTubers)
      competitorChannels: [
        'MKBHD',
        'Linus Tech Tips',
        'Unbox Therapy',
        'Dave2D',
        'Austin Evans'
      ],

      // Content pillars
      contentPillars: [
        'Product Reviews & Comparisons',
        'Tutorial & How-To Guides',
        'Industry News & Trends',
        'Tech Tips & Tricks',
        'Career Advice in Tech'
      ],

      // Content type focus
      contentTypeFocus: [
        'VIDEO_REVIEWS',
        'TUTORIALS',
        'NEWS_COVERAGE',
        'TIPS_TRICKS'
      ],

      // Target keywords
      targetKeywords: [
        'technology',
        'gadgets',
        'software',
        'programming',
        'AI',
        'productivity',
        'reviews',
        'tutorials'
      ],

      // Communication style
      communicationStyle: 'CONVERSATIONAL',
      formality: 'SEMI_FORMAL',
      emotionalTone: 'OPTIMISTIC',
      complexity: 'MODERATE',
      callToActionStyle: 'FRIENDLY_INVITATION'
    }
  })

  console.log('✅ Tech brand profile created successfully!')
  console.log(`Profile Name: ${profile.name}`)
  console.log(`Industry: ${profile.industry}`)
  console.log(`ID: ${profile.id}`)
}

createTechBrandProfile()
  .catch((error) => {
    console.error('Error creating profile:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
