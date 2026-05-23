"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Player } from "@/lib/players";
import { useState, useMemo } from "react";

interface LeaderboardSheetProps {
  players: Player[];
  isLoading: boolean;
  username: string;
  refetch: () => Promise<void>;
}

export default function LeaderboardSheet({ players, isLoading, username, refetch }: LeaderboardSheetProps) {
  const [searchFilter, setSearchFilter] = useState("");

  const processedLeaderboard = useMemo(() => {
    return players.filter((player) =>
      player.username.toLowerCase().includes(searchFilter.toLowerCase())
    );
  }, [players, searchFilter]);

  return (
    <Sheet onOpenChange={(open: boolean) => open && refetch()}>
      <SheetTrigger asChild>
        <button
          className="absolute bottom-6 flex items-center gap-2 px-5 py-2.5 rounded-full border border-red-800/40 bg-red-950/30 text-red-400 text-xs tracking-widest uppercase backdrop-blur-sm transition-all duration-200 active:scale-95 hover:bg-red-900/40 hover:border-red-600/60 hover:text-red-300"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Leaderboard
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[75vh] rounded-t-2xl sm:max-w-md mx-auto border-neutral-800 bg-neutral-950 text-white">
        <SheetHeader className="pb-2">
          <SheetTitle className="text-xl font-black tracking-tight text-white">GLOBAL RANKINGS</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col gap-4 h-full pb-12">
          <Input 
            type="text" 
            placeholder="Filter by username..." 
            value={searchFilter}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchFilter(e.target.value)}
            className="w-full bg-neutral-900 border-neutral-800 text-white focus-visible:ring-red-600"
          />
          
          <div className="flex-1 overflow-y-auto rounded-xl border border-neutral-800 bg-neutral-900/20 divide-y divide-neutral-800">
            {isLoading && processedLeaderboard.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-neutral-400 font-medium animate-pulse">
                Synchronizing boards...
              </div>
            ) : processedLeaderboard.length === 0 ? (
              <div className="flex items-center justify-center p-8 text-sm text-neutral-500">
                No matching player found
              </div>
            ) : (
              processedLeaderboard.map((player, index) => {
                const isCurrentUser = player.username === username;
                return (
                  <div 
                    key={player.id} 
                    className={`flex items-center justify-between p-4 transition-colors ${
                      isCurrentUser ? "bg-red-950/30 text-red-400 font-bold" : "hover:bg-neutral-900/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 font-mono text-xs text-neutral-500 text-center">
                        {index + 1}
                      </span>
                      <span className={isCurrentUser ? "text-red-400" : "text-neutral-200"}>
                        {player.username} {isCurrentUser && <span className="text-[9px] bg-red-500/20 px-1 rounded ml-1 text-red-300 font-mono">YOU</span>}
                      </span>
                    </div>
                    <span className="font-mono text-sm tabular-nums text-neutral-400">
                      {player.total_slaps.toLocaleString()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}