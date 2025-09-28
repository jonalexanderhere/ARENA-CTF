import { PrismaClient } from './prisma';

// Database optimization utilities
export class DatabaseOptimizer {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  // Add database indexes for better performance
  async addIndexes() {
    try {
      // These indexes should be added to the Prisma schema
      console.log('Adding database indexes for better performance...');
      
      // Note: In a real implementation, you would add these to your migration files
      // For now, we'll just log the recommended indexes
      
      const recommendedIndexes = [
        'CREATE INDEX IF NOT EXISTS idx_submissions_team_challenge ON Submission(teamId, challengeId)',
        'CREATE INDEX IF NOT EXISTS idx_submissions_correct ON Submission(isCorrect)',
        'CREATE INDEX IF NOT EXISTS idx_challenges_category ON Challenge(category)',
        'CREATE INDEX IF NOT EXISTS idx_challenges_active ON Challenge(isActive)',
        'CREATE INDEX IF NOT EXISTS idx_teams_score ON Team(score DESC)',
        'CREATE INDEX IF NOT EXISTS idx_scores_team ON Score(teamId)',
        'CREATE INDEX IF NOT EXISTS idx_scores_challenge ON Score(challengeId)',
        'CREATE INDEX IF NOT EXISTS idx_activity_log_team ON ActivityLog(teamId)',
        'CREATE INDEX IF NOT EXISTS idx_activity_log_created ON ActivityLog(createdAt)',
        'CREATE INDEX IF NOT EXISTS idx_team_hints_team ON TeamHint(teamId)',
        'CREATE INDEX IF NOT EXISTS idx_team_hints_hint ON TeamHint(hintId)',
        'CREATE INDEX IF NOT EXISTS idx_challenge_flags_challenge ON ChallengeFlag(challengeId)',
        'CREATE INDEX IF NOT EXISTS idx_unlock_conditions_challenge ON UnlockCondition(challengeId)',
        'CREATE INDEX IF NOT EXISTS idx_team_point_history_team ON TeamPointHistory(teamId)',
        'CREATE INDEX IF NOT EXISTS idx_team_point_history_created ON TeamPointHistory(createdAt)'
      ];

      console.log('Recommended indexes for performance:');
      recommendedIndexes.forEach(index => console.log(`  ${index}`));
      
      return true;
    } catch (error) {
      console.error('Error adding indexes:', error);
      return false;
    }
  }

  // Optimize database queries
  async optimizeQueries() {
    try {
      console.log('Optimizing database queries...');
      
      // Analyze query performance
      const queryStats = await this.prisma.$queryRaw`
        SELECT 
          name,
          sql,
          calls,
          total_time,
          mean_time
        FROM pg_stat_statements 
        WHERE calls > 10 
        ORDER BY total_time DESC 
        LIMIT 10
      `;

      console.log('Top slow queries:', queryStats);
      
      return true;
    } catch (error) {
      console.error('Error optimizing queries:', error);
      return false;
    }
  }

  // Clean up old data
  async cleanupOldData() {
    try {
      console.log('Cleaning up old data...');
      
      // Clean up old activity logs (older than 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const deletedLogs = await this.prisma.activityLog.deleteMany({
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
      
      const deletedSubmissions = await this.prisma.submission.deleteMany({
        where: {
          createdAt: {
            lt: ninetyDaysAgo
          },
          isCorrect: false // Only delete incorrect submissions
        }
      });
      
      console.log(`Deleted ${deletedSubmissions.count} old incorrect submissions`);
      
      return true;
    } catch (error) {
      console.error('Error cleaning up old data:', error);
      return false;
    }
  }

  // Get database statistics
  async getStats() {
    try {
      const stats = await this.prisma.$queryRaw`
        SELECT 
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          n_live_tup as live_tuples,
          n_dead_tup as dead_tuples
        FROM pg_stat_user_tables 
        ORDER BY n_live_tup DESC
      `;
      
      return stats;
    } catch (error) {
      console.error('Error getting database stats:', error);
      return null;
    }
  }
}

// Connection pooling configuration
export const connectionConfig = {
  // Prisma connection pooling settings
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
      // Connection pool settings
      connection_limit: 10,
      pool_timeout: 20,
      // SQLite specific optimizations
      pragma: [
        'journal_mode=WAL',
        'synchronous=NORMAL',
        'cache_size=10000',
        'temp_store=MEMORY'
      ]
    }
  }
};

// Query optimization helpers
export const queryOptimizations = {
  // Use select to limit fields
  selectOnly: (fields: string[]) => {
    return fields.reduce((acc, field) => {
      acc[field] = true;
      return acc;
    }, {} as Record<string, boolean>);
  },

  // Batch operations
  batchSize: 100,

  // Cache frequently accessed data
  cacheKeys: {
    leaderboard: 'leaderboard',
    challenges: 'challenges',
    teams: 'teams',
    config: 'config'
  }
};

