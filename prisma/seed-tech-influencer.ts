import { PrismaClient, AssetType } from '@prisma/client'

const prisma = new PrismaClient()

async function seedTechInfluencerProfile() {
  // First, get or create a test user
  let user = await prisma.user.findFirst({
    where: { email: 'tech.influencer@example.com' }
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        id: 'tech-influencer-user-id',
        supabaseId: 'tech-influencer-user-id',
        email: 'tech.influencer@example.com'
      }
    })
    console.log('Created test user:', user.email)
  }

  // Create the tech influencer brand profile
  const brandProfile = await prisma.brandProfile.upsert({
    where: {
      id: 'tech-influencer-profile-id'
    },
    create: {
      id: 'tech-influencer-profile-id',
      userId: user.id,
      name: 'TechReview Pro',
      description: 'Professional tech reviewer focused on smartphones, laptops, and consumer electronics. Known for in-depth technical analysis, honest reviews, and helping consumers make informed purchasing decisions.',
      industry: 'Technology',
      targetAudience: 'Tech-savvy millennials and Gen Z consumers aged 18-35 looking for honest, detailed tech reviews and buying advice',
      brandColors: {
        primary: '#0066CC',
        secondary: '#FF6B35',
        accent: '#00D9FF',
        neutral: '#1A1A2E',
        background: '#F8F9FA'
      },
      tone: ['Professional', 'Authoritative', 'Educational', 'Conversational', 'Technical'],
      voiceModel: 'deepseek-chat',
      status: 'READY',
      trainingProgress: 100,
      lastTrainedAt: new Date(),

      // Advanced fields
      website: 'https://techreviewpro.com',
      uniqueSellingProposition: 'Unbiased, data-driven tech reviews with real-world testing and consumer-first recommendations',
      competitorChannels: [
        'https://www.youtube.com/@MKBHD',
        'https://www.youtube.com/@LinusTechTips',
        'https://www.youtube.com/@UnboxTherapy'
      ],
      contentPillars: [
        'Smartphone Reviews',
        'Laptop & PC Hardware',
        'Consumer Electronics',
        'Tech Buying Guides',
        'Industry News & Analysis',
        'Tutorial & How-To Content'
      ],
      contentTypeFocus: [
        'YouTube Videos',
        'Blog Posts',
        'Social Media',
        'Newsletters'
      ],
      targetKeywords: [
        'smartphone review',
        'best laptop 2024',
        'tech buying guide',
        'phone comparison',
        'gadget review',
        'tech tips',
        'consumer electronics',
        'unboxing'
      ],
      communicationStyle: 'Informative yet conversational - breaks down complex technical concepts into understandable terms while maintaining credibility',
      formality: 'mixed',
      emotionalTone: 'professional',
      complexity: 'moderate',
      callToActionStyle: 'subtle',

      // Competitor Analysis Results
      competitorAnalysis: {
        topCompetitors: [
          {
            name: 'Marques Brownlee (MKBHD)',
            subscribers: '18.9M',
            avgViews: '4.2M',
            strengths: ['Cinematic quality', 'Early access to products', 'Clean presentation'],
            contentThemes: ['Smartphones', 'EVs', 'Audio gear', 'Tech prototypes']
          },
          {
            name: 'Linus Tech Tips',
            subscribers: '15.7M',
            avgViews: '2.8M',
            strengths: ['Deep technical dives', 'Entertainment value', 'Community building'],
            contentThemes: ['PC building', 'Hardware reviews', 'Tech experiments', 'Server builds']
          },
          {
            name: 'Unbox Therapy',
            subscribers: '18.2M',
            avgViews: '1.5M',
            strengths: ['First looks', 'Premium presentation', 'Lifestyle tech'],
            contentThemes: ['Unboxings', 'Premium gadgets', 'Smartphones', 'Accessories']
          }
        ],
        suggestedTones: ['Professional', 'Knowledgeable', 'Approachable', 'Honest'],
        commonThemes: [
          'Product specifications breakdown',
          'Real-world performance testing',
          'Price-to-value analysis',
          'Design and build quality assessment',
          'Camera comparisons',
          'Battery life testing'
        ],
        successfulFormats: [
          'In-depth review videos (10-20 min)',
          'Quick first impression videos (3-5 min)',
          'Comparison videos',
          'Buying guide lists',
          'Hands-on coverage at tech events'
        ],
        insights: {
          averageVideoLength: '12-15 minutes',
          optimalUploadFrequency: '2-3 videos per week',
          bestPostingDays: ['Tuesday', 'Thursday', 'Saturday'],
          trendingTopics: ['AI integration', 'Foldable phones', 'Electric vehicles', 'Smart home tech']
        }
      }
    },
    update: {
      status: 'READY',
      trainingProgress: 100,
      lastTrainedAt: new Date(),
      tone: ['Professional', 'Authoritative', 'Educational', 'Conversational', 'Technical']
    }
  })

  console.log('✅ Tech Influencer brand profile created/updated:', brandProfile.name)

  // Create some sample assets
  const assets = [
    {
      profileId: brandProfile.id,
      fileName: 'iphone-15-pro-review.txt',
      originalName: 'iPhone_15_Pro_Max_Review_Transcript.txt',
      filePath: `/profiles/${user.id}/${brandProfile.id}/iphone-15-pro-review.txt`,
      fileSize: 45000,
      fileType: AssetType.TXT,
      mimeType: 'text/plain',
      extractedText: `
iPhone 15 Pro Max Review - The Ultimate Analysis

[Intro]
Hey everyone, welcome back to TechReview Pro! Today we're diving deep into the iPhone 15 Pro Max - Apple's most ambitious smartphone yet. After two weeks of daily use, extensive camera testing, and battery benchmarks, I'm ready to give you my honest verdict.

[Display & Design]
The 6.7-inch Super Retina XDR display is stunning. The new titanium frame isn't just about aesthetics - it actually makes the phone 15 grams lighter than last year's model. The Action Button is a welcome addition, customizable for different functions. I've set mine to activate the camera instantly.

[Performance]
The A17 Pro chip is a beast. Geekbench 6 scores show 25% improvement in single-core and 15% in multi-core performance. But real-world usage is what matters - apps open instantly, video rendering in Final Cut Pro is 40% faster, and gaming? The ray-tracing support is finally here.

[Camera System]
The 48MP main sensor with larger pixels captures incredible detail. But the real story is the 5x telephoto lens - perfect for portraits and some telephoto shots. Low light performance? Exemplary. Night mode shots from the 12MP ultra-wide are surprisingly usable.

[Battery Life]
With mixed usage, I'm consistently getting 7-8 hours of screen-on time. The USB-C port is finally here - charging at 25W. Not the fastest in the industry, but the convenience of using one cable for everything is priceless.

[Verdict]
At $1,199 starting price, this isn't for everyone. But if you want the best iPhone experience with a display that absolutely pops, cameras that rarely miss, and build quality that feels premium, the iPhone 15 Pro Max delivers.

Would I recommend it? If you're coming from an iPhone 13 or older, absolutely. From iPhone 14 Pro? Only if the 5x zoom and titanium build matter to you.

Drop a comment below - are you upgrading this year? And as always, thanks for watching!
      `
    },
    {
      profileId: brandProfile.id,
      fileName: 'macbook-pro-m3-review.txt',
      originalName: 'MacBook_Pro_M3_Review_Transcript.txt',
      filePath: `/profiles/${user.id}/${brandProfile.id}/macbook-pro-m3-review.txt`,
      fileSize: 52000,
      fileType: AssetType.TXT,
      mimeType: 'text/plain',
      extractedText: `
MacBook Pro M3 Max Review - Desktop Class Performance in a Laptop

[Intro]
What's up everyone! Apple just dropped the M3 Max, and spoiler alert - this thing is absolute overkill for most people. But if you're a video editor, 3D artist, or developer, this might just be your dream machine. Let's break it down.

[Specs & Build]
We're looking at a 16-inch Liquid Retina XDR display, up to 128GB of unified memory, and 8TB of storage. The chassis remains unchanged - still the same premium aluminum build, fantastic keyboard, and the best trackpad on any laptop.

[Benchmarks]
Cinebench R23 single-core: 2,134 points - that's 20% faster than M2 Max. Multi-core hits 28,400 points. GPU scores? The 40-core GPU scores 220,000 in Metal. For context, that's faster than most gaming laptops.

[Real-World Testing]
I edited a 45-minute 8K ProRes video with 5 streams of 4K footage simultaneously. No stuttering, no thermal throttling. The laptop stayed whisper-quiet and cool to the touch. Battery life during this intense workload? Still got 4 hours.

For developers, I compiled a large C++ project - 47 seconds. Compare that to my M1 Pro at 1 minute 23 seconds.

[Who Is This For?]
- 8K video editors: YES
- 3D artists using Blender/Maya: YES
- Software developers: Maybe - M3 Pro is probably enough
- Most users: Definitely not - save your money

[The Truth]
The M3 Max is incredibly powerful, but it's designed for professional workflows that most people simply don't have. If you're a creative professional who needs workstation power in a portable form factor, this is the best laptop money can buy.

But for 90% of users? The MacBook Air M2 or even M1 will handle everything you throw at it.

Let me know in the comments - would you actually use this much power? Or is it just tech dreams?
      `
    },
    {
      profileId: brandProfile.id,
      fileName: 'best-smartphones-2024.txt',
      originalName: 'Best_Smartphones_2024_Buying_Guide.txt',
      filePath: `/profiles/${user.id}/${brandProfile.id}/best-smartphones-2024.txt`,
      fileSize: 38000,
      fileType: AssetType.TXT,
      mimeType: 'text/plain',
      extractedText: `
Best Smartphones of 2024 - The Ultimate Buying Guide

Hey everyone! With so many options out there, choosing the right smartphone can be overwhelming. I've tested over 50 phones this year, and here are my top picks for every category and budget.

[Flagship Kings - $1000+]
1. iPhone 15 Pro Max - Best overall ecosystem, cameras, and video quality
2. Samsung Galaxy S24 Ultra - Best display, S-Pen, zoom capabilities
3. Pixel 8 Pro - Best AI features, clean Android experience

[Budget Champions - Under $600]
1. Pixel 7a - Best camera at this price point, clean software
2. Samsung Galaxy A54 - Great display, battery life, andSamsung's One UI
3. Nothing Phone (2) - Unique design, good software support

[Best for Specific Needs]
Best Cameras: iPhone 15 Pro Max (video) / Pixel 8 Pro (still photos)
Best Battery: Galaxy S24 Ultra
Best Display: Galaxy S24 Ultra (AMOLED 120Hz)
Best for Gaming: ASUS ROG Phone 8 Pro
Best Compact: iPhone 15 Pro / Galaxy S24

[Things to Consider]
- Ecosystem: iPhone works best with Mac, iPad, Apple Watch
- Longevity: Pixel offers 7 years of updates, iPhones typically 5-6
- Repairability: Nothing Phone leads here with parts availability
- Resale Value: iPhones hold value better

[My Personal Recommendation]
If you're on Android, get the Pixel 8 Pro for the camera and clean software. If on iOS, the 15 Pro Max is the no-compromise choice. But honestly? Last year's flagships are still incredible and can save you $300-400.

What's your daily driver? Let me know below! And if you found this helpful, hit that like button.
      `
    },
    {
      profileId: brandProfile.id,
      fileName: 'wireless-earbuds-guide.txt',
      originalName: 'Wireless_Earbuds_Buying_Guide_2024.txt',
      filePath: `/profiles/${user.id}/${brandProfile.id}/wireless-earbuds-guide.txt`,
      fileSize: 28000,
      fileType: AssetType.TXT,
      mimeType: 'text/plain',
      extractedText: `
Wireless Earbuds Guide 2024 - Budget to Premium

[The Reality]
Most wireless earbuds are good now. The differences come down to fit, features, and ecosystem. After testing 25+ pairs, here are my recommendations.

[Premium Tier - $200+]
AirPods Pro 2: Best ANC if you're in Apple ecosystem. The adaptive audio is genuinely useful. ANC: 9.5/10, Sound: 8.5/10, Battery: 6 hours with ANC on.

Sony WF-1000XM6: Best overall ANC and sound quality. LDAC support for Android is a plus. ANC: 10/10, Sound: 9.5/10, Battery: 8 hours.

Bose QuietComfort Ultra: Most comfortable for long sessions. ANC is incredible but sound is slightly bass-heavy.

[Mid-Range - $100-200]
Samsung Galaxy Buds2 Pro: Best for Samsung phones. ANC is solid, sound is balanced, compact size.

Nothing Ear (2): Best transparency mode, unique design, good sound for the price.

Sennheiser Momentum True Wireless 4: Audiophile sound, but ANC is just okay.

[Budget Friendly - Under $100]
Anker Soundcore Liberty 4 NC: Unbeatable value. Great ANC, good app, under $90.

Google Pixel Buds Pro: Often on sale, excellent for Pixel phones, decent ANC.

[Key Takeaways]
- iOS users: Get AirPods Pro 2 or wait for AirPods Pro 3
- Android users: Sony or Samsung depending on your phone
- Audiophiles: Sennheiser
- Budget: Anker Soundcore, honestly can't go wrong

What earbuds are you rocking? And what's the ONE feature you can't live without?
      `
    }
  ]

  // Create assets
  for (const asset of assets) {
    await prisma.brandAsset.upsert({
      where: { id: `${brandProfile.id}-${asset.fileName.replace(/\./g, '-')}` },
      create: {
        ...asset,
        id: `${brandProfile.id}-${asset.fileName.replace(/\./g, '-')}`
      },
      update: {}
    })
  }

  console.log(`✅ Created ${assets.length} sample assets`)

  // Create a voice training record
  const voiceTraining = await prisma.voiceTraining.upsert({
    where: { id: 'tech-influencer-training-id' },
    create: {
      id: 'tech-influencer-training-id',
      profileId: brandProfile.id,
      userId: user.id,
      modelVersion: 'deepseek-chat',
      trainingData: {
        assetsAnalyzed: assets.length,
        totalCharacters: assets.reduce((sum, a) => sum + a.fileSize, 0),
        trainingTimestamp: new Date().toISOString()
      },
      vectorEmbeddings: {
        model: 'deepseek-chat',
        textLength: assets.reduce((sum, a) => sum + a.fileSize, 0),
        tokensUsed: 8750,
        personalityTraits: ['Professional', 'Technical', 'Educational', 'Honest'],
        communicationStyle: 'Breaks down complex technical concepts into understandable terms while maintaining credibility',
        writingPatterns: {
          usesData: true,
          providesRealWorldTesting: true,
          includesSpecificExamples: true,
          balancedProsCons: true,
          givesHonestVerdict: true
        },
        vocabularyCharacteristics: {
          technicalLevel: 'moderate',
          usesIndustryTerms: true,
          explainsComplexTerms: true,
          avoidsOverlyTechnicalLanguage: false
        },
        keyPhrases: [
          'After extensive testing',
          'Real-world usage',
          'For context',
          'Let me break this down',
          'The verdict',
          'Would I recommend',
          'Drop a comment below'
        ],
        voiceSummary: 'Tech-focused reviewer who provides detailed, honest analysis of consumer electronics. Known for data-driven insights, real-world testing, and helping consumers make informed decisions. Balances technical expertise with accessible explanations. Consistently includes benchmarks, comparisons, and clear recommendations.'
      },
      status: 'COMPLETED',
      trainingStartedAt: new Date(Date.now() - 3600000), // 1 hour ago
      completedAt: new Date()
    },
    update: {
      status: 'COMPLETED',
      completedAt: new Date(),
      vectorEmbeddings: {
        model: 'deepseek-chat',
        textLength: assets.reduce((sum, a) => sum + a.fileSize, 0),
        tokensUsed: 8750,
        voiceSummary: 'Tech-focused reviewer who provides detailed, honest analysis of consumer electronics.'
      }
    }
  })

  console.log('✅ Voice training record created')

  console.log('\n🎉 Seed completed successfully!')
  console.log('Profile:', brandProfile.name)
  console.log('User:', user.email)
  console.log('Status:', brandProfile.status)
}

seedTechInfluencerProfile()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
