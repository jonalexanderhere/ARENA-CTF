import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { cache, CACHE_KEYS } from '@/lib/cache';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const cacheKey = `${CACHE_KEYS.LEADERBOARD}_${session?.user?.teamId || 'anonymous'}`;
    
    // Check cache first (with shorter TTL for better real-time updates)
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return NextResponse.json(cachedData);
    }

    // Optimized query - get teams with minimal data
    const teams = await prisma.team.findMany({
      select: {
        id: true,
        name: true,
        score: true,
        icon: true,
        color: true,
      },
      orderBy: {
        score: 'desc',
      },
    });

    console.log('Leaderboard API: Found', teams.length, 'teams');

    // Get current user's team only if authenticated - use the teams array if possible
    let currentUserTeam = null;
    if (session?.user?.teamId) {
      currentUserTeam = teams.find(team => team.id === session.user.teamId) || null;
    }

    const result = {
      teams,
      currentUserTeam,
    };

    // Cache the result for 30 seconds (shorter for better real-time updates)
    cache.set(cacheKey, result, 30 * 1000);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}