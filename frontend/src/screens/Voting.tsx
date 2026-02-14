import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Timer } from "../components/Timer";
import { PlayerChip } from "../components/PlayerChip";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";

const players = [
  { name: "Deniz", isGM: false, isDead: false },
  { name: "Eddie", isGM: false, isDead: false },
  { name: "Ollie", isGM: false, isDead: false },
  { name: "Ege", isGM: false, isDead: false },
  { name: "Bilge", isGM: false, isDead: false },
];

export default function Voting() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const totalTime = 60;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleVote = () => {
    setHasVoted(true);
    // Would submit vote to backend
    setTimeout(() => {
      navigate("/execution-reveal");
    }, 1500);
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
          <PhaseIndicator phase="vote" />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Cast Your Vote</h1>
          <p className="text-sm text-muted-foreground">
            {hasVoted
              ? "Vote submitted. Waiting for others..."
              : "Select a player to execute"}
          </p>
        </div>

        <Timer
          seconds={timeLeft}
          totalSeconds={totalTime}
          label="Voting time"
        />

        <div className="flex-1 py-6 space-y-3">
          {players.map((player, index) => (
            <PlayerChip
              key={index}
              name={player.name}
              variant="voting"
              isSelected={selectedPlayer === player.name}
              onClick={() => !hasVoted && setSelectedPlayer(player.name)}
            />
          ))}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          disabled={!selectedPlayer || hasVoted}
          onClick={handleVote}
        >
          {hasVoted ? "Vote Submitted" : "Submit Vote"}
        </Button>
      </div>
    </div>
  );
}
