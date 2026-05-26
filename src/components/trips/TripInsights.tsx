import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, DollarSign, MapPin, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { TripPlan, AgentStatus } from "@/lib/agents/types";

function StatusBadge({ status, ms }: { status: AgentStatus; ms: number }) {
  if (status === "success") return <Badge variant="outline" className="text-success border-success gap-1"><CheckCircle className="h-3 w-3" />{Math.round(ms)}ms</Badge>;
  if (status === "error") return <Badge variant="outline" className="text-destructive border-destructive gap-1"><XCircle className="h-3 w-3" />Failed</Badge>;
  return <Badge variant="outline" className="gap-1"><Loader2 className="h-3 w-3 animate-spin" />Running</Badge>;
}

export function TripInsights({ plan }: { plan: TripPlan }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">Trip Intelligence</h2>
        <p className="text-sm text-muted-foreground">4 AI agents ran in parallel to gather this data</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Weather */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Cloud className="h-4 w-4 text-primary" />7-Day Forecast</span>
              <StatusBadge status={plan.weather.status} ms={plan.weather.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.weather.data ? (
              <div className="grid grid-cols-7 gap-1 text-center">
                {plan.weather.data.map((day) => (
                  <div key={day.date} className="p-1.5 rounded-lg bg-secondary/50">
                    <p className="text-[10px] text-muted-foreground">{new Date(day.date).toLocaleDateString("en", { weekday: "short" })}</p>
                    <p className="text-lg">{day.icon}</p>
                    <p className="text-xs font-semibold">{day.tempHigh}°</p>
                    <p className="text-[10px] text-muted-foreground">{day.tempLow}°</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{plan.weather.error || "No data"}</p>
            )}
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-primary" />Currency Rates (₹1 INR)</span>
              <StatusBadge status={plan.currency.status} ms={plan.currency.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.currency.data ? (
              <div className="grid grid-cols-2 gap-2">
                {plan.currency.data.slice(0, 6).map((rate) => (
                  <div key={rate.code} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50 text-sm">
                    <span className="font-medium">{rate.code}</span>
                    <span className="text-muted-foreground">₹{rate.rate.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{plan.currency.error || "No data"}</p>
            )}
          </CardContent>
        </Card>

        {/* Destination Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" />Destination Info</span>
              <StatusBadge status={plan.destination.status} ms={plan.destination.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.destination.data ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span className="font-medium">{plan.destination.data.flag} {plan.destination.data.country}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Region</span><span>{plan.destination.data.region}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Languages</span><span>{plan.destination.data.languages.slice(0, 3).join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{plan.destination.data.currency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Timezone</span><span>{plan.destination.data.timezones[0]}</span></div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{plan.destination.error || "No data"}</p>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span className="flex items-center gap-2"><Camera className="h-4 w-4 text-primary" />Destination Photos</span>
              <StatusBadge status={plan.photos.status} ms={plan.photos.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {plan.photos.data ? (
              <div className="grid grid-cols-3 gap-2">
                {plan.photos.data.slice(0, 3).map((photo) => (
                  <div key={photo.id} className="aspect-square rounded-lg overflow-hidden">
                    <img src={photo.thumbnail} alt={photo.alt} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{plan.photos.error || "No data"}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
