const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const profiles = await prisma.brandProfile.findMany({
    select: {
      id: true,
      name: true,
      industry: true,
      competitorChannels: true,
      inspirationChannels: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  console.log('BRAND PROFILES:');
  console.log('================');
  if (profiles.length === 0) {
    console.log('No profiles found.');
  } else {
    profiles.forEach(p => {
      console.log(`\nName: ${p.name}`);
      console.log(`ID: ${p.id}`);
      console.log(`Industry: ${p.industry || 'None'}`);
      console.log(`Competitors: ${p.competitorChannels?.length || 0} channels`);
      if (p.competitorChannels?.length) {
        console.log(`  Competitor IDs: ${p.competitorChannels.join(', ')}`);
      }
      console.log(`Inspirations: ${p.inspirationChannels?.length || 0} channels`);
      if (p.inspirationChannels?.length) {
        console.log(`  Inspiration IDs: ${p.inspirationChannels.join(', ')}`);
      }
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
