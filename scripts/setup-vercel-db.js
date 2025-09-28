const { PrismaClient } = require('../prisma/generated/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function setupVercelDatabase() {
  console.log('🚀 Setting up PHOENIX ARENA CTF for Vercel deployment...\n');

  try {
    // Check if data already exists
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      console.log('✅ Database already populated, skipping setup');
      return;
    }

    console.log('📝 Creating site configurations...');
    const siteConfigs = [
      { key: 'site_title', value: 'PHOENIX ARENA CTF' },
      { key: 'homepage_title', value: 'Welcome to PHOENIX ARENA CTF' },
      { key: 'homepage_subtitle', value: 'Rise from the ashes! Epic cyber battles in the PHOENIX ARENA.' },
      { key: 'rules_text', value: 'Welcome to PHOENIX ARENA CTF - Where Champions Rise!' }
    ];

    for (const config of siteConfigs) {
      await prisma.siteConfig.upsert({
        where: { key: config.key },
        update: config,
        create: config
      });
    }

    console.log('🎮 Creating game configuration...');
    await prisma.gameConfig.upsert({
      where: { id: 'default' },
      update: {
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      },
      create: {
        id: 'default',
        startTime: new Date(),
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isActive: true,
      }
    });

    console.log('👑 Creating admin users...');
    const adminUsers = [
      { alias: 'phoenix1', name: 'Phoenix Admin 1', password: 'phoenix123' },
      { alias: 'phoenix2', name: 'Phoenix Admin 2', password: 'phoenix123' },
      { alias: 'phoenix3', name: 'Phoenix Admin 3', password: 'phoenix123' },
      { alias: 'phoenix4', name: 'Phoenix Admin 4', password: 'phoenix123' },
      { alias: 'phoenix5', name: 'Phoenix Admin 5', password: 'phoenix123' }
    ];

    for (const adminData of adminUsers) {
      const hashedPassword = await bcrypt.hash(adminData.password, 12);
      await prisma.user.upsert({
        where: { alias: adminData.alias },
        update: {
          name: adminData.name,
          password: hashedPassword,
          isAdmin: true,
          isTeamLeader: false
        },
        create: {
          alias: adminData.alias,
          name: adminData.name,
          password: hashedPassword,
          isAdmin: true,
          isTeamLeader: false
        }
      });
    }

    console.log('🏆 Creating teams...');
    const ridhoTeam = await prisma.team.upsert({
      where: { code: 'RIDHO001' },
      update: {
        name: 'RidhoDatabase',
        icon: 'GiSpaceship',
        color: '#ff6b35',
        score: 0
      },
      create: {
        name: 'RidhoDatabase',
        code: 'RIDHO001',
        icon: 'GiSpaceship',
        color: '#ff6b35',
        score: 0
      }
    });

    const monokTeam = await prisma.team.upsert({
      where: { code: 'MONOK002' },
      update: {
        name: 'MonokKiller',
        icon: 'GiSpaceship',
        color: '#4ecdc4',
        score: 0
      },
      create: {
        name: 'MonokKiller',
        code: 'MONOK002',
        icon: 'GiSpaceship',
        color: '#4ecdc4',
        score: 0
      }
    });

    console.log('👥 Creating team members...');
    const ridhoMembers = [
      { alias: 'ridho_leader', name: 'Ridho Database Leader', password: 'ridho123', isTeamLeader: true },
      { alias: 'ridho_member1', name: 'Ridho Database Member 1', password: 'ridho123', isTeamLeader: false },
      { alias: 'ridho_member2', name: 'Ridho Database Member 2', password: 'ridho123', isTeamLeader: false }
    ];

    for (const memberData of ridhoMembers) {
      const hashedPassword = await bcrypt.hash(memberData.password, 12);
      await prisma.user.upsert({
        where: { alias: memberData.alias },
        update: {
          name: memberData.name,
          password: hashedPassword,
          isAdmin: false,
          isTeamLeader: memberData.isTeamLeader,
          teamId: ridhoTeam.id
        },
        create: {
          alias: memberData.alias,
          name: memberData.name,
          password: hashedPassword,
          isAdmin: false,
          isTeamLeader: memberData.isTeamLeader,
          teamId: ridhoTeam.id
        }
      });
    }

    const monokMembers = [
      { alias: 'monok_leader', name: 'Monok Killer Leader', password: 'monok123', isTeamLeader: true },
      { alias: 'monok_member1', name: 'Monok Killer Member 1', password: 'monok123', isTeamLeader: false }
    ];

    for (const memberData of monokMembers) {
      const hashedPassword = await bcrypt.hash(memberData.password, 12);
      await prisma.user.upsert({
        where: { alias: memberData.alias },
        update: {
          name: memberData.name,
          password: hashedPassword,
          isAdmin: false,
          isTeamLeader: memberData.isTeamLeader,
          teamId: monokTeam.id
        },
        create: {
          alias: memberData.alias,
          name: memberData.name,
          password: hashedPassword,
          isAdmin: false,
          isTeamLeader: memberData.isTeamLeader,
          teamId: monokTeam.id
        }
      });
    }

    console.log('🎯 Creating challenges...');
    const challenges = [
      {
        title: 'GoodGameBoy',
        description: 'A web hacking challenge that tests your skills in finding vulnerabilities.',
        category: 'WEB HACKING',
        points: 10,
        flag: 'PHOENIX{web_hack_success}',
        difficulty: 'easy',
        isActive: true,
        isLocked: false
      },
      {
        title: 'CAESAR',
        description: 'Decrypt this Caesar cipher to find the flag.',
        category: 'CRYPTOGRAPHY',
        points: 5,
        flag: 'PHOENIX{caesar_cipher_solved}',
        difficulty: 'easy',
        isActive: true,
        isLocked: false
      },
      {
        title: 'TIKUS',
        description: 'A medium difficulty challenge that requires creative thinking.',
        category: 'MEDIUM',
        points: 10,
        flag: 'PHOENIX{tikus_solved}',
        difficulty: 'medium',
        isActive: true,
        isLocked: false
      }
    ];

    for (const challengeData of challenges) {
      await prisma.challenge.upsert({
        where: { title: challengeData.title },
        update: challengeData,
        create: challengeData
      });
    }

    console.log('📢 Creating announcements...');
    const announcements = [
      {
        title: 'Welcome to PHOENIX ARENA CTF!',
        content: 'Welcome to the PHOENIX ARENA! Rise from the ashes and prove your skills in epic cyber battles.'
      },
      {
        title: 'Team Registration Open',
        content: 'Team registration is now open. Form your teams and prepare for battle!'
      }
    ];

    for (const announcementData of announcements) {
      await prisma.announcement.upsert({
        where: { title: announcementData.title },
        update: announcementData,
        create: announcementData
      });
    }

    console.log('\n🔥 PHOENIX ARENA CTF Vercel Setup Complete!');
    console.log('✅ Database ready for production deployment');

  } catch (error) {
    console.error('❌ Error setting up Vercel database:', error.message);
  }
}

setupVercelDatabase()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
