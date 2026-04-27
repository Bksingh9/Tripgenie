import { motion } from "framer-motion";
import { MapPin, ArrowRight, IndianRupee } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";

const destinations = [
  {
    city: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
    priceFrom: 4999,
    tag: "beaches",
    accent: "bg-gradient-mint",
  },
  {
    city: "Manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop",
    priceFrom: 6999,
    tag: "mountains",
    accent: "bg-gradient-violet",
  },
  {
    city: "Jaipur",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop",
    priceFrom: 3999,
    tag: "heritage",
    accent: "bg-gradient-sunset",
  },
  {
    city: "Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
    priceFrom: 8999,
    tag: "backwaters",
    accent: "bg-gradient-primary",
  },
];

export function PopularDestinations() {
  return (
    <section id="popular-destinations" className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12"
        >
          <div>
            <h2 className="text-4xl md:text-6xl font-black leading-tight mb-2">
              Trending <span className="text-aurora animate-gradient">spots</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Where everyone's heading next.
            </p>
          </div>
          <Link
            to="/trip-planner"
            className="hidden md:inline-flex items-center gap-2 text-primary hover:gap-3 transition-all duration-300 font-semibold"
          >
            See all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.city}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, type: "spring", stiffness: 280, damping: 22 }}
              whileHover={{ y: -8 }}
            >
              <Link to="/trip-planner">
                <Card className="group overflow-hidden cursor-pointer border-0 bg-transparent">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-3xl">
                      <img
                        src={destination.image}
                        alt={destination.city}
                        className="w-full h-56 object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

                      {/* Sticker tag */}
                      <div className="absolute top-3 left-3">
                        <span className={`sticker text-white ${destination.accent}`}>
                          {destination.tag}
                        </span>
                      </div>

                      {/* Overlay info */}
                      <div className="absolute bottom-4 left-4 right-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <h3 className="font-black text-2xl tracking-tight">
                            {destination.city}
                          </h3>
                        </div>
                        <p className="text-sm text-muted-foreground inline-flex items-baseline gap-0.5">
                          from
                          <span className="text-foreground font-bold display-num text-base inline-flex items-baseline">
                            <IndianRupee className="h-3 w-3" />
                            {destination.priceFrom.toLocaleString("en-IN")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
