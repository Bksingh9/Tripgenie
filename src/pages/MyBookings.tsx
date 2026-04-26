import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plane,
  Hotel,
  Train,
  Bus,
  Car,
  Calendar,
  MapPin,
  Download,
  Share2,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useBookings } from "@/lib/useTripStore";
import { describeSearch, type BookingStatus, type TripSegmentType } from "@/lib/trips";

const statusConfig: Record<
  BookingStatus,
  { icon: typeof CheckCircle; color: string; text: string }
> = {
  confirmed: { icon: CheckCircle, color: "bg-success text-primary-foreground", text: "Confirmed" },
  completed: { icon: CheckCircle, color: "bg-muted text-muted-foreground", text: "Completed" },
  pending: { icon: Clock, color: "bg-warning text-primary-foreground", text: "Pending" },
  cancelled: { icon: XCircle, color: "bg-destructive text-destructive-foreground", text: "Cancelled" },
};

const segmentIcon: Record<TripSegmentType, typeof Plane> = {
  flight: Plane,
  hotel: Hotel,
  train: Train,
  bus: Bus,
  cab: Car,
};

const formatBookedOn = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const MyBookings = () => {
  const { bookings, cancelBooking } = useBookings();

  const handleShare = async (code: string) => {
    const url = `${window.location.origin}/my-bookings#${code}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Booking link copied");
    } catch {
      toast.error("Could not copy link");
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
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your travel bookings
            </p>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking, index) => {
                const status = statusConfig[booking.status];
                const StatusIcon = status.icon;
                return (
                  <motion.div
                    key={booking.id}
                    id={booking.code}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Plane className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg">
                                {booking.search.from} → {booking.search.to}
                              </h3>
                              <p className="text-sm text-muted-foreground font-mono">
                                {booking.code}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${status.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.text}
                          </Badge>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{describeSearch(booking.search)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              Booked on {formatBookedOn(booking.bookedAt)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          {booking.option.segments.map((segment, idx) => {
                            const SegmentIcon = segmentIcon[segment.type];
                            return (
                              <div
                                key={idx}
                                className="flex items-center justify-between p-3 rounded-xl border border-border"
                              >
                                <div className="flex items-center gap-3">
                                  <SegmentIcon className="h-4 w-4 text-primary" />
                                  <div>
                                    <p className="text-sm font-medium">{segment.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {segment.subtitle}
                                    </p>
                                  </div>
                                </div>
                                {segment.time && (
                                  <span className="text-sm text-muted-foreground">
                                    {segment.time}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">
                              ₹{booking.totalAmount.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => toast.info("Receipt download coming soon")}
                            >
                              <Download className="h-4 w-4" />
                              Receipt
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              onClick={() => handleShare(booking.code)}
                            >
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            {booking.status === "confirmed" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={async () => {
                                  await cancelBooking(booking.id);
                                  toast.success("Booking cancelled");
                                }}
                              >
                                Cancel
                              </Button>
                            )}
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
                <Plane className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
                <p className="text-muted-foreground mb-6">
                  Your travel bookings will appear here
                </p>
                <Link to="/trip-planner">
                  <Button variant="hero">Plan Your First Trip</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default MyBookings;
