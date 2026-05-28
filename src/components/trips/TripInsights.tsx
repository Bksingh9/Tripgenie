import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cloud, DollarSign, MapPin, Camera, Calendar, Sun, Globe, Languages, CheckCircle, XCircle, Loader2 } from "lucide-react";
import type { TripPlan, AgentStatus } from "@/lib/agents/types";

function StatusBadge({ status, ms }: { status: AgentStatus; ms: number }) {
  if (status === "success") return <Badge variant="outline" className="text-success border-success gap-1 text-[10px]"><CheckCircle className="h-3 w-3" />{Math.round(ms)}ms</Badge>;
  if (status === "error") return <Badge variant="outline" className="text-destructive border-destructive gap-1 text-[10px]"><XCircle className="h-3 w-3" />Failed</Badge>;
  return <Badge variant="outline" className="gap-1 text-[10px]"><Loader2 className="h-3 w-3 animate-spin" />Running</Badge>;
}

export function TripInsights({ plan }: { plan: TripPlan }) {
  const agentCount = 8;
  const successCount = [plan.weather, plan.currency, plan.destination, plan.photos, plan.holidays, plan.sun, plan.geo, plan.translation].filter(a => a.status === "success").length;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold mb-1">Trip Intelligence</h2>
        <p className="text-sm text-muted-foreground">{agentCount} AI agents ran in parallel — {successCount}/{agentCount} succeeded</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Cloud className="h-4 w-4 text-primary" />Weather</span>
              <StatusBadge status={plan.weather.status} ms={plan.weather.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.weather.data ? (
              <div className="grid grid-cols-7 gap-0.5 text-center">
                {plan.weather.data.map((day) => (
                  <div key={day.date} className="p-1 rounded bg-secondary/50">
                    <p className="text-[9px] text-muted-foreground">{new Date(day.date).toLocaleDateString("en", { weekday: "narrow" })}</p>
                    <p className="text-sm">{day.icon}</p>
                    <p className="text-[10px] font-semibold">{day.tempHigh}°</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.weather.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Currency */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4 text-primary" />Currency</span>
              <StatusBadge status={plan.currency.status} ms={plan.currency.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.currency.data ? (
              <div className="grid grid-cols-2 gap-1">
                {plan.currency.data.slice(0, 4).map((rate) => (
                  <div key={rate.code} className="flex justify-between p-1.5 rounded bg-secondary/50 text-xs">
                    <span className="font-medium">{rate.code}</span>
                    <span className="text-muted-foreground">₹{rate.rate.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.currency.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Destination */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />Info</span>
              <StatusBadge status={plan.destination.status} ms={plan.destination.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.destination.data ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span>{plan.destination.data.flag} {plan.destination.data.country}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Languages</span><span>{plan.destination.data.languages.slice(0, 2).join(", ")}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Currency</span><span>{plan.destination.data.currency}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Timezone</span><span>{plan.destination.data.timezones[0]}</span></div>
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.destination.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Camera className="h-4 w-4 text-primary" />Photos</span>
              <StatusBadge status={plan.photos.status} ms={plan.photos.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.photos.data ? (
              <div className="grid grid-cols-3 gap-1">
                {plan.photos.data.slice(0, 3).map((p) => (
                  <div key={p.id} className="aspect-square rounded overflow-hidden">
                    <img src={p.thumbnail} alt={p.alt} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.photos.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Holidays */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />Holidays</span>
              <StatusBadge status={plan.holidays.status} ms={plan.holidays.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.holidays.data ? (
              <div className="space-y-1">
                {plan.holidays.data.slice(0, 4).map((h) => (
                  <div key={h.date} className="flex justify-between text-xs p-1 rounded bg-secondary/50">
                    <span className="truncate flex-1">{h.name}</span>
                    <span className="text-muted-foreground ml-2">{new Date(h.date).toLocaleDateString("en", { month: "short", day: "numeric" })}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.holidays.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Sunrise/Sunset */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Sun className="h-4 w-4 text-primary" />Sun Times</span>
              <StatusBadge status={plan.sun.status} ms={plan.sun.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.sun.data ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">🌅 Sunrise</span><span>{plan.sun.data.sunrise}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">🌇 Sunset</span><span>{plan.sun.data.sunset}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">☀️ Day Length</span><span>{plan.sun.data.dayLength}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">🕐 Solar Noon</span><span>{plan.sun.data.solarNoon}</span></div>
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.sun.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Geo */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Globe className="h-4 w-4 text-primary" />Location</span>
              <StatusBadge status={plan.geo.status} ms={plan.geo.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.geo.data ? (
              <div className="space-y-1 text-xs">
                <div className="flex justify-between"><span className="text-muted-foreground">Lat</span><span>{plan.geo.data.lat.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Lng</span><span>{plan.geo.data.lng.toFixed(4)}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">State</span><span>{plan.geo.data.state}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Country</span><span>{plan.geo.data.country}</span></div>
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.geo.error || "No data"}</p>}
          </CardContent>
        </Card>

        {/* Translation */}
        <Card>
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5"><Languages className="h-4 w-4 text-primary" />Phrases</span>
              <StatusBadge status={plan.translation.status} ms={plan.translation.ms} />
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {plan.translation.data ? (
              <div className="space-y-1">
                {plan.translation.data.slice(0, 4).map((p) => (
                  <div key={p.english} className="text-xs p-1 rounded bg-secondary/50">
                    <p className="text-muted-foreground truncate">{p.english}</p>
                    <p className="font-medium truncate">{p.translated}</p>
                  </div>
                ))}
              </div>
            ) : <p className="text-xs text-muted-foreground">{plan.translation.error || "No data"}</p>}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
