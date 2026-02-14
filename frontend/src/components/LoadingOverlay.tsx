import { motion } from 'motion/react';
import { Wifi } from 'lucide-react';

interface LoadingOverlayProps {
  message?: string;
}

export function LoadingOverlay({ message = 'Reconnecting to room...' }: LoadingOverlayProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center"
    >
      <div className="text-center">
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center"
        >
          <Wifi className="w-8 h-8 text-accent" />
        </motion.div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </motion.div>
  );
}
