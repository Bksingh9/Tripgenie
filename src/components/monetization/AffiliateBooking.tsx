import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AffiliatePartner {
  name: string;
  logo: string;
  tagline: string;
  color: string;
  getUrl: (destination?: string) => string;
}

const affiliateId = import.meta.env.VITE_BOOKING_AFFILIATE_ID || "tripgenie";
const skyscannerAssocId = import.meta.env.VITE_SKYSCANNER_ASSOCIATE_ID || "tripgenie";
const agodaCid = import.meta.env.VITE_AGODA_CID || "tripgenie";

const partners: AffiliatePartner[] = [
  {
    name: "Booking.com",
    logo: "B",
    tagline: "Best hotel deals worldwide",
    color: "bg-blue-600",
    getUrl: (dest) =>
      `https://www.booking.com/searchresults.html?aid=${affiliateId}&ss=${encodeURIComponent(dest || "India")}&utm_source=tripgenie`,
  },
  {
    name: "Skyscanner",
    logo: "S",
    tagline: "Compare cheap flights",
    color: "bg-cyan-600",
    getUrl: (dest) =>
      `https://www.skyscanner.co.in/flights?query=${encodeURIComponent(dest || "India")}&utm_source=tripgenie`,
  },
  {
    name: "MakeMyTrip",
    logo: "M",
    tagline: "India's #1 travel platform",
    color: "bg-red-600",
    getUrl: (dest) =>
      `https://www.makemytrip.com/hotels/${encodeURIComponent((dest || "goa").toLowerCase())}-hotels/?utm_source=tripgenie&utm_medium=affiliate`,
  },
  {
    name: "Agoda",
    logo: "A",
    tagline: "Unbeatable hotel prices",
    color: "bg-purple-600",
    getUrl: (dest) =>
      `https://www.agoda.com/partners/partnersearch.aspx?cid=${agodaCid}&city=${encodeURIComponent(dest || "")}&utm_source=tripgenie`,
  },
  {
    name: "Cleartrip",
    logo: "C",
    tagline: "Flights, hotels & more",
    color: "bg-orange-600",
    getUrl: (dest) =>
      `https://www.cleartrip.com/hotels/results?city=${encodeURIComponent(dest || "goa")}&utm_source=tripgenie&utm_medium=affiliate`,
  },
];

interface AffiliateBookingProps {
  destination?: string;
  compact?: boolean;
}

export function AffiliateBooking({ destination, compact = false }: AffiliateBookingProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {partners.slice(0, 3).map((partner) => (
          <a
            key={partner.name}
            href={partner.getUrl(destination)}
            target="_blank"
            rel="noopener sponsored"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary/50 hover:bg-secondary text-sm transition-colors"
          >
            <div
              className={`h-5 w-5 rounded text-[10px] font-bold ${partner.color} text-white flex items-center justify-center`}
            >
              {partner.logo}
            </div>
            {partner.name}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </a>
        ))}
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Book with our trusted partners
          </h2>
          <p className="text-muted-foreground">
            Compare prices across top travel platforms and get the best deals
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-5xl mx-auto">
          {partners.map((partner, index) => (
            <motion.div
              key={partner.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <a
                href={partner.getUrl(destination)}
                target="_blank"
                rel="noopener sponsored"
                className="block"
              >
                <Card className="hover:border-primary/40 transition-all duration-300 cursor-pointer group h-full">
                  <CardContent className="p-4 text-center">
                    <div
                      className={`h-12 w-12 rounded-xl ${partner.color} text-white text-xl font-bold flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}
                    >
                      {partner.logo}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{partner.name}</h3>
                    <p className="text-xs text-muted-foreground mb-3">
                      {partner.tagline}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-1 text-xs"
                    >
                      View Deals
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </a>
            </motion.div>
          ))}
        </div>

        <p className="text-center text-xs text-muted-foreground/50 mt-6">
          We may earn a commission when you book through our partner links at no
          extra cost to you.
        </p>
      </div>
    </section>
  );
}

// Helper to generate affiliate link for a specific segment type
export function getAffiliateLink(
  type: "flight" | "hotel" | "train" | "bus" | "cab",
  destination?: string
): { url: string; partner: string } {
  switch (type) {
    case "flight":
      return {
        url: partners[1].getUrl(destination), // Skyscanner
        partner: "Skyscanner",
      };
    case "hotel":
      return {
        url: partners[0].getUrl(destination), // Booking.com
        partner: "Booking.com",
      };
    case "train":
    case "bus":
      return {
        url: partners[2].getUrl(destination), // MakeMyTrip
        partner: "MakeMyTrip",
      };
    case "cab":
      return {
        url: partners[4].getUrl(destination), // Cleartrip
        partner: "Cleartrip",
      };
    default:
      return {
        url: partners[0].getUrl(destination),
        partner: "Booking.com",
      };
  }
}
