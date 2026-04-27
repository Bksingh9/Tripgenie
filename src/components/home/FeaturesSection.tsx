import { motion } from "framer-motion";
import { Sparkles, Globe, Zap, Shield, TrendingDown, Clock } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered planning",
    description:
      "Tell us where, we figure out the perfect mix of flights, hotels and transport.",
    bg: "bg-gradient-primary",
    glow: "shadow-glow",
  },
  {
    icon: Globe,
    title: "Multimodal journeys",
    description: "Flights, trains, buses, cabs, ferries — all stitched into one trip.",
    bg: "bg-gradient-mint",
    glow: "shadow-mint",
  },
  {
    icon: TrendingDown,
    title: "Best price guarantee",
    description: "We compare 100+ providers so you get the cheapest deal every time.",
    bg: "bg-gradient-violet",
    glow: "shadow-magenta",
  },
  {
    icon: Clock,
    title: "Real-time price alerts",
    description: "Track prices, get pinged the moment they drop. Don't miss the dip.",
    bg: "bg-gradient-sunset",
    glow: "shadow-glow",
  },
  {
    icon: Zap,
    title: "Instant booking",
    description: "One checkout for everything. Out of cart, into vacation mode.",
    bg: "bg-gradient-primary",
    glow: "shadow-glow",
  },
  {
    icon: Shield,
    title: "Secure & trusted",
    description: "Payments protected, free cancellation on most bookings.",
    bg: "bg-gradient-mint",
    glow: "shadow-mint",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-surface relative overflow-hidden">
      <div className="container relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-black mb-4 leading-tight">
            Why people <span className="text-aurora animate-gradient">love</span> us
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">
            Not another booking site. A travel buddy that actually gets it.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 22 }}
              whileHover={{ y: -6 }}
              className="group relative p-6 rounded-3xl glass hover:border-border transition-all duration-300"
            >
              <div
                className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} mb-5 group-hover:${feature.glow} transition-shadow duration-300`}
              >
                <feature.icon className="h-7 w-7 text-white" strokeWidth={2.4} />
              </div>
              <h3 className="text-xl font-bold mb-2 leading-tight">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
