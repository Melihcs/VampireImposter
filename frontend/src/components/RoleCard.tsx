import { motion } from 'motion/react';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

type Role = 'villager' | 'vampire' | 'hunter';

interface RoleCardProps {
  role: Role;
  isRevealed: boolean;
  onReveal?: () => void;
  privacyMode?: boolean;
}

const roleData = {
  villager: {
    name: 'VILLAGER',
    instruction: 'Survive and find the vampire'
  },
  vampire: {
    name: 'VAMPIRE',
    instruction: 'Kill villagers without being caught'
  },
  hunter: {
    name: 'HUNTER',
    instruction: 'Inspect one player each night'
  }
};

export function RoleCard({ role, isRevealed, onReveal, privacyMode = true }: RoleCardProps) {
  const [isUnblurred, setIsUnblurred] = useState(false);
  const data = roleData[role];

  return (
    <motion.div
      className="relative w-full max-w-[280px] aspect-[3/4] cursor-pointer"
      onClick={!isRevealed ? onReveal : undefined}
      style={{ perspective: 1000 }}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isRevealed ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* FRONT SIDE - Identical for all */}
        <div
          className="absolute inset-0 rounded-[18px] bg-card border-2 border-accent/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_32px_rgba(91,222,234,0.15)] flex items-center justify-center"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
              <Eye className="w-8 h-8 text-accent" />
            </div>
            <p className="text-sm text-muted-foreground uppercase tracking-wider" style={{ fontVariant: 'small-caps' }}>
              Tap to Reveal
            </p>
          </div>
        </div>

        {/* BACK SIDE - IDENTICAL for all roles (anti-peeking) */}
        <div
          className="absolute inset-0 rounded-[18px] bg-card border-2 border-accent/30 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3),0_8px_32px_rgba(91,222,234,0.15)] flex flex-col items-center justify-center p-8"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Icon area - same for all */}
          <div className="w-16 h-16 mb-6 rounded-full bg-accent/10 border border-accent/30 flex items-center justify-center">
            <Eye className="w-8 h-8 text-accent" />
          </div>

          {/* Role name - with identical blur when privacy mode is on */}
          <div className="relative mb-4">
            <h2 
              className="text-2xl font-bold uppercase tracking-wider text-center text-accent"
              style={{ 
                filter: (privacyMode && !isUnblurred) ? 'blur(8px)' : 'none',
                transition: 'filter 0.2s'
              }}
            >
              {data.name}
            </h2>
          </div>

          {/* Instruction - with identical blur */}
          <p 
            className="text-sm text-center text-muted-foreground leading-relaxed"
            style={{ 
              filter: (privacyMode && !isUnblurred) ? 'blur(6px)' : 'none',
              transition: 'filter 0.2s'
            }}
          >
            {data.instruction}
          </p>

          {/* Privacy mode indicator - identical for all */}
          {privacyMode && (
            <motion.div
              className="absolute bottom-4 left-1/2 -translate-x-1/2"
              onMouseDown={() => setIsUnblurred(true)}
              onMouseUp={() => setIsUnblurred(false)}
              onMouseLeave={() => setIsUnblurred(false)}
              onTouchStart={() => setIsUnblurred(true)}
              onTouchEnd={() => setIsUnblurred(false)}
            >
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full text-xs text-muted-foreground">
                {isUnblurred ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>Hold to read</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
