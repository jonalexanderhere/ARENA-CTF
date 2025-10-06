const { PrismaClient } = require('../prisma/generated/client');

const prisma = new PrismaClient();

async function setupFullDatabase() {
  try {
    console.log('🚀 Setting up full PHOENIX ARENA CTF database...');

    // Create admin users
    const adminUsers = [
      { name: 'Admin Phoenix', alias: 'phoenix_admin', password: 'admin123', isAdmin: true },
      { name: 'Admin Arena', alias: 'arena_admin', password: 'admin123', isAdmin: true },
      { name: 'Admin CTF', alias: 'ctf_admin', password: 'admin123', isAdmin: true },
      { name: 'Admin Master', alias: 'master_admin', password: 'admin123', isAdmin: true },
      { name: 'Admin System', alias: 'system_admin', password: 'admin123', isAdmin: true }
    ];

    console.log('👥 Creating admin users...');
    for (const admin of adminUsers) {
      await prisma.user.upsert({
        where: { alias: admin.alias },
        update: admin,
        create: admin
      });
    }

    // Create regular users
    const regularUsers = [
      { name: 'Player One', alias: 'player1', password: 'player123', isAdmin: false },
      { name: 'Player Two', alias: 'player2', password: 'player123', isAdmin: false }
    ];

    console.log('👤 Creating regular users...');
    for (const user of regularUsers) {
      await prisma.user.upsert({
        where: { alias: user.alias },
        update: user,
        create: user
      });
    }

    // Create teams
    const teams = [
      { name: 'RidhoDatabase', code: 'RIDHO001', icon: 'GiSpaceship', color: '#FF6B35', score: 0 },
      { name: 'MonokKiller', code: 'MONOK001', icon: 'GiRocket', color: '#4ECDC4', score: 0 }
    ];

    console.log('🏆 Creating teams...');
    for (const team of teams) {
      await prisma.team.upsert({
        where: { name: team.name },
        update: team,
        create: team
      });
    }

    // Create site configurations
    const siteConfigs = [
      { key: 'site_title', value: 'PHOENIX ARENA CTF' },
      { key: 'homepage_title', value: 'Welcome to PHOENIX ARENA CTF' },
      { key: 'homepage_subtitle', value: 'Rise from the ashes! Epic cyber battles in the PHOENIX ARENA.' }
    ];

    console.log('⚙️ Creating site configurations...');
    for (const config of siteConfigs) {
      await prisma.siteConfig.upsert({
        where: { key: config.key },
        update: config,
        create: config
      });
    }

    // Create game configuration
    const gameConfig = {
      startTime: new Date().toISOString(),
      endTime: null,
      isActive: true
    };

    console.log('🎮 Creating game configuration...');
    await prisma.gameConfig.upsert({
      where: { id: 'main' },
      update: gameConfig,
      create: { id: 'main', ...gameConfig }
    });

    // Create sample challenges
    const challenges = [
      {
        title: 'Phoenix Rising',
        description: 'Rise from the ashes and prove your worth in the arena!',
        category: 'Web',
        points: 100,
        difficulty: 'Easy',
        flag: 'PHOENIX{rise_from_ashes}',
        isActive: true,
        isLocked: false
      },
      {
        title: 'Arena Guardian',
        description: 'Protect the arena from intruders and secure the gates!',
        category: 'Crypto',
        points: 200,
        difficulty: 'Medium',
        flag: 'PHOENIX{guardian_protection}',
        isActive: true,
        isLocked: false
      },
      {
        title: 'CTF Master',
        description: 'Master the art of capture the flag and dominate the arena!',
        category: 'Pwn',
        points: 300,
        difficulty: 'Hard',
        flag: 'PHOENIX{master_domination}',
        isActive: true,
        isLocked: false
      }
    ];

    console.log('🏁 Creating sample challenges...');
    for (const challenge of challenges) {
      const existing = await prisma.challenge.findFirst({
        where: { title: challenge.title }
      });
      if (!existing) {
        await prisma.challenge.create({
          data: challenge
        });
      }
    }

    console.log('✅ Database setup completed successfully!');
    console.log('🔥 PHOENIX ARENA CTF is ready for battle!');

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupFullDatabase();
