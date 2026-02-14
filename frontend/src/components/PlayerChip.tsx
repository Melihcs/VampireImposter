import { Crown, Skull } from 'lucide-react';

interface PlayerChipProps {
  name: string;
  isGM?: boolean;
  isDead?: boolean;
  isReady?: boolean;
  variant?: 'default' | 'compact' | 'voting';
  isSelected?: boolean;
  onClick?: () => void;
}

export function PlayerChip({ 
  name, 
  isGM, 
  isDead, 
  isReady, 
  variant = 'default',
  isSelected,
  onClick 
}: PlayerChipProps) {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const baseClass = variant === 'voting' 
    ? "flex items-center gap-3 p-4 bg-card border-2 rounded-2xl transition-all cursor-pointer"
    : "flex items-center gap-2.5 px-3 py-2.5 bg-card border border-border rounded-xl";

  const borderClass = isSelected 
    ? "border-accent shadow-[0_0_20px_rgba(91,222,234,0.3)]" 
    : variant === 'voting'
    ? "border-border hover:border-accent/50"
    : "border-border";

  return (
    <div 
      className={`${baseClass} ${borderClass} ${onClick ? 'cursor-pointer hover:bg-card-hover' : ''}`}
      onClick={onClick}
    >
      <div className={`${variant === 'voting' ? 'w-12 h-12' : 'w-8 h-8'} rounded-full bg-muted flex items-center justify-center text-sm font-bold ${isDead ? 'opacity-40' : ''}`}>
        {isDead ? <Skull className="w-4 h-4 text-muted-foreground" /> : initials}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`font-medium truncate ${isDead ? 'line-through opacity-60' : ''}`}>
            {name}
          </span>
          {isGM && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-accent/10 border border-accent/30 rounded text-xs font-medium text-accent">
              <Crown className="w-3 h-3" />
              GM
            </div>
          )}
        </div>
        
        <div className="flex gap-2 mt-1">
          {isDead ? (
            <span className="text-xs text-muted-foreground">Dead</span>
          ) : (
            <span className="text-xs text-accent">Alive</span>
          )}
          
          {isReady && (
            <span className="text-xs text-accent">• Ready</span>
          )}
        </div>
      </div>
    </div>
  );
}
