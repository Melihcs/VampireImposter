import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { Trophy, RotateCcw, LogOut } from "lucide-react";
import { motion } from "motion/react";

const finalRoster = [
  { name: "Melih", role: "Villager", isDead: false },
  { name: "Deniz", role: "Hunter", isDead: false },
  { name: "Eddie", role: "Villager", isDead: true },
  { name: "Ollie", role: "Vampire", isDead: true },
  { name: "Ege", role: "Villager", isDead: false },
  { name: "Bilge", role: "Villager", isDead: false },
];

export default function GameOver() {
  const navigate = useNavigate();
  const winner = "Villagers";

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-8 text-center"
        >
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shadow-[0_0_40px_rgba(91,222,234,0.3)]">
            <Trophy className="w-12 h-12 text-accent" />
          </div>

          <h1 className="text-3xl font-bold mb-2">Game Over</h1>
          <p className="text-accent text-xl font-medium">{winner} Win!</p>
        </motion.div>

        <div className="mb-6">
          <h2
            className="text-lg font-bold mb-4 uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Final Roles
          </h2>

          <div className="space-y-2">
            {finalRoster.map((player, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold ${player.isDead ? "opacity-40" : ""}`}
                  >
                    {player.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p
                      className={`font-medium ${player.isDead ? "line-through opacity-60" : ""}`}
                    >
                      {player.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {player.role}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    player.isDead
                      ? "bg-muted/50 text-muted-foreground"
                      : "bg-accent/10 text-accent"
                  }`}
                >
                  {player.isDead ? "Dead" : "Alive"}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-muted/30 border border-accent/20 rounded-xl text-center mb-6">
          <p className="text-xs text-muted-foreground leading-relaxed">
            The vampire was eliminated! The village is safe once more.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate("/lobby")}
          >
            <div className="flex items-center justify-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Play Again
            </div>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate("/create-or-join")}
          >
            <div className="flex items-center justify-center gap-2">
              <LogOut className="w-5 h-5" />
              Leave Room
            </div>
          </Button>
        </div>
      </div>
    </div>
  );
}
