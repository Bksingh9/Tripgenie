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
  ArrowRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useBookings, useSavedTrips } from "@/lib/useTripStore";
import { describeSearch } from "@/lib/trips";

const SavedTrips = () => {
  const { savedTrips, removeSavedTrip, toggleAlert } = useSavedTrips();
  const { createBooking } = useBookings();
  const navigate = useNavigate();

  const handleBook = async (id: string) => {
    const trip = savedTrips.find((t) => t.id === id);
    if (!trip) return;
    const booking = await createBooking(trip.search, trip.option);
    if (booking) {
      await removeSavedTrip(id);
      toast.success(`Booking confirmed (${booking.id})`);
      navigate("/my-bookings");
    } else {
      toast.error("Could not create booking");
    }
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Saved Trips</h1>
              <p className="text-muted-foreground">
                Track prices and book when the time is right
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/30">
              <Bookmark className="h-5 w-5 text-primary" />
              <span className="font-semibold">{savedTrips.length}</span>
            </div>
          </div>

          {/* Trips List */}
          {savedTrips.length > 0 ? (
            <div className="space-y-4">
              {savedTrips.map((trip, index) => {
                const priceChange = trip.option.totalPrice - trip.originalPrice;
                return (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <MapPin className="h-4 w-4 text-primary" />
                              <h3 className="font-bold text-lg">
                                {trip.search.from} → {trip.search.to}
                              </h3>
                              <Badge variant="outline" className="ml-2">
                                {trip.option.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {describeSearch(trip.search)}
                            </div>
                          </div>

                          {priceChange !== 0 && (
                            <Badge
                              variant="outline"
                              className={
                                priceChange < 0
                                  ? "border-success text-success"
                                  : "border-destructive text-destructive"
                              }
                            >
                              {priceChange < 0 ? (
                                <TrendingDown className="h-3 w-3 mr-1" />
                              ) : (
                                <TrendingUp className="h-3 w-3 mr-1" />
                              )}
                              ₹{Math.abs(priceChange).toLocaleString("en-IN")}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-end justify-between">
                          <div>
                            <p className="text-2xl font-bold flex items-center gap-1">
                              <IndianRupee className="h-5 w-5" />
                              {trip.option.totalPrice.toLocaleString("en-IN")}
                            </p>
                            {priceChange !== 0 && (
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
                              className={
                                trip.alertActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
                              }
                              aria-label={trip.alertActive ? "Disable price alert" : "Enable price alert"}
                            >
                              <Bell className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={async () => {
                                await removeSavedTrip(trip.id);
                                toast.success("Removed from saved trips");
                              }}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label="Remove saved trip"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleBook(trip.id)}
                            >
                              Book Now
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
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
