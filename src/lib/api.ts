import { supabase, isSupabaseConfigured } from "./supabase";
import type { Database, BookingSegment } from "./database.types";

type Trip = Database["public"]["Tables"]["trips"]["Row"];
type TripInsert = Database["public"]["Tables"]["trips"]["Insert"];
type Booking = Database["public"]["Tables"]["bookings"]["Row"];

// ── Trips ──

export async function getTrips(userId: string): Promise<Trip[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Trip[];
}

export async function saveTrip(trip: TripInsert): Promise<Trip> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const { data, error } = await supabase
    .from("trips")
    .insert(trip)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Trip;
}

export async function updateTrip(
  tripId: string,
  updates: Partial<TripInsert>
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("trips").update(updates).eq("id", tripId);
  if (error) throw new Error(error.message);
}

export async function deleteTrip(tripId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("trips").delete().eq("id", tripId);
  if (error) throw new Error(error.message);
}

// ── Bookings ──

export async function getBookings(userId: string): Promise<Booking[]> {
  if (!isSupabaseConfigured()) return [];
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as Booking[];
}

export async function createBooking(booking: {
  userId: string;
  destination: string;
  origin: string;
  dates: string;
  totalAmount: number;
  segments: BookingSegment[];
  tripId?: string;
}): Promise<Booking> {
  if (!isSupabaseConfigured()) throw new Error("Supabase not configured");
  const ref = `TG-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      user_id: booking.userId,
      booking_ref: ref,
      destination: booking.destination,
      origin: booking.origin,
      dates: booking.dates,
      total_amount: booking.totalAmount,
      segments: booking.segments,
      status: "confirmed",
      trip_id: booking.tripId ?? null,
    })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as Booking;
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "completed" | "pending" | "cancelled"
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("bookings")
    .update({ status })
    .eq("id", bookingId);
  if (error) throw new Error(error.message);
}

// ── Profile ──

export async function getProfile(userId: string) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) return null;
  return data;
}

export async function updateSubscriptionTier(
  userId: string,
  tier: "free" | "pro" | "premium"
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("profiles")
    .update({ subscription_tier: tier })
    .eq("id", userId);
  if (error) throw new Error(error.message);
}
