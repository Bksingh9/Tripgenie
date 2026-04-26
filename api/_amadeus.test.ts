import { describe, expect, it } from "vitest";
import { durationFromIso, resolveIata, timeOfDay } from "./_amadeus";

describe("resolveIata", () => {
  it("resolves common Indian cities", () => {
    expect(resolveIata("Mumbai")).toBe("BOM");
    expect(resolveIata("delhi")).toBe("DEL");
    expect(resolveIata("Bengaluru")).toBe("BLR");
    expect(resolveIata("Goa")).toBe("GOI");
  });

  it("ignores casing and surrounding whitespace", () => {
    expect(resolveIata("  KOCHI  ")).toBe("COK");
    expect(resolveIata("New Delhi")).toBe("DEL");
  });

  it("passes through 3-letter IATA codes verbatim", () => {
    expect(resolveIata("BOM")).toBe("BOM");
    expect(resolveIata("dxb")).toBe("DXB");
  });

  it("returns null for unknown cities", () => {
    expect(resolveIata("Atlantis")).toBeNull();
    expect(resolveIata("")).toBeNull();
  });

  it("falls back to a primary airport for region names", () => {
    expect(resolveIata("Kerala")).toBe("COK");
  });
});

describe("durationFromIso", () => {
  it("parses hours and minutes", () => {
    expect(durationFromIso("PT2H15M")).toBe("2h 15m");
    expect(durationFromIso("PT12H45M")).toBe("12h 45m");
  });

  it("handles missing parts", () => {
    expect(durationFromIso("PT3H")).toBe("3h 0m");
    expect(durationFromIso("PT45M")).toBe("0h 45m");
  });

  it("returns the input on malformed strings (preserves info)", () => {
    expect(durationFromIso("invalid")).toBe("invalid");
  });

  it("uses an em-dash for undefined/empty", () => {
    expect(durationFromIso(undefined)).toBe("—");
    expect(durationFromIso("")).toBe("—");
  });
});

describe("timeOfDay", () => {
  it("extracts HH:MM from an ISO datetime", () => {
    expect(timeOfDay("2026-05-15T06:30:00")).toBe("06:30");
    expect(timeOfDay("2026-05-15T23:59:59+05:30")).toBe("23:59");
  });

  it("returns undefined for missing input", () => {
    expect(timeOfDay(undefined)).toBeUndefined();
  });

  it("returns undefined when the string lacks a time component", () => {
    expect(timeOfDay("2026-05-15")).toBeUndefined();
  });
});
