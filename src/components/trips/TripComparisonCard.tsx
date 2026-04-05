import { motion } from "framer-motion";
import {
  Clock,
  IndianRupee,
  Leaf,
  Plane,
  Building2,
  Train,
  Bus,
  Car,
  Star,
  TrendingDown,
  Zap,
  Crown,
  ExternalLink
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAffiliateLink } from "@/components/monetization/AffiliateBooking";

interface TripSegment {
  type: "flight" | "hotel" | "train" | "bus" | "cab";
  title: string;
  subtitle: string;
  time?: string;
  price: number;
}

interface TripOption {
  id: string;
  label: string;
  labelType: "budget" | "value" | "comfort" | "luxury";
  totalPrice: number;
  totalDuration: string;
  carbonOffset: string;
  segments: TripSegment[];
  savings?: number;
}

const labelConfig = {
  budget: { icon: TrendingDown, color: "bg-success text-primary-foreground", text: "Budget Banger" },
  value: { icon: Star, color: "bg-primary", text: "Best Value" },
  comfort: { icon: Zap, color: "bg-warning text-primary-foreground", text: "Comfort" },
  luxury: { icon: Crown, color: "bg-gradient-primary text-primary-foreground", text: "Luxury" },
};

const segmentIcons = {
  flight: Plane,
  hotel: Building2,
  train: Train,
  bus: Bus,
  cab: Car,
};

interface TripComparisonCardProps {
  option: TripOption;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function TripComparisonCard({ option, index, isSelected, onSelect }: TripComparisonCardProps) {
  const labelInfo = labelConfig[option.labelType];
  const LabelIcon = labelInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={`relative cursor-pointer transition-all duration-300 ${
          isSelected
            ? "border-primary shadow-glow ring-2 ring-primary/30"
            : "hover:border-primary/40"
        }`}
        onClick={onSelect}
      >
        {/* Label Badge */}
        <div className="absolute -top-3 left-4">
          <Badge className={`${labelInfo.color} gap-1 px-3 py-1 text-xs font-semibold shadow-lg`}>
            <LabelIcon className="h-3 w-3" />
            {labelInfo.text}
          </Badge>
        </div>

        <CardHeader className="pt-6 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold flex items-center gap-1">
              <IndianRupee className="h-5 w-5" />
              {option.totalPrice.toLocaleString("en-IN")}
            </CardTitle>
            {option.savings && (
              <Badge variant="outline" className="text-success border-success">
                Save ₹{option.savings.toLocaleString("en-IN")}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {option.totalDuration}
            </span>
            <span className="flex items-center gap-1">
              <Leaf className="h-4 w-4 text-success" />
              {option.carbonOffset}
            </span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Segments */}
          <div className="space-y-2">
            {option.segments.map((segment, idx) => {
              const SegmentIcon = segmentIcons[segment.type];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <SegmentIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{segment.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{segment.subtitle}</p>
                  </div>
                  <div className="text-right">
                    {segment.time && (
                      <p className="text-xs text-muted-foreground">{segment.time}</p>
                    )}
                    <p className="text-sm font-semibold">₹{segment.price.toLocaleString("en-IN")}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {isSelected ? (
            <a
              href={getAffiliateLink(option.segments[0]?.type || "hotel").url}
              target="_blank"
              rel="noopener sponsored"
            >
              <Button variant="hero" className="w-full mt-4 gap-2">
                Book Now
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <Button variant="outline" className="w-full mt-4" onClick={onSelect}>
              Select This Trip
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Demo data for the landing page
export const demoTripOptions: TripOption[] = [
  {
    id: "1",
    label: "Budget Banger",
    labelType: "budget",
    totalPrice: 8499,
    totalDuration: "8h 30m",
    carbonOffset: "12kg CO₂",
    savings: 3500,
    segments: [
      { type: "flight", title: "IndiGo 6E-2341", subtitle: "BOM → GOI • 1h 15m", time: "06:00", price: 3999 },
      { type: "hotel", title: "Beach View Hostel", subtitle: "Calangute • 2 nights", price: 2500 },
      { type: "cab", title: "Airport Transfer", subtitle: "Dabolim → Hotel", price: 2000 },
    ],
  },
  {
    id: "2",
    label: "Best Value",
    labelType: "value",
    totalPrice: 12999,
    totalDuration: "6h 45m",
    carbonOffset: "14kg CO₂",
    savings: 2000,
    segments: [
      { type: "flight", title: "Air India AI-881", subtitle: "BOM → GOI • 1h 10m", time: "09:30", price: 5499 },
      { type: "hotel", title: "Goa Marriott Resort", subtitle: "Miramar • 2 nights", price: 5500 },
      { type: "cab", title: "Private Car", subtitle: "Airport pickup & drop", price: 2000 },
    ],
  },
  {
    id: "3",
    label: "Comfort",
    labelType: "comfort",
    totalPrice: 18500,
    totalDuration: "5h 30m",
    carbonOffset: "16kg CO₂",
    segments: [
      { type: "flight", title: "Vistara UK-871", subtitle: "BOM → GOI • 1h 5m", time: "11:00", price: 7500 },
      { type: "hotel", title: "W Goa", subtitle: "Vagator • 2 nights", price: 9000 },
      { type: "cab", title: "Luxury Transfer", subtitle: "Innova Crysta", price: 2000 },
    ],
  },
  {
    id: "4",
    label: "Luxury",
    labelType: "luxury",
    totalPrice: 35000,
    totalDuration: "4h 45m",
    carbonOffset: "18kg CO₂",
    segments: [
      { type: "flight", title: "Vistara Business", subtitle: "BOM → GOI • 1h 5m", time: "10:00", price: 15000 },
      { type: "hotel", title: "Taj Exotica", subtitle: "Benaulim • 2 nights", price: 16000 },
      { type: "cab", title: "Mercedes Transfer", subtitle: "Premium pickup", price: 4000 },
    ],
  },
];
