import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTechInfluencerProfile() {
  try {
    // Get the first user (your logged-in user)
    const user = await prisma.user.findFirst({
      orderBy: { createdAt: 'desc' },
    })

    if (!user) {
      console.error('❌ No user found. Please log in first.')
      return
    }

    console.log(`📝 Creating tech influencer profile for: ${user.email}`)

    // Create tech influencer brand profile
    const brandProfile = await prisma.brandProfile.create({
      data: {
        userId: user.id,
        name: 'Tech Influencer Pro',
        description: 'A tech influencer focused on web development, AI, and emerging technologies. Creating educational content that makes complex topics accessible.',
        industry: 'Technology & Software Development',
        targetAudience: 'Developers, tech enthusiasts, and aspiring programmers aged 18-35',

        // Brand colors (tech-themed)
        brandColors: {
          primary: '#3B82F6', // Blue
          secondary: '#8B5CF6', // Purple
          accent: '#F59E0B', // Amber
          background: '#1F2937', // Dark gray
          text: '#F3F4F6', // Light gray
        },

        // Tone attributes
        tone: [
          'Educational',
          'Approachable',
          'Enthusiastic',
          'Professional',
          'Tech-savvy',
          'Encouraging',
        ],

        // Advanced fields
        website: 'https://techinfluencer.dev',
        uniqueSellingProposition: 'Simplifying complex tech concepts through hands-on tutorials and real-world projects',

        competitorChannels: [
          'https://youtube.com/@fireship',
          'https://youtube.com/@ThePrimeagen',
          'https://youtube.com/@t3dotgg',
        ],

        contentPillars: [
          'Web Development Tutorials',
          'AI & Machine Learning',
          'Developer Tools & Productivity',
          'Tech News & Trends',
          'Coding Best Practices',
          'Career Advice for Developers',
        ],

        contentTypeFocus: [
          'Quick Tips (60 seconds)',
          'In-depth Tutorials (10-15 min)',
          'Project Builds',
          'Tech Explainers',
          'Tool Reviews',
          'Live Coding Sessions',
        ],

        targetKeywords: [
          'web development',
          'javascript tutorial',
          'react',
          'nextjs',
          'typescript',
          'ai development',
          'coding tutorial',
          'programming',
          'software engineering',
          'full stack development',
        ],

        communicationStyle: 'Clear, concise, and example-driven. Uses analogies to explain complex concepts. Balances technical depth with accessibility.',
        formality: 'casual',
        emotionalTone: 'Enthusiastic and encouraging, celebrating wins and normalizing struggles in learning to code',
        complexity: 'moderate',
        callToActionStyle: 'direct',

        competitorAnalysis: {
          strengths: [
            'Fast-paced, engaging video style',
            'Covers trending topics quickly',
            'Strong community engagement',
          ],
          opportunities: [
            'More beginner-friendly content',
            'Longer-form deep dives',
            'Interactive coding challenges',
          ],
          differentiators: [
            'Focus on real-world projects',
            'Emphasis on best practices from day one',
            'Career development integration',
          ],
        },

        status: 'READY',
        trainingProgress: 100,
        lastTrainedAt: new Date(),
      },
    })

    console.log('✅ Tech Influencer Profile created successfully!')
    console.log(`   ID: ${brandProfile.id}`)
    console.log(`   Name: ${brandProfile.name}`)
    console.log(`   Status: ${brandProfile.status}`)
    console.log(`   Industry: ${brandProfile.industry}`)
    console.log(`   Content Pillars: ${brandProfile.contentPillars.join(', ')}`)
    console.log('\n🎉 Profile is ready to use!')

  } catch (error) {
    console.error('❌ Error creating brand profile:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTechInfluencerProfile()
