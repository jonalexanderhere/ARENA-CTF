import {
  SiteConfig,
  RulesResponse,
  ChallengeFile,
  Hint,
  Challenge,
  CategoryResponse,
  LeaderboardResponse,
  Announcement,
  ActivityLog,
  GameConfig,
  ScoreboardTeam,
  PointHistoryResponse,
  SubmissionResponse,
  NewAnnouncement,
  CategoriesResponse,
  NewChallenge,
  SiteConfiguration,
  SignUpRequest,
  SignUpResponse,
  User,
  Team,
  AdminSubmission,
  AdminActivityLog,
  AdminMetrics,
} from '@/types';

export async function fetchSiteConfig(): Promise<SiteConfig[]> {
  const response = await fetch('/api/config');
  if (!response.ok) {
    throw new Error('Failed to fetch site configuration');
  }
  return response.json();
}

export async function fetchRules(): Promise<RulesResponse> {
  const response = await fetch('/api/rules');
  if (!response.ok) {
    throw new Error('Failed to fetch rules');
  }
  return response.json();
}

export async function fetchChallenge(challengeId: string): Promise<Challenge> {
  const response = await fetch(`/api/challenges/${challengeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch challenge');
  }
  return response.json();
}

export async function fetchChallengesByCategory(categoryId: string): Promise<CategoryResponse> {
  const response = await fetch(`/api/challenges/categories/${categoryId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch category challenges');
  }
  return response.json();
}

export async function fetchTeam(teamId: string): Promise<Team> {
  const response = await fetch(`/api/teams/${teamId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team data');
  }
  return response.json();
}

export async function fetchLeaderboard(): Promise<LeaderboardResponse> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/leaderboard', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      // Ensure we always return valid data structure
      return {
        teams: data.teams || [],
        currentUserTeam: data.currentUserTeam || null
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Leaderboard fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Leaderboard fetch failed after all retries:', lastError);
  // Return empty leaderboard on error
  return { teams: [], currentUserTeam: null };
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/announcements', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      lastError = error as Error;
      console.warn(`Announcements fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Announcements fetch failed after all retries:', lastError);
  return [];
}

export async function fetchActivity(): Promise<ActivityLog[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data || [];
    } catch (error) {
      lastError = error as Error;
      console.warn(`Activity fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Activity fetch failed after all retries:', lastError);
  return [];
}

export async function fetchGameConfig(): Promise<GameConfig> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/game-config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Game config fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Game config fetch failed after all retries:', lastError);
  // Return default game config on error
  return {
    id: 'default',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    isActive: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    hasEndTime: true
  };
}

export async function fetchScoreboardTeams(): Promise<ScoreboardTeam[]> {
  const response = await fetch('/api/leaderboard');
  if (!response.ok) {
    throw new Error('Failed to fetch scoreboard teams');
  }
  const data = await response.json();
  return data.teams;
}

export async function fetchTeamPointHistory(teamId: string, limit: number = 1000): Promise<PointHistoryResponse> {
  const response = await fetch(`/api/teams/${teamId}/points/history?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch team point history');
  }
  return response.json();
}

export async function fetchHints(challengeId: string): Promise<Hint[]> {
  const response = await fetch(`/api/hints?challengeId=${challengeId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch hints');
  }
  return response.json();
}

export async function purchaseHint(hintId: string): Promise<void> {
  const response = await fetch('/api/hints/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hintId }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to purchase hint');
  }
}

export async function submitFlag(challengeId: string, flag: string): Promise<SubmissionResponse> {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ challengeId, flag }),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to submit flag');
  }
  return response.json();
}

export async function createAnnouncement(announcement: NewAnnouncement): Promise<void> {
  const response = await fetch('/api/announcements', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(announcement),
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create announcement');
  }
}

export async function deleteAnnouncement(id: string): Promise<void> {
  const response = await fetch(`/api/announcements/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete announcement');
  }
}

export async function fetchCategories(): Promise<CategoriesResponse> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/challenges/categories', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        categories: data.categories || [],
        challengesByCategory: data.challengesByCategory || {}
      };
    } catch (error) {
      lastError = error as Error;
      console.warn(`Categories fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Categories fetch failed after all retries:', lastError);
  // Return empty categories on error
  return { categories: [], challengesByCategory: {} };
}

export async function createChallenge(challenge: NewChallenge): Promise<Challenge> {
  const response = await fetch('/api/admin/challenges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challenge),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to create challenge');
  }

  return response.json();
}

export async function updateChallenge(challenge: Challenge): Promise<Challenge> {
  const response = await fetch('/api/admin/challenges', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(challenge),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update challenge');
  }

  return response.json();
}

export async function uploadFile(file: File, challengeId: string): Promise<ChallengeFile> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('challengeId', challengeId);
  
  const response = await fetch('/api/files/upload', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to upload file');
  }
  
  return response.json();
}

export async function deleteFile(filePath: string): Promise<void> {
  const response = await fetch(`/api/files/${encodeURIComponent(filePath)}`, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete file');
  }
}

export async function fetchAdminChallenges(): Promise<Challenge[]> {
  const response = await fetch('/api/admin/challenges');
  if (!response.ok) {
    throw new Error('Failed to fetch challenges');
  }
  return response.json();
}

export async function deleteChallenge(id: string): Promise<void> {
  const response = await fetch('/api/admin/challenges', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete challenge');
  }
}

export async function exportChallenges(): Promise<Challenge[]> {
  const response = await fetch('/api/admin/challenges/bulk');
  if (!response.ok) {
    throw new Error('Failed to export challenges');
  }
  return response.json();
}

export async function importChallenges(challenges: Challenge[]): Promise<void> {
  const response = await fetch('/api/admin/challenges/bulk', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(challenges),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to import challenges');
  }
}

export async function updateSiteConfig(config: SiteConfig): Promise<void> {
  const response = await fetch('/api/config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update site configuration');
  }
}

export async function updateGameConfig(config: GameConfig): Promise<GameConfig> {
  const response = await fetch('/api/game-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update game configuration');
  }

  return response.json();
}

export async function fetchSiteConfigurations(): Promise<SiteConfiguration[]> {
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('/api/config', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      lastError = error as Error;
      console.warn(`Site config fetch attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  console.error('Site config fetch failed after all retries:', lastError);
  // Return default configurations on error
  return [
    { id: '1', key: 'site_title', value: 'PHOENIX ARENA CTF', updatedAt: new Date().toISOString() },
    { id: '2', key: 'homepage_title', value: 'Welcome to PHOENIX ARENA CTF', updatedAt: new Date().toISOString() },
    { id: '3', key: 'homepage_subtitle', value: 'Rise from the ashes! Epic cyber battles in the PHOENIX ARENA.', updatedAt: new Date().toISOString() }
  ];
}

export async function updateSiteConfiguration(key: string, value: string): Promise<SiteConfiguration> {
  const response = await fetch('/api/config', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key, value }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || `Failed to update configuration: ${key}`);
  }
  return response.json();
}

export async function fetchAdminTeams(): Promise<Team[]> {
  const response = await fetch('/api/admin/teams');
  if (!response.ok) {
    throw new Error('Failed to fetch teams');
  }
  return response.json();
}

export async function deleteTeam(id: string): Promise<void> {
  const response = await fetch('/api/admin/teams', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const data = await response.json(); 
    throw new Error(data.error || 'Failed to delete team');
  }
}

export async function updateTeam(teamData: Partial<Team>): Promise<Team> {
  const response = await fetch('/api/admin/teams', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(teamData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update team');
  }

  return response.json();
}

export async function fetchAdminUsers(): Promise<User[]> {
  const response = await fetch('/api/admin/users');
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function deleteAdminUser(id: string): Promise<void> {
  const response = await fetch('/api/admin/users', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to delete user');
  }
}

export async function updateAdminUser(userData: Partial<User>): Promise<User> {
  const response = await fetch('/api/admin/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to update user');
  }

  return response.json();
}

export async function fetchAdminSubmissions(): Promise<AdminSubmission[]> {
  const response = await fetch('/api/admin/submissions');
  if (!response.ok) {
    throw new Error('Failed to fetch submissions');
  }
  return response.json();
}

export async function fetchAdminActivityLogs(): Promise<AdminActivityLog[]> {
  const response = await fetch('/api/admin/activity');
  if (!response.ok) {
    throw new Error('Failed to fetch activity logs');
  }
  return response.json();
}

export async function updateAdminActivityLog(
  data: Partial<AdminActivityLog> & { id: string }
): Promise<AdminActivityLog> {
  const response = await fetch('/api/admin/activity', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.error || 'Failed to update activity log');
  }

  return response.json();
}

export async function deleteAdminActivityLog(id: string): Promise<void> {
  const response = await fetch('/api/admin/activity', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });

  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.error || 'Failed to delete activity log');
  }
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  const response = await fetch('/api/admin/metrics');
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  return response.json();
}

export async function signUp(data: SignUpRequest): Promise<SignUpResponse> {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Failed to register');
  }

  return response.json();
}

export type {
  LeaderboardResponse,
  Announcement,
  ActivityLog,
  GameConfig,
  ScoreboardTeam,
  PointHistoryResponse,
  SubmissionResponse,
  NewAnnouncement,
  CategoriesResponse,
  NewChallenge,
  SiteConfiguration,
  SignUpRequest,
  SignUpResponse,
  User,
  Team,
  AdminSubmission,
  AdminActivityLog,
  AdminMetrics,
};
