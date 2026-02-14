import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PlayerChip } from "../components/PlayerChip";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Eye, Moon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const players = [
  { name: "Deniz", isGM: false, isDead: false },
  { name: "Ollie", isGM: false, isDead: false },
  { name: "Ege", isGM: false, isDead: false },
  { name: "Bilge", isGM: false, isDead: false },
];

export default function NightHunterInspect() {
  const navigate = useNavigate();
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
  const [inspectResult, setInspectResult] = useState<string | null>(null);
  const isHunter = true; // Mock

  const handleInspect = () => {
    // Mock result - would come from backend
    setInspectResult("VILLAGER");
  };

  const handleContinue = () => {
    navigate("/game-over");
  };

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
            <Eye className="w-5 h-5 text-accent" />
            <h2 className="font-bold text-accent">HUNTER PHASE</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            This screen is private. Inspect one player to learn their role.
          </p>
        </motion.div>

        {isHunter ? (
          <>
            {!inspectResult ? (
              <>
                <h1 className="text-2xl font-bold mb-2">Inspect a Player</h1>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose one player to reveal their role
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
                  variant="primary"
                  size="lg"
                  fullWidth
                  disabled={!selectedTarget}
                  onClick={handleInspect}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Eye className="w-5 h-5" />
                    Inspect Player
                  </div>
                </Button>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center">
                <AnimatePresence>
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center mb-8"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
                      <Eye className="w-10 h-10 text-accent" />
                    </div>

                    <h2 className="text-xl font-bold mb-3">
                      {selectedTarget}'s Role
                    </h2>

                    <div className="p-6 bg-card border border-border rounded-2xl mb-8">
                      <p
                        className="text-xs text-muted-foreground mb-2 uppercase tracking-wider"
                        style={{ fontVariant: "small-caps" }}
                      >
                        They are a
                      </p>
                      <p className="text-2xl font-bold text-accent">
                        {inspectResult}
                      </p>
                    </div>

                    <div className="max-w-[280px] p-4 bg-muted/30 border border-accent/20 rounded-xl">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        Remember this information. Use it wisely during
                        tomorrow's discussion.
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="w-full mt-8">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    onClick={handleContinue}
                  >
                    Continue
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
              <Moon className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <h2 className="text-xl font-bold mb-3">Hunter is Inspecting</h2>
            <p className="text-sm text-muted-foreground text-center max-w-[260px]">
              Wait for the hunter to complete their investigation
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
