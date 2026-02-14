import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Clock, Settings } from "lucide-react";

export default function CreateRoom() {
  const navigate = useNavigate();
  const [discussionTime, setDiscussionTime] = useState(120);
  const [votingTime, setVotingTime] = useState(60);
  const [allowRejoin, setAllowRejoin] = useState(false);

  const handleCreate = () => {
    // Store settings and navigate to lobby
    navigate("/lobby");
  };

  return (
    <div className="min-h-screen flex flex-col max-w-[390px] mx-auto">
      <header className="px-5 py-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Settings className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Create Room</h1>
            <p className="text-xs text-muted-foreground">
              Configure game settings
            </p>
          </div>
        </div>
      </header>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Clock className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <label className="block font-medium mb-1">Discussion Time</label>
              <p className="text-xs text-muted-foreground mb-3">
                How long players can discuss during day phase
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="300"
                  step="30"
                  value={discussionTime}
                  onChange={(e) => setDiscussionTime(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-accent font-bold tabular-nums min-w-[60px] text-right">
                  {Math.floor(discussionTime / 60)}:
                  {(discussionTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start gap-3 mb-4">
            <Clock className="w-5 h-5 text-accent mt-0.5" />
            <div className="flex-1">
              <label className="block font-medium mb-1">Voting Time</label>
              <p className="text-xs text-muted-foreground mb-3">
                Time limit for casting votes
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="30"
                  max="120"
                  step="15"
                  value={votingTime}
                  onChange={(e) => setVotingTime(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-accent font-bold tabular-nums min-w-[60px] text-right">
                  {Math.floor(votingTime / 60)}:
                  {(votingTime % 60).toString().padStart(2, "0")}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allowRejoin}
              onChange={(e) => setAllowRejoin(e.target.checked)}
              className="mt-1 w-5 h-5 rounded border-2 border-border bg-background checked:bg-accent checked:border-accent"
            />
            <div className="flex-1">
              <div className="font-medium">Allow Rejoin After Lock</div>
              <p className="text-xs text-muted-foreground mt-1">
                Players can reconnect after room is locked
              </p>
            </div>
          </label>
        </div>
      </div>

      <div className="p-6 border-t border-border/50">
        <Button variant="primary" size="lg" fullWidth onClick={handleCreate}>
          Create Room
        </Button>
      </div>
    </div>
  );
}
