'use client';

import { useEffect, useState } from 'react';
import SpaceScene from '@/components/SpaceScene';
import Leaderboard from '@/components/dashboard/Leaderboard';
import Announcements from '@/components/dashboard/Announcements';
import Activity from '@/components/dashboard/Activity';
import GameClock from '@/components/dashboard/GameClock';
import { 
  LeaderboardResponse, 
  Announcement, 
  ActivityLog, 
  fetchLeaderboard,
  fetchAnnouncements,
  fetchActivity,
  fetchGameConfig
} from '@/utils/api';

// Add GameConfig type that matches the GameClock component
interface GameConfig {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  hasEndTime: boolean;
}

export default function Dashboard() {
  // State for each section
  const [leaderboard, setLeaderboard] = useState<LeaderboardResponse>({ teams: [], currentUserTeam: null });
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [gameConfig, setGameConfig] = useState<GameConfig | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  // State for accordion sections
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(true);
  const [isAnnouncementsOpen, setIsAnnouncementsOpen] = useState(true);
  const [isActivityOpen, setIsActivityOpen] = useState(true);
  const [isGameClockOpen, setIsGameClockOpen] = useState(true);

  // State for mobile modal
  const [isMobileModalOpen, setIsMobileModalOpen] = useState(false);
  const [activeMobileSection, setActiveMobileSection] = useState<'leaderboard' | 'announcements' | 'activity' | 'gameclock'>('leaderboard');

  // Add window resize listener for mobile view
  useEffect(() => {
    const checkMobileView = () => {
      const isMobile = window.innerWidth < 1100;

      // If switching to mobile view, collapse all panels
      if (isMobile) {
        setIsLeaderboardOpen(false);
        setIsAnnouncementsOpen(false);
        setIsActivityOpen(false);
        setIsGameClockOpen(false);
      }
    };

    // Check initial state
    checkMobileView();

    // Add resize listener
    window.addEventListener('resize', checkMobileView);
    return () => window.removeEventListener('resize', checkMobileView);
  }, []);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [leaderboardData, announcementsData, activitiesData, gameConfigData] = await Promise.all([
          fetchLeaderboard(),
          fetchAnnouncements(),
          fetchActivity(),
          fetchGameConfig()
        ]);

        setLeaderboard(leaderboardData);
        setAnnouncements(announcementsData);
        setActivities(activitiesData);

        // Convert API GameConfig to component GameConfig
        if (gameConfigData) {
          const convertedConfig: GameConfig = {
            id: gameConfigData.id || '',
            startTime: gameConfigData.startTime?.toString() || '',
            endTime: gameConfigData.endTime?.toString() || '',
            isActive: gameConfigData.isActive,
            createdAt: gameConfigData.createdAt || '',
            updatedAt: gameConfigData.updatedAt || '',
            hasEndTime: gameConfigData.endTime !== null
          };
          setGameConfig(convertedConfig);

          // Update time left in the same interval if game is active
          if (gameConfigData.isActive && gameConfigData.endTime) {
            const endTime = new Date(gameConfigData.endTime).getTime();
            const now = new Date().getTime();
            const timeLeftMs = endTime - now;

            if (timeLeftMs <= 0) {
              setTimeLeft('Game Over');
            } else {
              const hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
              const minutes = Math.floor((timeLeftMs % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);
              setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set default values to prevent UI crashes
        setLeaderboard({ teams: [], currentUserTeam: null });
        setAnnouncements([]);
        setActivities([]);
      }
    };

    loadDashboardData(); // Initial call
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen">
      {/* Desktop Layout - Grid */}
      <div className="relative hidden xl:grid grid-cols-4 gap-0 h-full pointer-events-none p-6">
        <SpaceScene isMobile={false} />
        {/* Top Left - Leaderboard */}
        <div className="col-span-1 pointer-events-auto w-11/12 z-10">
          <Leaderboard
            teams={leaderboard.teams}
            currentUserTeam={leaderboard.currentUserTeam ? leaderboard.currentUserTeam : null}
            isOpen={isLeaderboardOpen}
            setIsOpen={setIsLeaderboardOpen}
            isMobile={false}
          />
        </div>

        {/* Top Right - Announcements */}
        <div className="col-span-1 col-start-4 pointer-events-auto w-3/4 ml-auto z-10">
          <Announcements
            announcements={announcements}
            isOpen={isAnnouncementsOpen}
            setIsOpen={setIsAnnouncementsOpen}
            isMobile={false}
          />
        </div>

        {/* Bottom Left - Activity */}
        <div className="col-span-1 relative pointer-events-auto z-10">
          <div className="absolute bottom-0 left-0 right-0">
            <Activity
              activities={activities}
              isOpen={isActivityOpen}
              setIsOpen={setIsActivityOpen}
              isMobile={false}
            />
          </div>
        </div>

        {/* Bottom Right - Game Clock */}
        <div className="col-span-1 col-start-4 relative pointer-events-auto z-10">
          <div className="absolute bottom-0 left-0 right-0">
            <GameClock
              timeLeft={timeLeft}
              gameConfig={gameConfig}
              isOpen={isGameClockOpen}
              setIsOpen={setIsGameClockOpen}
              isMobile={false}
            />
          </div>
        </div>
      </div>

      {/* Mobile Layout - Full Screen Space Scene with Modal */}
      <div className="xl:hidden flex flex-col h-screen">
        <div className="flex-1 relative">
          <SpaceScene isMobile={true} />
        </div>
        
        {/* Mobile Navigation Button */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => setIsMobileModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            View Dashboard
          </button>
        </div>

        {/* Mobile Modal */}
        {isMobileModalOpen && (
          <div className="fixed inset-0 bg-black flex flex-col z-50">
            {/* Close Button - Overlayed in top right */}
            <div className="absolute top-4 right-4 z-50">
              <button
                onClick={() => setIsMobileModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Stack - Vertical and condensed */}
            <div className="flex flex-col border-b border-gray-700 pt-14">
              <button
                onClick={() => setActiveMobileSection('leaderboard')}
                className={`p-2.5 text-left border-b border-gray-700 ${
                  activeMobileSection === 'leaderboard'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Leaderboard
              </button>
              <button
                onClick={() => setActiveMobileSection('announcements')}
                className={`p-2.5 text-left border-b border-gray-700 ${
                  activeMobileSection === 'announcements'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Announcements
              </button>
              <button
                onClick={() => setActiveMobileSection('activity')}
                className={`p-2.5 text-left border-b border-gray-700 ${
                  activeMobileSection === 'activity'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Activity
              </button>
              <button
                onClick={() => setActiveMobileSection('gameclock')}
                className={`p-2.5 text-left ${
                  activeMobileSection === 'gameclock'
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                Game Clock
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
              {activeMobileSection === 'leaderboard' && (
                <Leaderboard
                  teams={leaderboard.teams}
                  currentUserTeam={leaderboard.currentUserTeam ? leaderboard.currentUserTeam : null}
                  isOpen={isLeaderboardOpen}
                  setIsOpen={setIsLeaderboardOpen}
                  isMobile={true}
                />
              )}
              {activeMobileSection === 'announcements' && (
                <Announcements
                  announcements={announcements}
                  isOpen={true}
                  setIsOpen={() => {}}
                  isMobile={true}
                />
              )}
              {activeMobileSection === 'activity' && (
                <Activity
                  activities={activities}
                  isOpen={true}
                  setIsOpen={() => {}}
                  isMobile={true}
                />
              )}
              {activeMobileSection === 'gameclock' && (
                <GameClock
                  timeLeft={timeLeft}
                  gameConfig={gameConfig}
                  isOpen={true}
                  setIsOpen={() => {}}
                  isMobile={true}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}