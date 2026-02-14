import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { PlayerChip } from "../components/PlayerChip";
import { Button } from "../components/Button";
import { BottomSheet } from "../components/BottomSheet";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Users, Lock } from "lucide-react";

const players = [
  { name: "Melih", isGM: true, isDead: false },
  { name: "Deniz", isGM: false, isDead: false },
  { name: "Eddie", isGM: false, isDead: false },
  { name: "Ollie", isGM: false, isDead: false },
  { name: "Ege", isGM: false, isDead: false },
  { name: "Bilge", isGM: false, isDead: false },
];

export default function Lobby() {
  const navigate = useNavigate();
  const [showLockConfirm, setShowLockConfirm] = useState(false);
  const isGM = true; // Mock - would check actual player role

  const handleLockRoom = () => {
    setShowLockConfirm(false);
    navigate("/role-reveal");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader
        roomCode="K7P4Q"
        isConnected={true}
        onLeave={() => navigate("/create-or-join")}
      />

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="lobby" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-sm">
            <Users className="w-4 h-4 text-accent" />
            <span className="font-medium">{players.length}/12</span>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Waiting for Players</h1>
          <p className="text-sm text-muted-foreground">
            {isGM
              ? "Lock the room when everyone is ready to start"
              : "Waiting for game master to start the game"}
          </p>
        </div>

        <div className="flex-1 space-y-3 mb-6">
          {players.map((player, index) => (
            <PlayerChip
              key={index}
              name={player.name}
              isGM={player.isGM}
              isDead={player.isDead}
            />
          ))}
        </div>

        {isGM && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => setShowLockConfirm(true)}
          >
            <div className="flex items-center justify-center gap-2">
              <Lock className="w-5 h-5" />
              Lock Room & Start
            </div>
          </Button>
        )}

        {!isGM && (
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-sm text-muted-foreground">
              Waiting for{" "}
              <span className="text-accent font-medium">Melih (GM)</span> to
              start
            </p>
          </div>
        )}
      </div>

      <BottomSheet
        isOpen={showLockConfirm}
        onClose={() => setShowLockConfirm(false)}
        title="Lock Room & Start?"
      >
        <div className="space-y-6">
          <p className="text-muted-foreground">
            Once locked, no new players can join. All current players will be
            assigned roles and the game will begin.
          </p>

          <div className="flex gap-3">
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowLockConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="md"
              fullWidth
              onClick={handleLockRoom}
            >
              <div className="flex items-center justify-center gap-2">
                <Lock className="w-4 h-4" />
                Lock & Start
              </div>
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
