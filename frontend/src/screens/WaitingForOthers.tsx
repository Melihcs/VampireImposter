import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PlayerChip } from "../components/PlayerChip";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Hourglass } from "lucide-react";
import { useEffect } from "react";

const players = [
  { name: "Melih", isGM: true, isDead: false, isReady: true },
  { name: "Deniz", isGM: false, isDead: false, isReady: true },
  { name: "Eddie", isGM: false, isDead: false, isReady: true },
  { name: "Ollie", isGM: false, isDead: false, isReady: false },
  { name: "Ege", isGM: false, isDead: false, isReady: true },
  { name: "Bilge", isGM: false, isDead: false, isReady: false },
];

export default function WaitingForOthers() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto-advance when all ready (simulated)
    const timer = setTimeout(() => {
      navigate("/day-discussion");
    }, 3000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="reveal" />
        </div>

        <div className="flex-1 flex flex-col">
          <div className="mb-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
              <Hourglass className="w-8 h-8 text-accent animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Waiting for Others</h1>
            <p className="text-sm text-muted-foreground">
              Game will start when everyone has seen their role
            </p>
          </div>

          <div className="space-y-3">
            {players.map((player, index) => (
              <PlayerChip
                key={index}
                name={player.name}
                isGM={player.isGM}
                isDead={player.isDead}
                isReady={player.isReady}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
