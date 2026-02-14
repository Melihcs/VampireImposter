import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PlayerChip } from "../components/PlayerChip";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Skull, Moon } from "lucide-react";
import { motion } from "motion/react";

const players = [
  { name: "Deniz", isGM: false, isDead: false },
  { name: "Ollie", isGM: false, isDead: false },
  { name: "Ege", isGM: false, isDead: false },
  { name: "Bilge", isGM: false, isDead: false },
];

export default function NightVampireKill() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const isVampire = true; // Mock

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="night" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-card border-2 border-accent/30 rounded-2xl"
        >
          <div className="flex items-center gap-3 mb-2">
            <Moon className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-accent">VAMPIRE PHASE</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This screen is private. Choose a player to eliminate.
          </p>
        </motion.div>

        {isVampire ? (
          <>
            <h1 className="text-2xl font-bold mb-2">Choose Your Target</h1>
            <p className="text-sm text-muted-foreground mb-6">
              Select a player to kill tonight
            </p>

            <div className="flex-1 space-y-3 mb-6">
              {players.map((player, index) => (
                <PlayerChip
                  key={index}
                  name={player.name}
                  variant="voting"
                  isSelected={selectedTarget === player.name}
                  onClick={() => setSelectedTarget(player.name)}
                />
              ))}
            </div>

            <Button
              variant="destructive"
              size="lg"
              fullWidth
              disabled={!selectedTarget}
              onClick={() => navigate("/night-hunter-inspect")}
            >
              <div className="flex items-center justify-center gap-2">
                <Skull className="w-5 h-5" />
                Confirm Kill
              </div>
            </Button>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
              <Moon className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-3">Vampire is Choosing</h2>
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              Wait for the vampire to select their target
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
