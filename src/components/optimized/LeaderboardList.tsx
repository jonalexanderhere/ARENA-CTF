import React, { memo, useMemo } from 'react';
import { useOptimizedFetch } from '@/hooks/useOptimizedFetch';
import { TableSkeleton } from '@/components/common/OptimizedLoadingSpinner';

interface Team {
  id: string;
  name: string;
  score: number;
  icon: string;
  color: string;
}

interface LeaderboardData {
  teams: Team[];
  currentUserTeam: Team | null;
}

const LeaderboardList = memo(() => {
  const { data, loading, error } = useOptimizedFetch<LeaderboardData>('/api/leaderboard', {
    refetchInterval: 10000, // Refetch every 10 seconds
    cache: true,
    cacheTime: 60 * 1000 // 1 minute cache
  });

  const teams = useMemo(() => data?.teams || [], [data?.teams]);
  const currentUserTeam = data?.currentUserTeam;

  if (loading) {
    return (
      <div className="space-y-4">
        <TableSkeleton rows={8} columns={4} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading leaderboard: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">Leaderboard</h2>
        </div>
        
        <div className="divide-y divide-gray-700">
          {teams.map((team, index) => (
            <LeaderboardRow
              key={team.id}
              team={team}
              rank={index + 1}
              isCurrentUser={currentUserTeam?.id === team.id}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

LeaderboardList.displayName = 'LeaderboardList';

const LeaderboardRow = memo<{
  team: Team;
  rank: number;
  isCurrentUser: boolean;
}>(({ team, rank, isCurrentUser }) => {
  const rankColor = useMemo(() => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-gray-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-gray-400';
  }, [rank]);

  const rankIcon = useMemo(() => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return rank.toString();
  }, [rank]);

  return (
    <div className={`px-6 py-4 flex items-center justify-between ${
      isCurrentUser ? 'bg-blue-900/20 border-l-4 border-blue-500' : ''
    }`}>
      <div className="flex items-center space-x-4">
        <div className={`text-2xl font-bold ${rankColor}`}>
          {rankIcon}
        </div>
        
        <div className="flex items-center space-x-3">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
            style={{ backgroundColor: team.color }}
          >
            {team.icon}
          </div>
          
          <div>
            <h3 className={`font-semibold ${
              isCurrentUser ? 'text-blue-400' : 'text-white'
            }`}>
              {team.name}
            </h3>
            {isCurrentUser && (
              <p className="text-xs text-blue-300">Your team</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-right">
        <div className="text-lg font-bold text-white">
          {team.score.toLocaleString()}
        </div>
        <div className="text-sm text-gray-400">points</div>
      </div>
    </div>
  );
});

LeaderboardRow.displayName = 'LeaderboardRow';

export default LeaderboardList;

