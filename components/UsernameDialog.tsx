"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface UsernameDialogProps {
  isOpen: boolean;
  createAccount: (newUsername: string) => Promise<boolean>;
}

export default function UsernameDialog({ isOpen, createAccount }: UsernameDialogProps) {
  const [usernameInput, setUsernameInput] = useState("");
  const [pendingSync, setPendingSync] = useState(false);

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!usernameInput.trim() || pendingSync) return;

    setPendingSync(true);
    const success = await createAccount(usernameInput.trim());
    setPendingSync(false);
    if (!success) {
      alert("Could not claim username. It might be taken or you are offline.");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-sm [&>button]:hidden border-neutral-800 bg-neutral-950 text-white" onPointerDownOutside={(e: CustomEvent) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-white">Create Profile</DialogTitle>
          <DialogDescription className="text-neutral-400">
            Enter a unique username to broadcast your physical slaps onto the cloud leaderboard matrix.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleCreateProfile} className="space-y-4 pt-2">
          <Input
            type="text"
            placeholder="Username"
            required
            disabled={pendingSync}
            value={usernameInput}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsernameInput(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))}
            maxLength={16}
            className="bg-neutral-900 border-neutral-800 text-white focus-visible:ring-red-600 font-semibold"
          />
          <Button type="submit" className="w-full font-bold bg-red-600 hover:bg-red-700 text-white" disabled={pendingSync}>
            {pendingSync ? "Registering..." : "Claim Handle"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}