import { useEffect, useState } from "react";

export interface SlapData {
  id: string;
  timestamp: number;
  intensity: "soft" | "medium" | "hard" | null;
}

export interface UserStats {
  totalSlaps: number;
  slaps: SlapData[];
  lastUpdated: number;
}
  
const STORAGE_KEY = "slapdroid_user_stats";

export const useLocalStorage = () => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const VERSION_KEY = "slapdroid_stats_version";
  const CURRENT_VERSION = "1";

useEffect(() => {
  const savedVersion = localStorage.getItem(VERSION_KEY);
  const stored = localStorage.getItem(STORAGE_KEY);

  if (savedVersion !== CURRENT_VERSION) {
    // Fresh install or update — reset everything
    initializeStats();
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  } else if (stored) {
    // Normal load
    setStats(JSON.parse(stored));
  } else {
    // No stored data
    initializeStats();
  }
  setIsLoaded(true);
}, []);
  

  // Initialize fresh stats
  const initializeStats = () => {
    const newStats: UserStats = {
      totalSlaps: 0,
      slaps: [],
      lastUpdated: Date.now(),
    };
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  };

  // Add a slap to storage
  const addSlap = (intensity: "soft" | "medium" | "hard" | null) => {
    setStats((prevStats) => {
      if (!prevStats) return prevStats;

      const newSlap: SlapData = {
        id: `${Date.now()}-${Math.random()}`,
        timestamp: Date.now(),
        intensity,
      };

      const updatedStats: UserStats = {
        totalSlaps: prevStats.totalSlaps + 1,
        slaps: [...prevStats.slaps, newSlap],
        lastUpdated: Date.now(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
      return updatedStats;
    });
  };

  // Get stats for MVP2 backend sync
  const getStats = () => stats;

  // Clear all data
  const clearStats = () => {
    initializeStats();
  };

  // Get slaps from last N hours (for future MVP2 leaderboard)
  const getSlapsInLastHours = (hours: number) => {
    if (!stats) return [];
    const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
    return stats.slaps.filter((slap) => slap.timestamp > cutoffTime);
  };

  return {
    stats,
    isLoaded,
    addSlap,
    getStats,
    clearStats,
    getSlapsInLastHours,
  };
};
