import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { Moon, HelpCircle } from "lucide-react";
import { motion } from "motion/react";

export default function NightRandomQuestion() {
  const navigate = useNavigate();
  const question = "Who do you think is acting most suspicious?";

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="night" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shadow-[0_0_30px_rgba(91,222,234,0.2)]">
              <Moon className="w-10 h-10 text-accent" />
            </div>

            <h1 className="text-2xl font-bold mb-3">Night Phase</h1>
            <p className="text-sm text-muted-foreground mb-8">
              Random discussion question for all players
            </p>

            <div className="p-6 bg-card border border-border rounded-2xl max-w-[300px] mx-auto">
              <HelpCircle className="w-8 h-8 text-accent mx-auto mb-4" />
              <p className="text-lg leading-relaxed">{question}</p>
            </div>
          </motion.div>

          <div className="w-full max-w-[280px] p-4 bg-muted/30 border border-accent/20 rounded-xl text-center mb-8">
            <p className="text-xs text-muted-foreground leading-relaxed">
              This question is visible to everyone. Discuss while special roles
              take their actions.
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate("/night-vampire-kill")}
        >
          Continue (Vampire Turn)
        </Button>
      </div>
    </div>
  );
}
