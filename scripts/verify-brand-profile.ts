import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyProfile() {
  try {
    const user = await prisma.user.findFirst({
      where: { email: 'frosticebiz@gmail.com' },
      include: {
        brandProfiles: true,
      },
    })

    if (!user) {
      console.error('❌ User not found')
      return
    }

    console.log('✅ User Found:')
    console.log(`   Email: ${user.email}`)
    console.log(`   Name: ${user.fullName}`)
    console.log(`   ID: ${user.id}`)
    console.log(`\n📊 Brand Profiles: ${user.brandProfiles.length}`)

    user.brandProfiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.name}`)
      console.log(`   ID: ${profile.id}`)
      console.log(`   Status: ${profile.status}`)
      console.log(`   Industry: ${profile.industry}`)
      console.log(`   Training Progress: ${profile.trainingProgress}%`)
      console.log(`   Tone: ${profile.tone.join(', ')}`)
      console.log(`   Content Pillars: ${profile.contentPillars.slice(0, 3).join(', ')}...`)
    })

    console.log('\n✅ Profile is ready to use in the app!')
    console.log(`   Visit: http://localhost:3000/dashboard/brand-profiles`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyProfile()
