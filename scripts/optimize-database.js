const { PrismaClient } = require('../prisma/generated/client');

async function optimizeDatabase() {
  const prisma = new PrismaClient();

  console.log('🚀 Starting database optimization...');

  try {
    // Clean up old data
    console.log('🧹 Cleaning up old data...');
    
    // Clean up old activity logs (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const deletedLogs = await prisma.activityLog.deleteMany({
      where: {
        createdAt: {
          lt: thirtyDaysAgo
        }
      }
    });
    
    console.log(`Deleted ${deletedLogs.count} old activity logs`);
    
    // Clean up old submissions (older than 90 days)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    const deletedSubmissions = await prisma.submission.deleteMany({
      where: {
        createdAt: {
          lt: ninetyDaysAgo
        },
        isCorrect: false // Only delete incorrect submissions
      }
    });
    
    console.log(`Deleted ${deletedSubmissions.count} old incorrect submissions`);

    // Get database stats
    console.log('📈 Getting database statistics...');
    const userCount = await prisma.user.count();
    const teamCount = await prisma.team.count();
    const challengeCount = await prisma.challenge.count();
    const submissionCount = await prisma.submission.count();
    
    console.log('Database statistics:');
    console.log(`  Users: ${userCount}`);
    console.log(`  Teams: ${teamCount}`);
    console.log(`  Challenges: ${challengeCount}`);
    console.log(`  Submissions: ${submissionCount}`);

    console.log('✅ Database optimization completed successfully!');
  } catch (error) {
    console.error('❌ Error during database optimization:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase();
}

module.exports = { optimizeDatabase };
