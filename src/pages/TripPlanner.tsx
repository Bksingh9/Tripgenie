import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TripComparisonCard } from "@/components/trips/TripComparisonCard";
import { TripInsights } from "@/components/trips/TripInsights";
import { AffiliateBooking } from "@/components/monetization/AffiliateBooking";
import { planTrip, type GeneratedTripOption } from "@/lib/ai";
import { useTripAgents } from "@/hooks/useTripAgents";
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
  Plane,
  Train,
  Bus,
  Hotel,
  Sparkles,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

const TripPlanner = () => {
  const { plan: agentPlan, search: runAgents } = useTripAgents();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [selectedTransports, setSelectedTransports] = useState<string[]>(["Flights", "Hotels"]);

  const [tripOptions, setTripOptions] = useState<GeneratedTripOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  const toggleTransport = (label: string) => {
    setSelectedTransports((prev) =>
      prev.includes(label) ? prev.filter((t) => t !== label) : [...prev, label]
    );
  };

  const handleSearch = async () => {
    if (!from.trim() || !to.trim()) {
      toast.error("Please enter both origin and destination");
      return;
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      toast.error("Origin and destination cannot be the same");
      return;
    }
    if (Number(travelers) < 1) {
      toast.error("At least 1 traveler required");
      return;
    }
    if (departDate && new Date(departDate) < new Date(new Date().toDateString())) {
      toast.error("Departure date cannot be in the past");
      return;
    }
    if (returnDate && departDate && new Date(returnDate) < new Date(departDate)) {
      toast.error("Return date must be after departure date");
      return;
    }

    setIsLoading(true);
    setShowResults(false);
    setSelectedTrip(null);

    const query = `${from} to ${to}${departDate ? `, departing ${departDate}` : ""}${returnDate ? `, returning ${returnDate}` : ""}, ${travelers} traveler${Number(travelers) > 1 ? "s" : ""}, prefer ${selectedTransports.join(", ").toLowerCase()}`;

    try {
      const [options] = await Promise.all([
        planTrip(query),
        runAgents({ origin: from, destination: to, departDate, returnDate, travelers: Number(travelers) }),
      ]);
      setTripOptions(options);
      setShowResults(true);
    } catch {
      toast.error("Failed to find trip options. Please try again.");
    } finally {
      setIsLoading(false);
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
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
              <Sparkles className="h-4 w-4" />
              AI-Powered Search
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Plan your <span className="text-gradient">perfect trip</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Fill in the details and let our AI find the best combination of transport and accommodation for you.
            </p>
          </div>

          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Where are you going?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input placeholder="Mumbai, Delhi, Bangalore..." value={from} onChange={(e) => setFrom(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input placeholder="Goa, Manali, Kerala..." value={to} onChange={(e) => setTo(e.target.value)} />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Departure
                  </label>
                  <Input type="date" value={departDate} min={new Date().toISOString().split("T")[0]} onChange={(e) => setDepartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" /> Return
                  </label>
                  <Input type="date" value={returnDate} min={departDate || new Date().toISOString().split("T")[0]} onChange={(e) => setReturnDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" /> Travelers
                  </label>
                  <Input type="number" min="1" max="10" value={travelers} onChange={(e) => setTravelers(Math.max(1, Number(e.target.value)).toString())} />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium">Preferred Transport</label>
                <div className="flex flex-wrap gap-3">
                  {[
                    { icon: Plane, label: "Flights" },
                    { icon: Train, label: "Trains" },
                    { icon: Bus, label: "Buses" },
                    { icon: Hotel, label: "Hotels" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => toggleTransport(item.label)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all duration-300 ${
                        selectedTransports.includes(item.label)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-card hover:border-primary/50 hover:bg-primary/5"
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="hero" size="xl" className="w-full gap-2" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    Find Best Options
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* AI Results */}
          {showResults && tripOptions.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">
                  We found {tripOptions.length} options for {from} → {to}
                </h2>
                <p className="text-muted-foreground">Select the one that fits your style</p>
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
                {tripOptions.map((option, index) => (
                  <TripComparisonCard
                    key={option.id}
                    option={option}
                    index={index}
                    isSelected={selectedTrip === option.id}
                    onSelect={() => setSelectedTrip(option.id)}
                  />
                ))}
              </div>

              {agentPlan && <TripInsights plan={agentPlan} />}

              <AffiliateBooking destination={to} />
            </motion.div>
          )}

          {/* Quick Tips */}
          {!showResults && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "AI-Powered", desc: "Our AI analyzes flights, hotels, and transport to find the best combinations" },
                { title: "8 Data Agents", desc: "Weather, currency, holidays, sun times, location — all fetched in parallel" },
                { title: "Real Prices", desc: "Compare deals across Booking.com, Skyscanner, MakeMyTrip and more" },
              ].map((tip, index) => (
                <motion.div
                  key={tip.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="p-4 rounded-xl border border-border bg-card/50"
                >
                  <h4 className="font-semibold text-sm mb-1">{tip.title}</h4>
                  <p className="text-xs text-muted-foreground">{tip.desc}</p>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default TripPlanner;
