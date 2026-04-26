import { describe, expect, it } from "vitest";
import { buildOptionsFromAmadeus } from "./search";
import type { AmadeusFlightOffer, AmadeusHotelOffer } from "./_amadeus";

const flight = (price: number, currency = "INR"): AmadeusFlightOffer => ({
  price: { grandTotal: String(price), currency },
  validatingAirlineCodes: ["AI"],
  itineraries: [
    {
      duration: "PT2H15M",
      segments: [
        {
          departure: { iataCode: "BOM", at: "2026-05-15T06:30:00" },
          arrival: { iataCode: "GOI", at: "2026-05-15T08:45:00" },
          carrierCode: "AI",
          number: "501",
        },
      ],
    },
  ],
});

const hotel = (
  price: number,
  hotelId = "RTBOM001",
  currency = "INR",
): AmadeusHotelOffer => ({
  hotel: { name: `Hotel-${hotelId}`, hotelId, cityCode: "GOI" },
  offers: [{ price: { total: String(price), currency } }],
});

describe("buildOptionsFromAmadeus", () => {
  it("returns no options when flights or hotels are empty", () => {
    expect(
      buildOptionsFromAmadeus([], [hotel(2000)], {}, "BOM", "GOI", "2026-05-15", undefined, 1),
    ).toEqual([]);
    expect(
      buildOptionsFromAmadeus([flight(5000)], [], {}, "BOM", "GOI", "2026-05-15", undefined, 1),
    ).toEqual([]);
  });

  it("produces up to four options sorted by price", () => {
    const flights = [flight(8000), flight(4000), flight(6000), flight(10000)];
    const hotels = [hotel(3000, "H1"), hotel(5000, "H2"), hotel(7000, "H3"), hotel(9000, "H4")];
    const opts = buildOptionsFromAmadeus(
      flights,
      hotels,
      { AI: "Air India" },
      "BOM",
      "GOI",
      "2026-05-15",
      "2026-05-18",
      2,
    );
    expect(opts.length).toBeGreaterThan(0);
    for (let i = 1; i < opts.length; i++) {
      expect(opts[i].totalPrice).toBeGreaterThanOrEqual(opts[i - 1].totalPrice);
    }
    expect(opts[0].labelType).toBe("budget");
  });

  it("each option's totalPrice equals the sum of its segments", () => {
    const opts = buildOptionsFromAmadeus(
      [flight(5000), flight(7000), flight(9000), flight(11000)],
      [hotel(2000, "A"), hotel(3000, "B"), hotel(4000, "C"), hotel(5000, "D")],
      { AI: "Air India" },
      "BOM",
      "GOI",
      "2026-05-15",
      "2026-05-18",
      1,
    );
    for (const opt of opts) {
      const sum = opt.segments.reduce((a, s) => a + s.price, 0);
      expect(opt.totalPrice).toBe(sum);
    }
  });

  it("skips offers in unexpected currencies (no silent currency mixing)", () => {
    const flights = [flight(5000, "USD"), flight(7000, "INR")];
    const hotels = [hotel(2000, "A", "INR"), hotel(3000, "B", "INR")];
    const opts = buildOptionsFromAmadeus(
      flights,
      hotels,
      { AI: "Air India" },
      "BOM",
      "GOI",
      "2026-05-15",
      undefined,
      1,
    );
    // The cheapest INR-priced flight is 7000; 5000 USD must be skipped.
    expect(opts.length).toBeGreaterThan(0);
    for (const opt of opts) {
      const flightSeg = opt.segments.find((s) => s.type === "flight")!;
      expect(flightSeg.price).toBe(7000);
    }
  });

  it("uses carrier name from the dictionary when available", () => {
    const opts = buildOptionsFromAmadeus(
      [flight(5000)],
      [hotel(2000)],
      { AI: "Air India" },
      "BOM",
      "GOI",
      "2026-05-15",
      undefined,
      1,
    );
    const flightSeg = opts[0].segments.find((s) => s.type === "flight")!;
    expect(flightSeg.title).toContain("Air India");
  });

  it("falls back to the carrier code when not in the dictionary", () => {
    const opts = buildOptionsFromAmadeus(
      [flight(5000)],
      [hotel(2000)],
      {},
      "BOM",
      "GOI",
      "2026-05-15",
      undefined,
      1,
    );
    const flightSeg = opts[0].segments.find((s) => s.type === "flight")!;
    expect(flightSeg.title).toContain("AI");
  });
});
