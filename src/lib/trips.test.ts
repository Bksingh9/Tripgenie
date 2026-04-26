import { describe, expect, it } from "vitest";
import {
  describeSearch,
  generateOptions,
  makeBookingCode,
  type SearchInput,
} from "./trips";

const baseSearch: SearchInput = {
  from: "Mumbai",
  to: "Goa",
  departDate: "2026-05-15",
  returnDate: "2026-05-18",
  travelers: 2,
};

describe("generateOptions", () => {
  it("returns four tiers in budget→luxury order with ascending price", () => {
    const opts = generateOptions(baseSearch);
    expect(opts).toHaveLength(4);
    expect(opts.map((o) => o.labelType)).toEqual([
      "budget",
      "value",
      "comfort",
      "luxury",
    ]);
    for (let i = 1; i < opts.length; i++) {
      expect(opts[i].totalPrice).toBeGreaterThan(opts[i - 1].totalPrice);
    }
  });

  it("is deterministic for identical input", () => {
    const a = generateOptions(baseSearch);
    const b = generateOptions(baseSearch);
    expect(a.map((o) => o.id)).toEqual(b.map((o) => o.id));
    expect(a.map((o) => o.totalPrice)).toEqual(b.map((o) => o.totalPrice));
  });

  it("produces different prices for different inputs", () => {
    const goa = generateOptions(baseSearch);
    const manali = generateOptions({ ...baseSearch, to: "Manali" });
    expect(goa[1].totalPrice).not.toEqual(manali[1].totalPrice);
  });

  it("scales flight cost by traveler count", () => {
    const solo = generateOptions({ ...baseSearch, travelers: 1 });
    const four = generateOptions({ ...baseSearch, travelers: 4 });
    const soloFlight = solo[1].segments.find((s) => s.type === "flight")!.price;
    const fourFlight = four[1].segments.find((s) => s.type === "flight")!.price;
    expect(fourFlight).toBeGreaterThan(soloFlight * 3);
  });

  it("each option has flight, hotel, and cab segments summing to totalPrice", () => {
    const opts = generateOptions(baseSearch);
    for (const opt of opts) {
      const types = opt.segments.map((s) => s.type).sort();
      expect(types).toEqual(["cab", "flight", "hotel"]);
      const sum = opt.segments.reduce((a, s) => a + s.price, 0);
      expect(opt.totalPrice).toBe(sum);
    }
  });

  it("handles missing return date (treats as 2 nights)", () => {
    const opts = generateOptions({ ...baseSearch, returnDate: undefined });
    expect(opts).toHaveLength(4);
    expect(opts[0].totalPrice).toBeGreaterThan(0);
  });
});

describe("describeSearch", () => {
  it("formats route and date range", () => {
    expect(describeSearch(baseSearch)).toMatch(/Mumbai → Goa/);
    expect(describeSearch(baseSearch)).toMatch(/15 May/);
    expect(describeSearch(baseSearch)).toMatch(/18 May/);
  });

  it("handles no return date", () => {
    const out = describeSearch({ ...baseSearch, returnDate: undefined });
    expect(out).toMatch(/Mumbai → Goa/);
    expect(out).toMatch(/15 May/);
    expect(out).not.toMatch(/–/);
  });

  it("falls back gracefully when route is empty", () => {
    expect(describeSearch({ ...baseSearch, from: "", to: "" })).toMatch(/Your trip/);
  });
});

describe("makeBookingCode", () => {
  it("matches TG-YYYY-XXXXXX format with allowed alphabet", () => {
    const code = makeBookingCode();
    expect(code).toMatch(/^TG-\d{4}-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("uses the current year", () => {
    const code = makeBookingCode();
    const yr = new Date().getFullYear();
    expect(code).toMatch(new RegExp(`^TG-${yr}-`));
  });

  it("excludes ambiguous characters (I, O, 0, 1)", () => {
    for (let i = 0; i < 200; i++) {
      const suffix = makeBookingCode().split("-")[2];
      expect(suffix).not.toMatch(/[IO01]/);
    }
  });

  it("produces practically-unique codes", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) codes.add(makeBookingCode());
    expect(codes.size).toBe(1000);
  });
});
