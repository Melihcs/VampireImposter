import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { Plus, LogIn, Moon } from "lucide-react";

export default function CreateOrJoin() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-[390px] mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shadow-[0_0_30px_rgba(91,222,234,0.2)]">
            <Moon className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Imposter Room</h1>
          <p className="text-muted-foreground">
            Create a new game or join existing
          </p>
        </div>

        <div className="space-y-4">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={() => navigate("/create-room")}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Create New Room
            </div>
          </Button>

          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={() => navigate("/join-room")}
          >
            <div className="flex items-center justify-center gap-2">
              <LogIn className="w-5 h-5" />
              Join Existing Room
            </div>
          </Button>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground">
        <p>A realtime social deduction game</p>
      </div>
    </div>
  );
}
