import { motion } from "framer-motion";
import { Sparkles, Globe, Zap, Shield, TrendingDown, Clock } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-Powered Planning",
    description: "Just tell us where you want to go. Our AI finds the perfect combination of flights, hotels, and transport.",
  },
  {
    icon: Globe,
    title: "Multimodal Journeys",
    description: "Combine flights, trains, buses, cabs, and even ferries in one seamless itinerary.",
  },
  {
    icon: TrendingDown,
    title: "Best Price Guarantee",
    description: "We compare prices across 100+ providers to get you the best deals every time.",
  },
  {
    icon: Clock,
    title: "Real-Time Updates",
    description: "Track prices and get alerts when they drop. Never miss a deal again.",
  },
  {
    icon: Zap,
    title: "Instant Booking",
    description: "Book your entire trip in seconds. One checkout for flights, hotels, and more.",
  },
  {
    icon: Shield,
    title: "Secure & Trusted",
    description: "Your payments are protected. Free cancellation on most bookings.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-20 bg-gradient-surface">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why travelers love <span className="text-gradient">TripGenie</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            We're not just another booking site. We're your personal AI travel agent that actually understands what you want.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group p-6 rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-elevated transition-all duration-300"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
