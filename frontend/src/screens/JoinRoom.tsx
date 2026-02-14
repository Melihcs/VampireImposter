import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import { LogIn, AlertCircle } from "lucide-react";

export default function JoinRoom() {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [error, setError] = useState("");

  const handleJoin = () => {
    if (roomCode.length !== 5) {
      setError("Room code must be 5 characters");
      return;
    }

    // Simulate error for demo
    if (roomCode.toUpperCase() !== "K7P4Q") {
      setError("Room not found. Please check the code.");
      return;
    }

    navigate("/lobby");
  };

  const handleChange = (value: string) => {
    setError("");
    setRoomCode(value.toUpperCase().slice(0, 5));
  };

  return (
    <div className="min-h-screen flex flex-col p-6 max-w-[390px] mx-auto">
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center">
            <LogIn className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Join Room</h1>
          <p className="text-muted-foreground">
            Enter the 5-character room code
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label
              htmlFor="roomCode"
              className="block text-sm font-medium mb-2 text-muted-foreground"
            >
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              placeholder="K7P4Q"
              className={`w-full px-4 py-3 bg-card border-2 rounded-2xl focus:outline-none transition-colors text-center text-2xl font-bold tracking-[0.3em] uppercase ${
                error ? "border-error" : "border-border focus:border-accent"
              }`}
              autoFocus
              maxLength={5}
            />

            {error && (
              <div className="mt-3 flex items-center gap-2 text-error text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            disabled={roomCode.length !== 5}
            onClick={handleJoin}
          >
            Join Room
          </Button>
        </div>
      </div>
    </div>
  );
}
