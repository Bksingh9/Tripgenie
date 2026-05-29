import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
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
  ExternalLink,
  Loader2
} from "lucide-react";
import { Link } from "react-router-dom";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useAuth } from "@/contexts/AuthContext";
import { UpgradePrompt } from "@/components/monetization/UpgradePrompt";
import { AdBanner } from "@/components/monetization/AdBanner";
import { getAffiliateLink } from "@/components/monetization/AffiliateBooking";
import { getTrips, deleteTrip, updateTrip } from "@/lib/api";
import { toast } from "sonner";

interface TripDisplay {
  id: string;
  destination: string;
  from: string;
  dates: string;
  originalPrice: number;
  currentPrice: number;
  priceChange: number;
  image: string;
  alertActive: boolean;
}

const DEMO_TRIPS: TripDisplay[] = [
  {
    id: "demo-1",
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
    id: "demo-2",
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
    id: "demo-3",
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
  const [trips, setTrips] = useState<TripDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const { savedTripsLimit, isPro } = useSubscription();
  const { user, isConfigured } = useAuth();
  const isAtLimit = trips.length >= savedTripsLimit;

  useEffect(() => {
    loadTrips();
  }, [user]);

  const loadTrips = async () => {
    setLoading(true);
    try {
      if (user && isConfigured) {
        const dbTrips = await getTrips(user.id);
        setTrips(
          dbTrips.map((t) => ({
            id: t.id,
            destination: t.destination,
            from: t.origin,
            dates: `${new Date(t.start_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} - ${new Date(t.end_date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`,
            originalPrice: Number(t.original_price),
            currentPrice: Number(t.current_price),
            priceChange: Number(t.price_change),
            image: t.image_url || "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&h=200&fit=crop",
            alertActive: t.alert_active,
          }))
        );
      } else {
        setTrips(DEMO_TRIPS);
      }
    } catch {
      setTrips(DEMO_TRIPS);
    } finally {
      setLoading(false);
    }
  };

  const removeTrip = async (id: string) => {
    if (!window.confirm("Remove this trip? This cannot be undone.")) return;
    try {
      if (user && isConfigured && !id.startsWith("demo")) {
        await deleteTrip(id);
      }
      setTrips(trips.filter((trip) => trip.id !== id));
      toast.success("Trip removed");
    } catch {
      toast.error("Failed to remove trip");
    }
  };

  const toggleAlert = async (id: string) => {
    const trip = trips.find((t) => t.id === id);
    if (!trip) return;

    if (user && isConfigured && !id.startsWith("demo")) {
      await updateTrip(id, { alert_active: !trip.alertActive });
    }
    setTrips(
      trips.map((t) => (t.id === id ? { ...t, alertActive: !t.alertActive } : t))
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-24 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Saved Trips</h1>
              <p className="text-muted-foreground">
                Track prices and book when the time is right
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="font-semibold">{trips.length}</span>
            </div>
          </div>

          {isAtLimit && !isPro && (
            <div className="mb-6">
              <UpgradePrompt
                feature="unlimited saved trips"
                description="Free plan allows up to 3 saved trips. Upgrade to Pro for unlimited trip saving and price alerts."
              />
            </div>
          )}

          {trips.length > 0 ? (
            <>
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
                          <div className="relative w-full md:w-48 h-40 md:h-auto shrink-0">
                            <img src={trip.image} alt={trip.destination} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/50 md:bg-gradient-to-l" />
                          </div>
                          <div className="flex-1 p-5">
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <MapPin className="h-4 w-4 text-primary" />
                                  <h3 className="font-bold text-lg">{trip.from} → {trip.destination}</h3>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {trip.dates}
                                </div>
                              </div>
                              {trip.priceChange !== 0 && (
                                <Badge
                                  variant="outline"
                                  className={trip.priceChange < 0 ? "border-success text-success" : "border-destructive text-destructive"}
                                >
                                  {trip.priceChange < 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
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
                                  <p className="text-sm text-muted-foreground line-through">₹{trip.originalPrice.toLocaleString("en-IN")}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="icon" onClick={() => toggleAlert(trip.id)} className={trip.alertActive ? "text-primary" : "text-muted-foreground"}>
                                  <Bell className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => removeTrip(trip.id)} className="text-muted-foreground hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <a href={getAffiliateLink("hotel", trip.destination).url} target="_blank" rel="noopener sponsored">
                                  <Button variant="default" size="sm" className="gap-1">
                                    Book Now
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6">
                <AdBanner format="horizontal" />
              </div>
            </>
          ) : (
            <Card className="text-center py-16">
              <CardContent>
                <Bookmark className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No saved trips yet</h3>
                <p className="text-muted-foreground mb-6">Start planning and save trips to track their prices</p>
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
