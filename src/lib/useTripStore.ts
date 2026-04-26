import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";
import {
  type Booking,
  type BookingStatus,
  type SavedTrip,
  type SearchInput,
  type TripOption,
  makeBookingCode,
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

interface SavedTripRow {
  id: string;
  user_id: string;
  search: SearchInput;
  option: TripOption;
  original_price: number;
  alert_active: boolean;
  saved_at: string;
}

interface BookingRow {
  id: string;
  code: string;
  user_id: string;
  search: SearchInput;
  option: TripOption;
  status: BookingStatus;
  total_amount: number;
  booked_at: string;
}

const rowToSavedTrip = (r: SavedTripRow): SavedTrip => ({
  id: r.id,
  search: r.search,
  option: r.option,
  originalPrice: r.original_price,
  alertActive: r.alert_active,
  savedAt: r.saved_at,
});

const rowToBooking = (r: BookingRow): Booking => ({
  id: r.id,
  code: r.code,
  search: r.search,
  option: r.option,
  status: r.status,
  totalAmount: r.total_amount,
  bookedAt: r.booked_at,
});

// Keep a ref in sync with state so async mutations can read the latest value
// without depending on a captured closure (which would go stale across rapid
// successive calls).
function useStateWithRef<T>(initial: T) {
  const [state, setState] = useState<T>(initial);
  const ref = useRef<T>(initial);
  const set = useCallback((next: T) => {
    ref.current = next;
    setState(next);
  }, []);
  return [state, ref, set] as const;
}

export function useSavedTrips() {
  const { user } = useAuth();
  const [savedTrips, savedTripsRef, setSavedTrips] = useStateWithRef<SavedTrip[]>([]);

  useEffect(() => {
    if (!user) {
      setSavedTrips([]);
      return;
    }
    let cancelled = false;
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("saved_trips")
        .select("*")
        .order("saved_at", { ascending: false })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.error("Failed to load saved trips:", error.message);
            return;
          }
          setSavedTrips((data as SavedTripRow[]).map(rowToSavedTrip));
        });
    } else {
      setSavedTrips(readJSON<SavedTrip[]>(SAVED_KEY(user.id), []));
    }
    return () => {
      cancelled = true;
    };
  }, [user, setSavedTrips]);

  const persistLocal = useCallback(
    (next: SavedTrip[]) => {
      if (user && !isSupabaseEnabled) writeJSON(SAVED_KEY(user.id), next);
    },
    [user],
  );

  const isSaved = useCallback(
    (optionId: string) => savedTrips.some((t) => t.option.id === optionId),
    [savedTrips],
  );

  const saveTrip = useCallback(
    async (search: SearchInput, option: TripOption) => {
      if (!user) return null;
      if (savedTripsRef.current.some((t) => t.option.id === option.id)) return null;

      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase
          .from("saved_trips")
          .insert({
            user_id: user.id,
            search,
            option,
            original_price: option.totalPrice,
            alert_active: true,
          })
          .select()
          .single();
        if (error) {
          console.error("Failed to save trip:", error.message);
          return null;
        }
        const trip = rowToSavedTrip(data as SavedTripRow);
        setSavedTrips([trip, ...savedTripsRef.current]);
        return trip;
      }

      const trip: SavedTrip = {
        id: crypto.randomUUID(),
        search,
        option,
        originalPrice: option.totalPrice,
        alertActive: true,
        savedAt: new Date().toISOString(),
      };
      const next = [trip, ...savedTripsRef.current];
      setSavedTrips(next);
      persistLocal(next);
      return trip;
    },
    [user, savedTripsRef, setSavedTrips, persistLocal],
  );

  const removeSavedTrip = useCallback(
    async (id: string) => {
      const next = savedTripsRef.current.filter((t) => t.id !== id);
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.from("saved_trips").delete().eq("id", id);
        if (error) {
          console.error("Failed to remove saved trip:", error.message);
          return;
        }
      }
      setSavedTrips(next);
      persistLocal(next);
    },
    [savedTripsRef, setSavedTrips, persistLocal],
  );

  const toggleAlert = useCallback(
    async (id: string) => {
      const trip = savedTripsRef.current.find((t) => t.id === id);
      if (!trip) return;
      const newValue = !trip.alertActive;
      const next = savedTripsRef.current.map((t) =>
        t.id === id ? { ...t, alertActive: newValue } : t,
      );
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase
          .from("saved_trips")
          .update({ alert_active: newValue })
          .eq("id", id);
        if (error) {
          console.error("Failed to toggle alert:", error.message);
          return;
        }
      }
      setSavedTrips(next);
      persistLocal(next);
    },
    [savedTripsRef, setSavedTrips, persistLocal],
  );

  return { savedTrips, saveTrip, removeSavedTrip, toggleAlert, isSaved };
}

export function useBookings() {
  const { user } = useAuth();
  const [bookings, bookingsRef, setBookings] = useStateWithRef<Booking[]>([]);

  useEffect(() => {
    if (!user) {
      setBookings([]);
      return;
    }
    let cancelled = false;
    if (isSupabaseEnabled && supabase) {
      supabase
        .from("bookings")
        .select("*")
        .order("booked_at", { ascending: false })
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            console.error("Failed to load bookings:", error.message);
            return;
          }
          setBookings((data as BookingRow[]).map(rowToBooking));
        });
    } else {
      setBookings(readJSON<Booking[]>(BOOKINGS_KEY(user.id), []));
    }
    return () => {
      cancelled = true;
    };
  }, [user, setBookings]);

  const persistLocal = useCallback(
    (next: Booking[]) => {
      if (user && !isSupabaseEnabled) writeJSON(BOOKINGS_KEY(user.id), next);
    },
    [user],
  );

  const createBooking = useCallback(
    async (search: SearchInput, option: TripOption) => {
      if (!user) return null;

      if (isSupabaseEnabled && supabase) {
        // Retry on the (astronomically unlikely) duplicate-code race.
        for (let attempt = 0; attempt < 3; attempt++) {
          const code = makeBookingCode();
          const { data, error } = await supabase
            .from("bookings")
            .insert({
              code,
              user_id: user.id,
              search,
              option,
              status: "confirmed",
              total_amount: option.totalPrice,
            })
            .select()
            .single();
          if (!error) {
            const booking = rowToBooking(data as BookingRow);
            setBookings([booking, ...bookingsRef.current]);
            return booking;
          }
          if (error.code !== "23505") {
            console.error("Failed to create booking:", error.message);
            return null;
          }
        }
        console.error("Failed to create booking: code collisions exhausted retries");
        return null;
      }

      const booking: Booking = {
        id: crypto.randomUUID(),
        code: makeBookingCode(),
        search,
        option,
        status: "confirmed",
        totalAmount: option.totalPrice,
        bookedAt: new Date().toISOString(),
      };
      const next = [booking, ...bookingsRef.current];
      setBookings(next);
      persistLocal(next);
      return booking;
    },
    [user, bookingsRef, setBookings, persistLocal],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
      const next: Booking[] = bookingsRef.current.map((b) =>
        b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b,
      );
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase
          .from("bookings")
          .update({ status: "cancelled" })
          .eq("id", id);
        if (error) {
          console.error("Failed to cancel booking:", error.message);
          return;
        }
      }
      setBookings(next);
      persistLocal(next);
    },
    [bookingsRef, setBookings, persistLocal],
  );

  return { bookings, createBooking, cancelBooking };
}
