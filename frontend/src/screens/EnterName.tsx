import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { User } from "lucide-react";

export default function EnterName() {
  const navigate = useNavigate();
  const [name, setName] = useState("");

  const handleContinue = () => {
    if (name.trim()) {
      // Store name in session/state
      sessionStorage.setItem("playerName", name);
      navigate("/create-or-join");
    }
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-[390px] mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
            <User className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome</h1>
          <p className="text-muted-foreground">Enter your name to begin</p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium mb-2 text-muted-foreground"
            >
              Your Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleContinue()}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-card border-2 border-border rounded-2xl focus:border-accent focus:outline-none transition-colors text-base"
              autoFocus
              maxLength={20}
            />
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={!name.trim()}
            onClick={handleContinue}
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
