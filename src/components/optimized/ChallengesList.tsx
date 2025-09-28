import React, { memo, useMemo } from 'react';
import { Challenge } from '@/types';
import { useOptimizedFetch } from '@/hooks/useOptimizedFetch';
import { SkeletonLoader } from '@/components/common/OptimizedLoadingSpinner';

interface ChallengesListProps {
  categoryId: string;
  onChallengeSelect?: (challenge: Challenge) => void;
}

const ChallengesList = memo<ChallengesListProps>(({ 
  categoryId, 
  onChallengeSelect 
}) => {
  const { data, loading, error } = useOptimizedFetch<{
    challenges: Challenge[];
  }>(`/api/challenges/categories/${categoryId}`, {
    refetchInterval: 30000, // Refetch every 30 seconds
    cache: true,
    cacheTime: 2 * 60 * 1000 // 2 minutes cache
  });

  const challenges = useMemo(() => data?.challenges || [], [data?.challenges]);

  if (loading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader lines={5} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Error loading challenges: {error}</p>
      </div>
    );
  }

  if (challenges.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No challenges found in this category.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {challenges.map((challenge) => (
        <ChallengeCard
          key={challenge.id}
          challenge={challenge}
          onClick={() => onChallengeSelect?.(challenge)}
        />
      ))}
    </div>
  );
});

ChallengesList.displayName = 'ChallengesList';

const ChallengeCard = memo<{
  challenge: Challenge;
  onClick?: () => void;
}>(({ challenge, onClick }) => {
  const difficultyColor = useMemo(() => {
    switch (challenge.difficulty.toLowerCase()) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-red-500';
      default: return 'text-gray-500';
    }
  }, [challenge.difficulty]);

  return (
    <div
      className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-semibold text-white truncate">
          {challenge.title}
        </h3>
        <span className="text-blue-400 font-bold">
          {challenge.points} pts
        </span>
      </div>
      
      <p className="text-gray-300 text-sm mb-4 line-clamp-2">
        {challenge.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span className={`text-sm font-medium ${difficultyColor}`}>
          {challenge.difficulty}
        </span>
        {challenge.isSolved && (
          <span className="text-green-400 text-sm font-medium">
            ✓ Solved
          </span>
        )}
      </div>
    </div>
  );
});

ChallengeCard.displayName = 'ChallengeCard';

export default ChallengesList;

