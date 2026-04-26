import { describe, it, expect, beforeEach, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

const mockUser = { id: "user-1", name: "Alice", email: "a@b.co" };

// useAuth mock — fixed user, no provider needed
vi.mock("@/lib/auth", () => ({
  useAuth: () => ({
    user: mockUser,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  }),
}));

// Default: localStorage path. Individual tests override via vi.doMock for the
// Supabase path.
vi.mock("@/lib/supabase", () => ({
  isSupabaseEnabled: false,
  supabase: null,
}));

import { useBookings, useSavedTrips } from "./useTripStore";
import { generateOptions, type SearchInput } from "./trips";

const search: SearchInput = {
  from: "Mumbai",
  to: "Goa",
  departDate: "2026-05-15",
  returnDate: "2026-05-18",
  travelers: 2,
};
const options = generateOptions(search);

describe("useSavedTrips (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty for a fresh user", async () => {
    const { result } = renderHook(() => useSavedTrips());
    await waitFor(() => expect(result.current.savedTrips).toEqual([]));
  });

  it("saves a trip and reports it via isSaved", async () => {
    const { result } = renderHook(() => useSavedTrips());
    await act(async () => {
      await result.current.saveTrip(search, options[0]);
    });
    expect(result.current.savedTrips).toHaveLength(1);
    expect(result.current.savedTrips[0].option.id).toBe(options[0].id);
    expect(result.current.isSaved(options[0].id)).toBe(true);
    expect(result.current.isSaved(options[1].id)).toBe(false);
  });

  it("deduplicates saves of the same option", async () => {
    const { result } = renderHook(() => useSavedTrips());
    await act(async () => {
      await result.current.saveTrip(search, options[0]);
      await result.current.saveTrip(search, options[0]);
    });
    expect(result.current.savedTrips).toHaveLength(1);
  });

  it("removes a trip", async () => {
    const { result } = renderHook(() => useSavedTrips());
    let saved: { id: string } | null = null;
    await act(async () => {
      saved = await result.current.saveTrip(search, options[0]);
    });
    expect(result.current.savedTrips).toHaveLength(1);
    await act(async () => {
      await result.current.removeSavedTrip(saved!.id);
    });
    expect(result.current.savedTrips).toHaveLength(0);
  });

  it("toggles the price alert flag", async () => {
    const { result } = renderHook(() => useSavedTrips());
    let saved: { id: string } | null = null;
    await act(async () => {
      saved = await result.current.saveTrip(search, options[0]);
    });
    expect(result.current.savedTrips[0].alertActive).toBe(true);
    await act(async () => {
      await result.current.toggleAlert(saved!.id);
    });
    expect(result.current.savedTrips[0].alertActive).toBe(false);
    await act(async () => {
      await result.current.toggleAlert(saved!.id);
    });
    expect(result.current.savedTrips[0].alertActive).toBe(true);
  });

  it("persists across remount (same user)", async () => {
    const { result, unmount } = renderHook(() => useSavedTrips());
    await act(async () => {
      await result.current.saveTrip(search, options[0]);
      await result.current.saveTrip(search, options[1]);
    });
    expect(result.current.savedTrips).toHaveLength(2);
    unmount();

    const { result: r2 } = renderHook(() => useSavedTrips());
    await waitFor(() => expect(r2.current.savedTrips).toHaveLength(2));
  });

  it("rapid successive saves don't drop entries (no stale closure)", async () => {
    const { result } = renderHook(() => useSavedTrips());
    await act(async () => {
      await Promise.all([
        result.current.saveTrip(search, options[0]),
        result.current.saveTrip(search, options[1]),
        result.current.saveTrip(search, options[2]),
      ]);
    });
    expect(result.current.savedTrips).toHaveLength(3);
  });
});

describe("useBookings (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts empty", async () => {
    const { result } = renderHook(() => useBookings());
    await waitFor(() => expect(result.current.bookings).toEqual([]));
  });

  it("creates a booking with a uuid id and human-readable code", async () => {
    const { result } = renderHook(() => useBookings());
    await act(async () => {
      await result.current.createBooking(search, options[1]);
    });
    expect(result.current.bookings).toHaveLength(1);
    const b = result.current.bookings[0];
    expect(b.id).toMatch(/^[0-9a-f]{8}-/);
    expect(b.code).toMatch(/^TG-\d{4}-[A-Z0-9]{6}$/);
    expect(b.status).toBe("confirmed");
    expect(b.totalAmount).toBe(options[1].totalPrice);
  });

  it("cancels a booking (status flips, row stays)", async () => {
    const { result } = renderHook(() => useBookings());
    let booking: { id: string } | null = null;
    await act(async () => {
      booking = await result.current.createBooking(search, options[1]);
    });
    await act(async () => {
      await result.current.cancelBooking(booking!.id);
    });
    expect(result.current.bookings).toHaveLength(1);
    expect(result.current.bookings[0].status).toBe("cancelled");
  });

  it("most recent booking is at index 0", async () => {
    const { result } = renderHook(() => useBookings());
    await act(async () => {
      await result.current.createBooking(search, options[0]);
      await result.current.createBooking(search, options[3]);
    });
    expect(result.current.bookings[0].option.labelType).toBe("luxury");
    expect(result.current.bookings[1].option.labelType).toBe("budget");
  });

  it("persists across remount", async () => {
    const { result, unmount } = renderHook(() => useBookings());
    await act(async () => {
      await result.current.createBooking(search, options[1]);
    });
    unmount();
    const { result: r2 } = renderHook(() => useBookings());
    await waitFor(() => expect(r2.current.bookings).toHaveLength(1));
  });
});
