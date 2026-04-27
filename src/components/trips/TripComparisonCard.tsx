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
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { TripOption } from "@/lib/trips";

const labelConfig = {
  budget: {
    icon: TrendingDown,
    text: "budget",
    bg: "bg-tier-budget",
    glow: "shadow-mint",
    ring: "ring-success/30",
  },
  value: {
    icon: Star,
    text: "best value",
    bg: "bg-tier-value",
    glow: "shadow-mint",
    ring: "ring-primary/30",
  },
  comfort: {
    icon: Zap,
    text: "comfort",
    bg: "bg-tier-comfort",
    glow: "shadow-glow",
    ring: "ring-primary/40",
  },
  luxury: {
    icon: Crown,
    text: "luxury",
    bg: "bg-tier-luxury animate-gradient",
    glow: "shadow-magenta",
    ring: "ring-accent-2/40",
  },
} as const;

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
  onBook?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
}

export function TripComparisonCard({
  option,
  index,
  isSelected,
  onSelect,
  onBook,
  onSave,
  isSaved,
}: TripComparisonCardProps) {
  const tier = labelConfig[option.labelType];
  const LabelIcon = tier.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={`relative cursor-pointer overflow-hidden border-border/40 transition-all duration-300 ${
          isSelected
            ? `border-transparent ring-2 ${tier.ring} ${tier.glow}`
            : "hover:border-border hover:shadow-elevated"
        }`}
        onClick={onSelect}
      >
        {/* Tier ribbon along the top */}
        <div className={`h-1.5 w-full ${tier.bg}`} />

        {/* Sticker label, slightly overlapping */}
        <div className="absolute top-3 left-4">
          <span className={`sticker text-white ${tier.bg}`}>
            <LabelIcon className="h-3 w-3" />
            {tier.text}
          </span>
        </div>

        <CardContent className="pt-12 pb-5 px-5 space-y-4">
          {/* Big price */}
          <div>
            <div className="flex items-baseline gap-1">
              <IndianRupee className="h-5 w-5 text-muted-foreground self-center" />
              <span className="display-num text-4xl">
                {option.totalPrice.toLocaleString("en-IN")}
              </span>
              {option.savings && (
                <span className="ml-auto sticker bg-success/15 text-success border border-success/30">
                  save ₹{option.savings.toLocaleString("en-IN")}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1.5">
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {option.totalDuration}
              </span>
              <span className="inline-flex items-center gap-1">
                <Leaf className="h-3.5 w-3.5 text-success" />
                {option.carbonOffset}
              </span>
            </div>
          </div>

          {/* Segments */}
          <div className="space-y-2">
            {option.segments.map((segment, idx) => {
              const SegmentIcon = segmentIcons[segment.type];
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50 backdrop-blur-sm"
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tier.bg}`}>
                    <SegmentIcon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{segment.title}</p>
                    <p className="text-xs text-muted-foreground truncate">{segment.subtitle}</p>
                  </div>
                  <div className="text-right">
                    {segment.time && (
                      <p className="text-xs text-muted-foreground font-mono-tabular">
                        {segment.time}
                      </p>
                    )}
                    <p className="text-sm font-bold font-mono-tabular">
                      ₹{segment.price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {onBook ? (
            <div className="flex gap-2 pt-1">
              {onSave && (
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSave();
                  }}
                  aria-label={isSaved ? "Saved" : "Save trip"}
                  className={isSaved ? "border-primary text-primary" : ""}
                >
                  {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="hero"
                className="flex-1 font-semibold"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBook();
                }}
              >
                Book it
              </Button>
            </div>
          ) : (
            <Button variant={isSelected ? "hero" : "outline"} className="w-full">
              {isSelected ? "Selected" : "Select this trip"}
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
