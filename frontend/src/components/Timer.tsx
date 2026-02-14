import { Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface TimerProps {
  seconds: number;
  totalSeconds: number;
  label?: string;
}

export function Timer({ seconds, totalSeconds, label = "Time remaining" }: TimerProps) {
  const progress = (seconds / totalSeconds) * 100;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const isLow = seconds <= 10;

  return (
    <div className="bg-card border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-accent" />
          <span className="text-sm text-muted-foreground">{label}</span>
        </div>
        <span className={`text-2xl font-bold tabular-nums ${isLow ? 'text-error' : 'text-accent'}`}>
          {minutes}:{secs.toString().padStart(2, '0')}
        </span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${isLow ? 'bg-error' : 'bg-accent'}`}
          initial={{ width: '100%' }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    </div>
  );
}
