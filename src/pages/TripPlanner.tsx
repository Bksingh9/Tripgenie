import { useState } from "react";
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
  Sparkles
} from "lucide-react";

const TripPlanner = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departDate, setDepartDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [travelers, setTravelers] = useState("1");

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
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">From</label>
                  <Input
                    placeholder="Mumbai, Delhi, Bangalore..."
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">To</label>
                  <Input
                    placeholder="Goa, Manali, Kerala..."
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
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

              {/* Transport Preferences */}
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
                      className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                    >
                      <item.icon className="h-4 w-4 text-primary" />
                      <span className="text-sm">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button variant="hero" size="xl" className="w-full gap-2">
                Find Best Options
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Flexible Dates?", desc: "Check the 'Flexible' option to see cheaper alternatives" },
              { title: "Multi-City?", desc: "Add stops to your journey for a complete itinerary" },
              { title: "Budget Limit?", desc: "Set a max budget and we'll find options within range" },
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
        </motion.div>
      </div>
    </Layout>
  );
};

export default TripPlanner;
