export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          home_city: string | null;
          avatar_url: string | null;
          subscription_tier: "free" | "pro" | "premium";
          preferred_transport: string[];
          preferences: Record<string, boolean>;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          home_city?: string | null;
          avatar_url?: string | null;
          subscription_tier?: "free" | "pro" | "premium";
          preferred_transport?: string[];
          preferences?: Record<string, boolean>;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          destination: string;
          origin: string;
          start_date: string;
          end_date: string;
          original_price: number;
          current_price: number;
          price_change: number;
          image_url: string;
          alert_active: boolean;
          status: "saved" | "booked" | "completed" | "cancelled";
          trip_data: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          destination: string;
          origin: string;
          start_date: string;
          end_date: string;
          original_price: number;
          current_price: number;
          price_change?: number;
          image_url?: string;
          alert_active?: boolean;
          status?: "saved" | "booked" | "completed" | "cancelled";
          trip_data?: Record<string, unknown> | null;
        };
        Update: Partial<Database["public"]["Tables"]["trips"]["Insert"]>;
      };
      bookings: {
        Row: {
          id: string;
          user_id: string;
          booking_ref: string;
          destination: string;
          origin: string;
          dates: string;
          status: "confirmed" | "completed" | "pending" | "cancelled";
          total_amount: number;
          segments: BookingSegment[];
          booked_on: string;
          trip_id: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          booking_ref: string;
          destination: string;
          origin: string;
          dates: string;
          status?: "confirmed" | "completed" | "pending" | "cancelled";
          total_amount: number;
          segments?: BookingSegment[];
          booked_on?: string;
          trip_id?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Insert"]>;
      };
    };
  };
}

export interface BookingSegment {
  type: "flight" | "hotel" | "train" | "bus" | "cab";
  title: string;
  time: string;
}
