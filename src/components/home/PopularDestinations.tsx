import { motion } from "framer-motion";
import { MapPin, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getAffiliateLink } from "@/components/monetization/AffiliateBooking";

const destinations = [
  {
    city: "Goa",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop",
    priceFrom: 4999,
    tag: "Beach Vibes",
  },
  {
    city: "Manali",
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400&h=300&fit=crop",
    priceFrom: 6999,
    tag: "Mountains",
  },
  {
    city: "Jaipur",
    image: "https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400&h=300&fit=crop",
    priceFrom: 3999,
    tag: "Heritage",
  },
  {
    city: "Kerala",
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop",
    priceFrom: 8999,
    tag: "Backwaters",
  },
];

export function PopularDestinations() {
  return (
    <section className="py-20">
      <div className="container">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Popular destinations</h2>
            <p className="text-muted-foreground">Trending getaways loved by travelers</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map((destination, index) => (
            <motion.div
              key={destination.city}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <a
                href={getAffiliateLink("hotel", destination.city).url}
                target="_blank"
                rel="noopener sponsored"
              >
                <Card className="group overflow-hidden cursor-pointer border-0 bg-transparent hover:shadow-elevated">
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={destination.image}
                        alt={`${destination.city} - ${destination.tag}`}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <div className="absolute top-3 right-3">
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/90 text-primary-foreground">
                          {destination.tag}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-1 text-foreground mb-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <h3 className="font-bold text-lg">{destination.city}</h3>
                          <ExternalLink className="h-3 w-3 text-primary ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          From <span className="text-primary font-semibold">₹{destination.priceFrom.toLocaleString("en-IN")}</span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
