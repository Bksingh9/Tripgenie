import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bookmark, 
  Bell, 
  Trash2, 
  TrendingDown, 
  TrendingUp,
  MapPin,
  Calendar,
  IndianRupee,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const savedTrips = [
  {
    id: "1",
    destination: "Goa",
    from: "Mumbai",
    dates: "Dec 24 - Dec 26",
    originalPrice: 12999,
    currentPrice: 11499,
    priceChange: -1500,
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&h=200&fit=crop",
    alertActive: true,
  },
  {
    id: "2",
    destination: "Manali",
    from: "Delhi",
    dates: "Jan 5 - Jan 8",
    originalPrice: 15999,
    currentPrice: 16499,
    priceChange: 500,
    image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&h=200&fit=crop",
    alertActive: true,
  },
  {
    id: "3",
    destination: "Kerala",
    from: "Bangalore",
    dates: "Feb 14 - Feb 18",
    originalPrice: 22999,
    currentPrice: 22999,
    priceChange: 0,
    image: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300&h=200&fit=crop",
    alertActive: false,
  },
];

const SavedTrips = () => {
  const [trips, setTrips] = useState(savedTrips);

  const removeTrip = (id: string) => {
    setTrips(trips.filter(trip => trip.id !== id));
  };

  const toggleAlert = (id: string) => {
    setTrips(trips.map(trip => 
      trip.id === id ? { ...trip, alertActive: !trip.alertActive } : trip
    ));
  };

  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Saved Trips
              </h1>
              <p className="text-muted-foreground">
                Track prices and book when the time is right
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="font-semibold">{trips.length}</span>
            </div>
          </div>

          {/* Trips List */}
          {trips.length > 0 ? (
            <div className="space-y-4">
              {trips.map((trip, index) => (
                <motion.div
                  key={trip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Image */}
                        <div className="relative w-full md:w-48 h-40 md:h-auto shrink-0">
                          <img
                            src={trip.image}
                            alt={trip.destination}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 md:bg-gradient-to-l" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <MapPin className="h-4 w-4 text-primary" />
                                <h3 className="font-bold text-lg">
                                  {trip.from} → {trip.destination}
                                </h3>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                {trip.dates}
                              </div>
                            </div>

                            {/* Price Change Badge */}
                            {trip.priceChange !== 0 && (
                              <Badge
                                variant="outline"
                                className={trip.priceChange < 0 
                                  ? "border-success text-success" 
                                  : "border-destructive text-destructive"
                                }
                              >
                                {trip.priceChange < 0 ? (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                )}
                                ₹{Math.abs(trip.priceChange).toLocaleString("en-IN")}
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-end justify-between">
                            <div>
                              <p className="text-2xl font-bold flex items-center gap-1">
                                <IndianRupee className="h-5 w-5" />
                                {trip.currentPrice.toLocaleString("en-IN")}
                              </p>
                              {trip.priceChange !== 0 && (
                                <p className="text-sm text-muted-foreground line-through">
                                  ₹{trip.originalPrice.toLocaleString("en-IN")}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleAlert(trip.id)}
                                className={trip.alertActive ? "text-primary" : "text-muted-foreground"}
                              >
                                <Bell className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeTrip(trip.id)}
                                className="text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <Button variant="default" size="sm" className="gap-1">
                                Book Now
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <Bookmark className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved trips yet</h3>
                <p className="text-muted-foreground mb-6">
                  Start planning and save trips to track their prices
                </p>
                <Link to="/trip-planner">
                  <Button variant="hero">Plan a Trip</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default SavedTrips;
