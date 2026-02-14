import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppHeader } from "../components/AppHeader";
import { Button } from "../components/Button";
import { PhaseIndicator } from "../components/PhaseIndicator";
import { RoleCard } from "../components/RoleCard";
import { Eye, EyeOff } from "lucide-react";

export default function RoleReveal() {
  const navigate = useNavigate();
  const [isRevealed, setIsRevealed] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(true);
  const [hasRevealed, setHasRevealed] = useState(false);

  // Mock role - would come from game state
  const role = "hunter" as const;

  const handleReveal = () => {
    setIsRevealed(true);
    setHasRevealed(true);
  };

  const handleConfirm = () => {
    navigate("/waiting-for-others");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <AppHeader roomCode="K7P4Q" isConnected={true} showLeave={false} />

      <div className="flex-1 flex flex-col p-6">
        <div className="flex items-center justify-between mb-6">
          <PhaseIndicator phase="reveal" />
        </div>

        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold mb-2">Your Role</h1>
            <p className="text-sm text-muted-foreground">
              {!isRevealed
                ? "Tap the card to reveal your role"
                : "Remember your role and mission"}
            </p>
          </div>

          <RoleCard
            role={role}
            isRevealed={isRevealed}
            onReveal={handleReveal}
            privacyMode={privacyMode}
          />

          <div className="mt-6 w-full max-w-[280px]">
            <label className="flex items-center gap-3 p-4 bg-card border border-border rounded-2xl cursor-pointer hover:bg-card-hover transition-colors">
              <input
                type="checkbox"
                checked={privacyMode}
                onChange={(e) => setPrivacyMode(e.target.checked)}
                className="w-5 h-5 rounded border-2 border-border bg-background checked:bg-accent checked:border-accent"
              />
              <div className="flex-1 flex items-center gap-2">
                {privacyMode ? (
                  <Eye className="w-4 h-4 text-accent" />
                ) : (
                  <EyeOff className="w-4 h-4 text-muted-foreground" />
                )}
                <div className="text-left">
                  <div className="text-sm font-medium">Anti-peek Blur</div>
                  <div className="text-xs text-muted-foreground">
                    Hold to read role
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-muted/30 border border-accent/20 rounded-xl text-center">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <span className="text-accent font-medium">Privacy tip:</span>{" "}
              Shield your screen from others.
              {privacyMode && " Hold the blurred text to read clearly."}
            </p>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!hasRevealed}
            onClick={handleConfirm}
          >
            I Saw My Role
          </Button>
        </div>
      </div>
    </div>
  );
}
