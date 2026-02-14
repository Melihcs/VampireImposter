import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Skull } from "lucide-react";
import { motion } from "motion/react";

export default function ExecutionReveal() {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);

  // Mock execution data
  const executedPlayer = "Eddie";
  const revealedRole = "VILLAGER";
  const isGM = true;

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="execute" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
              <Skull className="w-10 h-10 text-destructive" />
            </div>

            <h1 className="text-3xl font-bold mb-3">{executedPlayer}</h1>
            <p className="text-sm text-muted-foreground mb-6">
              has been executed
            </p>

            {isRevealed && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-6 bg-card border border-border rounded-2xl"
              >
                <p
                  className="text-xs text-muted-foreground mb-2 uppercase tracking-wider"
                  style={{ fontVariant: "small-caps" }}
                >
                  Their role was
                </p>
                <p className="text-2xl font-bold text-accent">{revealedRole}</p>
              </motion.div>
            )}
          </motion.div>

          <div className="w-full max-w-[280px] p-4 bg-muted/30 border border-accent/20 rounded-xl text-center mb-8">
            <p className="text-xs text-muted-foreground leading-relaxed">
              Role reveals use identical styling for all roles to prevent
              accidental spoilers
            </p>
          </div>
        </div>

        {isGM && (
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate("/night-random-question")}
          >
            Continue to Night Phase
          </Button>
        )}

        {!isGM && (
          <div className="p-4 bg-card border border-border rounded-2xl text-center">
            <p className="text-sm text-muted-foreground">
              Waiting for{" "}
              <span className="text-accent font-medium">Melih (GM)</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
