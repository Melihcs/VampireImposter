import { Copy, Wifi, WifiOff, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface AppHeaderProps {
  roomCode?: string;
  isConnected?: boolean;
  onLeave?: () => void;
  showLeave?: boolean;
}

export function AppHeader({ roomCode, isConnected = true, onLeave, showLeave = true }: AppHeaderProps) {
  const handleCopyCode = () => {
    if (roomCode) {
      navigator.clipboard.writeText(roomCode);
      toast.success('Room code copied!');
    }
  };

  return (
    <header className="flex items-center justify-between px-5 py-4 border-b border-border/50">
      <div className="flex items-center gap-3">
        {roomCode && (
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-sm font-medium hover:bg-card-hover transition-colors"
          >
            <span className="tracking-widest">{roomCode}</span>
            <Copy className="w-3.5 h-3.5 text-accent" />
          </button>
        )}
        
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-card/50 rounded-full">
          {isConnected ? (
            <Wifi className="w-3.5 h-3.5 text-accent" />
          ) : (
            <WifiOff className="w-3.5 h-3.5 text-error" />
          )}
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {showLeave && onLeave && (
        <button
          onClick={onLeave}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Leave room"
        >
          <LogOut className="w-5 h-5 text-muted-foreground" />
        </button>
      )}
    </header>
  );
}
