import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Loader2,
} from "lucide-react";
import { TripComparisonCard } from "@/components/trips/TripComparisonCard";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { useBookings, useSavedTrips } from "@/lib/useTripStore";
import { describeSearch, generateOptions, type SearchInput, type TripOption } from "@/lib/trips";

interface SearchState extends SearchInput {
  options: TripOption[];
  source: "amadeus" | "mock";
}

async function searchTrip(input: SearchInput): Promise<{
  options: TripOption[];
  source: "amadeus" | "mock";
}> {
  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (res.ok) {
      const json = (await res.json()) as { options: TripOption[]; source: "amadeus" | "mock" };
      if (Array.isArray(json.options) && json.options.length > 0) return json;
    }
  } catch {
    // fall through to local mock
  }
  return { options: generateOptions(input), source: "mock" };
}

const TripPlanner = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [searching, setSearching] = useState(false);
  const [result, setResult] = useState<SearchState | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { user } = useAuth();
  const { saveTrip, isSaved } = useSavedTrips();
  const { createBooking } = useBookings();
  const navigate = useNavigate();

  const canSubmit = from.trim() && to.trim() && departDate;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || searching) return;
    setSearching(true);
    const search: SearchInput = {
      from: from.trim(),
      to: to.trim(),
      departDate,
      returnDate: returnDate || undefined,
      travelers: Math.max(1, Number(travelers) || 1),
    };
    try {
      const { options, source } = await searchTrip(search);
      setResult({ ...search, options, source });
      setSelectedId(options[1]?.id ?? options[0]?.id ?? null);
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (option: TripOption) => {
    if (!user) {
      toast.info("Sign in to save trips");
      navigate("/auth", { state: { from: "/trip-planner" } });
      return;
    }
    if (!result) return;
    if (isSaved(option.id)) {
      toast.info("This trip is already saved");
      return;
    }
    const search: SearchInput = {
      from: result.from,
      to: result.to,
      departDate: result.departDate,
      returnDate: result.returnDate,
      travelers: result.travelers,
    };
    const trip = await saveTrip(search, option);
    if (trip) toast.success("Trip saved — track it from Saved Trips");
  };

  const handleBook = async (option: TripOption) => {
    if (!user) {
      toast.info("Sign in to book this trip");
      navigate("/auth", { state: { from: "/trip-planner" } });
      return;
    }
    if (!result) return;
    const search: SearchInput = {
      from: result.from,
      to: result.to,
      departDate: result.departDate,
      returnDate: result.returnDate,
      travelers: result.travelers,
    };
    const booking = await createBooking(search, option);
    if (booking) {
      toast.success(`Booking confirmed (${booking.code})`);
      navigate("/my-bookings");
    } else {
      toast.error("Could not create booking");
    }
  };

  const summary = useMemo(() => (result ? describeSearch(result) : ""), [result]);

  return (
    <Layout>
      <div className="container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
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

          {/* Search Form */}
          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Where are you going?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSearch}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">From</label>
                    <Input
                      placeholder="Mumbai, Delhi, Bangalore..."
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">To</label>
                    <Input
                      placeholder="Goa, Manali, Kerala..."
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Departure
                    </label>
                    <Input
                      type="date"
                      value={departDate}
                      onChange={(e) => setDepartDate(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Return
                    </label>
                    <Input
                      type="date"
                      value={returnDate}
                      min={departDate || undefined}
                      onChange={(e) => setReturnDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Travelers
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={travelers}
                      onChange={(e) => setTravelers(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-medium">Includes</label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { icon: Plane, label: "Flights" },
                      { icon: Train, label: "Trains" },
                      { icon: Bus, label: "Buses" },
                      { icon: Hotel, label: "Hotels" },
                    ].map((item) => (
                      <span
                        key={item.label}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm text-muted-foreground"
                      >
                        <item.icon className="h-4 w-4 text-primary" />
                        {item.label}
                      </span>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="xl"
                  className="w-full gap-2"
                  disabled={!canSubmit || searching}
                >
                  {searching ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Finding the best options...
                    </>
                  ) : (
                    <>
                      Find Best Options
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl md:text-3xl font-bold mb-1">
                  {result.options.length} options for you
                </h2>
                <p className="text-muted-foreground">{summary}</p>
                {result.source === "mock" && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Showing sample data — set <code>AMADEUS_API_KEY</code> in your env for live results
                  </p>
                )}
              </div>

              <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
                {result.options.map((option, index) => (
                  <TripComparisonCard
                    key={option.id}
                    option={option}
                    index={index}
                    isSelected={selectedId === option.id}
                    onSelect={() => setSelectedId(option.id)}
                    onBook={() => handleBook(option)}
                    onSave={() => handleSave(option)}
                    isSaved={isSaved(option.id)}
                  />
                ))}
              </div>
            </motion.section>
          )}

          {/* Quick Tips */}
          {!result && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title: "Flexible Dates?", desc: "Try different return dates to see cheaper alternatives" },
                { title: "Multi-City?", desc: "Plan stops by running multiple searches" },
                { title: "Budget Limit?", desc: "We label options Budget, Value, Comfort, and Luxury" },
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
