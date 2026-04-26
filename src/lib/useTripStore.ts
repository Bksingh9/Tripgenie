import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";
import {
  type Booking,
  type BookingStatus,
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
  search: r.search,
  option: r.option,
  status: r.status,
  totalAmount: r.total_amount,
  bookedAt: r.booked_at,
});

export function useSavedTrips() {
  const { user } = useAuth();
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);

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
  }, [user]);

  const writeLocal = useCallback(
    (next: SavedTrip[]) => {
      if (user) writeJSON(SAVED_KEY(user.id), next);
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
      if (savedTrips.some((t) => t.option.id === option.id)) return null;

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
        setSavedTrips((prev) => [trip, ...prev]);
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
      const next = [trip, ...savedTrips];
      setSavedTrips(next);
      writeLocal(next);
      return trip;
    },
    [savedTrips, user, writeLocal],
  );

  const removeSavedTrip = useCallback(
    async (id: string) => {
      if (isSupabaseEnabled && supabase) {
        const { error } = await supabase.from("saved_trips").delete().eq("id", id);
        if (error) {
          console.error("Failed to remove saved trip:", error.message);
          return;
        }
        setSavedTrips((prev) => prev.filter((t) => t.id !== id));
        return;
      }
      const next = savedTrips.filter((t) => t.id !== id);
      setSavedTrips(next);
      writeLocal(next);
    },
    [savedTrips, writeLocal],
  );

  const toggleAlert = useCallback(
    async (id: string) => {
      const trip = savedTrips.find((t) => t.id === id);
      if (!trip) return;
      const newValue = !trip.alertActive;
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
      const next = savedTrips.map((t) =>
        t.id === id ? { ...t, alertActive: newValue } : t,
      );
      setSavedTrips(next);
      if (!isSupabaseEnabled) writeLocal(next);
    },
    [savedTrips, writeLocal],
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
  }, [user]);

  const writeLocal = useCallback(
    (next: Booking[]) => {
      if (user) writeJSON(BOOKINGS_KEY(user.id), next);
    },
    [user],
  );

  const createBooking = useCallback(
    async (search: SearchInput, option: TripOption) => {
      if (!user) return null;
      const id = makeBookingId();

      if (isSupabaseEnabled && supabase) {
        const { data, error } = await supabase
          .from("bookings")
          .insert({
            id,
            user_id: user.id,
            search,
            option,
            status: "confirmed",
            total_amount: option.totalPrice,
          })
          .select()
          .single();
        if (error) {
          console.error("Failed to create booking:", error.message);
          return null;
        }
        const booking = rowToBooking(data as BookingRow);
        setBookings((prev) => [booking, ...prev]);
        return booking;
      }

      const booking: Booking = {
        id,
        search,
        option,
        status: "confirmed",
        totalAmount: option.totalPrice,
        bookedAt: new Date().toISOString(),
      };
      const next = [booking, ...bookings];
      setBookings(next);
      writeLocal(next);
      return booking;
    },
    [bookings, user, writeLocal],
  );

  const cancelBooking = useCallback(
    async (id: string) => {
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
      const next: Booking[] = bookings.map((b) =>
        b.id === id ? { ...b, status: "cancelled" as BookingStatus } : b,
      );
      setBookings(next);
      if (!isSupabaseEnabled) writeLocal(next);
    },
    [bookings, writeLocal],
  );

  return { bookings, createBooking, cancelBooking };
}
