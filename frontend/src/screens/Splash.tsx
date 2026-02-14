import { motion } from "motion/react";
import { Moon, Users } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/enter-name");
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 max-w-[390px] mx-auto">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="text-center"
      >
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-accent/10 border-2 border-accent/30 flex items-center justify-center shadow-[0_0_40px_rgba(91,222,234,0.3)]">
            <Moon className="w-12 h-12 text-accent" />
          </div>
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full bg-accent/20 blur-xl"
          />
        </motion.div>

        <h1 className="text-4xl font-bold mb-3 tracking-tight">
          Imposter Room
        </h1>

        <div className="flex items-center justify-center gap-2 text-muted-foreground mb-12">
          <Users className="w-4 h-4" />
          <p
            className="text-sm uppercase tracking-wider"
            style={{ fontVariant: "small-caps" }}
          >
            Social Deduction Game
          </p>
        </div>

        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-muted-foreground"
        >
          Loading...
        </motion.div>
      </motion.div>
    </div>
  );
}
