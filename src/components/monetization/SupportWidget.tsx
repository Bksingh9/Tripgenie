import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SupportWidget() {
  const [dismissed, setDismissed] = useState(false);

  const bmcUrl = import.meta.env.VITE_BMC_URL || "https://www.buymeacoffee.com/tripgenie";

  if (dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40"
      >
        <div className="relative">
          <button
            onClick={() => setDismissed(true)}
            className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
          <a href={bmcUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="outline"
              className="gap-2 rounded-full shadow-elevated hover:shadow-glow border-primary/30 hover:border-primary/60 transition-all duration-300 px-5 py-5"
            >
              <Heart className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Support Us</span>
            </Button>
          </a>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
