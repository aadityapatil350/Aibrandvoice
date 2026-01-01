const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const channels = await prisma.youTubeChannel.findMany({
    select: {
      channelId: true,
      title: true,
      isCompetitor: true,
      isInspirational: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log('SAVED YOUTUBE CHANNELS:');
  console.log('========================');
  if (channels.length === 0) {
    console.log('No saved channels found.');
  } else {
    channels.forEach(c => {
      const type = c.isCompetitor ? '[COMPETITOR]' : c.isInspirational ? '[INSPIRATION]' : '[GENERAL]';
      console.log(`${type} ${c.title}`);
      console.log(`    Channel ID: ${c.channelId}`);
    });
  }

  await prisma.$disconnect();
}

main().catch(console.error);
