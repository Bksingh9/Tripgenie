import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plane,
  Hotel,
  Calendar,
  MapPin,
  Download,
  Share2,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const bookings = [
  {
    id: "TG-2024-001",
    destination: "Goa",
    from: "Mumbai",
    dates: "Dec 24 - Dec 26, 2024",
    status: "confirmed",
    totalAmount: 11499,
    segments: [
      { type: "flight", title: "IndiGo 6E-2341", time: "Dec 24, 06:00" },
      { type: "hotel", title: "Goa Marriott Resort", time: "2 nights" },
    ],
    bookedOn: "Dec 10, 2024",
  },
  {
    id: "TG-2024-002",
    destination: "Jaipur",
    from: "Delhi",
    dates: "Nov 15 - Nov 17, 2024",
    status: "completed",
    totalAmount: 8999,
    segments: [
      { type: "flight", title: "Air India AI-521", time: "Nov 15, 08:30" },
      { type: "hotel", title: "ITC Rajputana", time: "2 nights" },
    ],
    bookedOn: "Nov 1, 2024",
  },
  {
    id: "TG-2024-003",
    destination: "Manali",
    from: "Delhi",
    dates: "Jan 5 - Jan 8, 2025",
    status: "pending",
    totalAmount: 16499,
    segments: [
      { type: "flight", title: "SpiceJet SG-123", time: "Jan 5, 07:00" },
      { type: "hotel", title: "The Himalayan", time: "3 nights" },
    ],
    bookedOn: "Dec 12, 2024",
  },
];

const statusConfig = {
  confirmed: { icon: CheckCircle, color: "bg-success text-primary-foreground", text: "Confirmed" },
  completed: { icon: CheckCircle, color: "bg-muted text-muted-foreground", text: "Completed" },
  pending: { icon: Clock, color: "bg-warning text-primary-foreground", text: "Pending" },
  cancelled: { icon: XCircle, color: "bg-destructive text-destructive-foreground", text: "Cancelled" },
};

const MyBookings = () => {
  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">My Bookings</h1>
            <p className="text-muted-foreground">
              View and manage all your travel bookings
            </p>
          </div>

          {/* Bookings List */}
          {bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking, index) => {
                const status = statusConfig[booking.status as keyof typeof statusConfig];
                const StatusIcon = status.icon;

                return (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                              <Plane className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-lg">
                                  {booking.from} → {booking.destination}
                                </h3>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Booking ID: {booking.id}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${status.color} gap-1`}>
                            <StatusIcon className="h-3 w-3" />
                            {status.text}
                          </Badge>
                        </div>

                        {/* Details */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-4 p-4 rounded-xl bg-secondary/50">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{booking.dates}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">Booked on {booking.bookedOn}</span>
                          </div>
                        </div>

                        {/* Segments */}
                        <div className="space-y-2 mb-4">
                          {booking.segments.map((segment, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl border border-border"
                            >
                              <div className="flex items-center gap-3">
                                {segment.type === "flight" ? (
                                  <Plane className="h-4 w-4 text-primary" />
                                ) : (
                                  <Hotel className="h-4 w-4 text-primary" />
                                )}
                                <span className="text-sm font-medium">{segment.title}</span>
                              </div>
                              <span className="text-sm text-muted-foreground">{segment.time}</span>
                            </div>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-border">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                            <p className="text-2xl font-bold">
                              ₹{booking.totalAmount.toLocaleString("en-IN")}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-1">
                              <Download className="h-4 w-4" />
                              Receipt
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            <Button variant="default" size="sm">
                              View Details
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
