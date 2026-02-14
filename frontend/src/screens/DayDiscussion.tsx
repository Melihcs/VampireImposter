import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Timer } from "../components/Timer";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { MessageCircle, Vote } from "lucide-react";

export default function DayDiscussion() {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(120);
  const totalTime = 120;

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/voting");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader
        roomCode="K7P4Q"
        isConnected={true}
        onLeave={() => navigate("/create-or-join")}
      />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="day" />
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Day Discussion</h1>
          <p className="text-sm text-muted-foreground">
            Discuss with others and figure out who the vampire is
          </p>
        </div>

        <Timer seconds={timeLeft} totalSeconds={totalTime} />

        <div className="flex-1 flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 mb-6 rounded-full bg-warning/10 border-2 border-warning/30 flex items-center justify-center">
            <MessageCircle className="w-10 h-10 text-warning" />
          </div>

          <div className="text-center max-w-[280px]">
            <h2 className="text-xl font-bold mb-3">Discuss Freely</h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Share your suspicions and observations. Work together to identify
              the vampire before they strike again.
            </p>

            <div className="p-4 bg-card border border-border rounded-2xl text-left space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                <p className="text-sm text-muted-foreground">
                  Listen to everyone's perspective
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                <p className="text-sm text-muted-foreground">
                  Look for suspicious behavior
                </p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5" />
                <p className="text-sm text-muted-foreground">
                  The Hunter can share their findings
                </p>
              </div>
            </div>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={() => navigate("/voting")}
        >
          <div className="flex items-center justify-center gap-2">
            <Vote className="w-5 h-5" />
            Skip to Voting
          </div>
        </Button>
      </div>
    </div>
  );
}
