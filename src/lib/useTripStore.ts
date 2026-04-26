import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  type Booking,
  type SavedTrip,
  type SearchInput,
  type TripOption,
  makeBookingId,
} from "@/lib/trips";

const SAVED_KEY = (userId: string) => `tripgenie.saved-trips.${userId}`;
const BOOKINGS_KEY = (userId: string) => `tripgenie.bookings.${userId}`;

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function useSavedTrips() {
  const { user } = useAuth();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedTrips([]);
      return;
    }
    setSavedTrips(readJSON<SavedTrip[]>(SAVED_KEY(user.id), []));
  }, [user]);

  const persist = useCallback(
    (next: SavedTrip[]) => {
      setSavedTrips(next);
      if (user) writeJSON(SAVED_KEY(user.id), next);
    },
    [user],
  );

  const isSaved = useCallback(
    (optionId: string) => savedTrips.some((t) => t.option.id === optionId),
    [savedTrips],
  );

  const saveTrip = useCallback(
    (search: SearchInput, option: TripOption) => {
      if (!user) return null;
      const existing = savedTrips.find((t) => t.option.id === option.id);
      if (existing) return existing;
      const trip: SavedTrip = {
        id: crypto.randomUUID(),
        search,
        option,
        savedAt: new Date().toISOString(),
        originalPrice: option.totalPrice,
        alertActive: true,
      };
      persist([trip, ...savedTrips]);
      return trip;
    },
    [persist, savedTrips, user],
  );

  const removeSavedTrip = useCallback(
    (id: string) => persist(savedTrips.filter((t) => t.id !== id)),
    [persist, savedTrips],
  );

  const toggleAlert = useCallback(
    (id: string) =>
      persist(
        savedTrips.map((t) =>
          t.id === id ? { ...t, alertActive: !t.alertActive } : t,
        ),
      ),
    [persist, savedTrips],
  );

  return { savedTrips, saveTrip, removeSavedTrip, toggleAlert, isSaved };
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    setBookings(readJSON<Booking[]>(BOOKINGS_KEY(user.id), []));
  }, [user]);

  const persist = useCallback(
    (next: Booking[]) => {
      setBookings(next);
      if (user) writeJSON(BOOKINGS_KEY(user.id), next);
    },
    [user],
  );

  const createBooking = useCallback(
    (search: SearchInput, option: TripOption) => {
      if (!user) return null;
      const booking: Booking = {
        id: makeBookingId(),
        search,
        option,
        status: "confirmed",
        totalAmount: option.totalPrice,
        bookedAt: new Date().toISOString(),
      };
      persist([booking, ...bookings]);
      return booking;
    },
    [persist, bookings, user],
  );

  const cancelBooking = useCallback(
    (id: string) =>
      persist(
        bookings.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
      ),
    [persist, bookings],
  );

  return { bookings, createBooking, cancelBooking };
}
