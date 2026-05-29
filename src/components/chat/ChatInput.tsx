import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSubmit: (message: string) => void;
  isLoading?: boolean;
  placeholder?: string;
}

const exampleQueries = [
  "Weekend trip from Mumbai to Goa under ₹15k",
  "Business trip Delhi to Bangalore tomorrow",
  "Honeymoon in Kerala for 5 days",
  "Budget backpacking trip to Manali",
];

export function ChatInput({ onSubmit, isLoading, placeholder }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !isLoading) {
      onSubmit(message.trim());
    }
  };

  const handleExampleClick = (query: string) => {
    setMessage(query);
    onSubmit(query);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {exampleQueries.map((query, index) => (
          <motion.button
            key={query}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => handleExampleClick(query)}
            type="button"
            className="px-4 py-2 text-xs sm:text-sm rounded-full border border-border bg-card hover:bg-secondary hover:border-primary/30 text-muted-foreground hover:text-foreground transition-all duration-300"
          >
            {query}
          </motion.button>
        ))}
      </div>

      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit}
        className="relative"
      >
        <div className="relative flex items-center gap-2 p-2 rounded-2xl border-2 border-border bg-card shadow-elevated focus-within:border-primary/50 focus-within:shadow-glow transition-all duration-300">
          <div className="flex items-center pl-3">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
          </div>
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={placeholder || "Where do you want to go? Try: 'Weekend trip to Goa under ₹15k'"}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-base"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="hero"
            size="icon"
            className="h-11 w-11 shrink-0"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </Button>
        </div>
      </motion.form>

      <p className="text-center text-xs text-muted-foreground mt-3">
        Powered by AI • Finds the best deals across flights, hotels, trains & more
      </p>
    </div>
  );
}
