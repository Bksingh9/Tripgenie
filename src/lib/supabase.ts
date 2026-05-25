import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const DEFAULT_URL = "https://kvngtrxdpfpoukwqzbyw.supabase.co";
const DEFAULT_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2bmd0cnhkcGZwb3Vrd3F6Ynl3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MjY2NzgsImV4cCI6MjA5NTIwMjY3OH0.BbCC_PIgWnhE1qBwjHNscd7GCp21hjWpxgodAZT2CL0";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () =>
  !!supabaseUrl && !supabaseUrl.includes("placeholder");
