import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { ChatInput } from "@/components/chat/ChatInput";
import { TripComparisonCard, demoTripOptions } from "@/components/trips/TripComparisonCard";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PopularDestinations } from "@/components/home/PopularDestinations";
import { Plane, Sparkles, Stars } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const Index = () => {
  const [showResults, setShowResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSearch = (message: string) => {
    setSearchQuery(message);
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowResults(true);
    }, 2000);
  };

  const handleGetStarted = () => {
    navigate(user ? "/trip-planner" : "/auth");
  };

  const handleWatchDemo = () => {
    document.getElementById("popular-destinations")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Layout>
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-aurora noise">
        {/* Floating chrome */}
        <motion.div
          animate={{ y: [0, -16, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/4 left-[8%] hidden lg:block"
        >
          <div className="h-16 w-16 rounded-2xl bg-gradient-primary shadow-glow flex items-center justify-center rotate-6">
            <Plane className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 18, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/3 right-[12%] hidden lg:block"
        >
          <div className="h-14 w-14 rounded-2xl bg-gradient-mint shadow-mint flex items-center justify-center -rotate-6">
            <Stars className="h-7 w-7 text-white" />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 left-[18%] hidden lg:block"
        >
          <div className="h-12 w-12 rounded-2xl bg-gradient-violet shadow-magenta flex items-center justify-center">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
        </motion.div>

        {/* Hero content */}
        <div className="container relative z-10 py-24">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-8">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-aurora font-semibold">AI-powered. Free to plan.</span>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-[0.95]">
                <span className="block">Plan your trip</span>
                <span className="block text-aurora animate-gradient">like it's a vibe</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                Tell us where you wanna go. We mix flights, hotels, trains, and cabs into one
                clean itinerary — at the best price you'll find anywhere.
              </p>
            </motion.div>

            <ChatInput onSubmit={handleSearch} isLoading={isLoading} />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
            >
              <span>try:</span>
              {[
                "5 days in Goa under ₹15k",
                "weekend in Manali for 2",
                "beach trip in March",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => handleSearch(q)}
                  className="px-3 py-1 rounded-full glass hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {q}
                </button>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* Results */}
      {showResults && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-20 bg-gradient-surface"
        >
          <div className="container">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-5xl font-black mb-3">
                4 ways to make it happen
              </h2>
              <p className="text-muted-foreground">
                Based on: <span className="text-foreground font-medium">"{searchQuery}"</span>
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
              {demoTripOptions.map((option, index) => (
                <TripComparisonCard
                  key={option.id}
                  option={option}
                  index={index}
                  isSelected={selectedTrip === option.id}
                  onSelect={() => setSelectedTrip(option.id)}
                />
              ))}
            </div>
          </div>
        </motion.section>
      )}

      <FeaturesSection />
      <PopularDestinations />

      {/* CTA */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl bg-gradient-sunset animate-gradient p-8 md:p-16 text-center noise"
          >
            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                Ready when you are
              </h2>
              <p className="text-white/85 mb-8 max-w-xl mx-auto text-lg">
                Thousands of travelers plan smarter trips with TripGenie. Your move.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="px-8 py-4 rounded-2xl bg-white text-primary font-bold text-base hover:scale-105 transition-transform shadow-elevated"
                >
                  {user ? "Plan a trip" : "Start free"}
                </button>
                <button
                  onClick={handleWatchDemo}
                  className="px-8 py-4 rounded-2xl glass text-white font-bold text-base hover:bg-white/15 transition-colors"
                >
                  See destinations
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
