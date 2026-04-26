import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { isSupabaseEnabled, supabase } from "@/lib/supabase";

const STORAGE_KEY = "tripgenie.auth";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredAccount extends AuthUser {
  passwordHash: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthUser>;
  signUp: (name: string, email: string, password: string) => Promise<AuthUser>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface LocalState {
  currentUserId: string | null;
  accounts: StoredAccount[];
}

const emptyState: LocalState = { currentUserId: null, accounts: [] };

function readLocal(): LocalState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<LocalState>;
    return {
      currentUserId: parsed.currentUserId ?? null,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    };
  } catch {
    return emptyState;
  }
}

function writeLocal(state: LocalState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const data = new TextEncoder().encode(password);
    const digest = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  }
  return btoa(unescape(encodeURIComponent(password)));
}

function validate(email: string, password: string, name?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (name !== undefined && !name.trim()) throw new Error("Please enter your name");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new Error("Please enter a valid email address");
  }
  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }
  return normalizedEmail;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    if (isSupabaseEnabled && supabase) {
      supabase.auth.getSession().then(({ data }) => {
        if (cancelled) return;
        const session = data.session;
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            name:
              (session.user.user_metadata?.name as string | undefined) ??
              session.user.email ??
              "Traveler",
          });
        }
        setLoading(false);
      });
      const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email ?? "",
            name:
              (session.user.user_metadata?.name as string | undefined) ??
              session.user.email ??
              "Traveler",
          });
        } else {
          setUser(null);
        }
      });
      return () => {
        cancelled = true;
        sub.subscription.unsubscribe();
      };
    }

    const state = readLocal();
    if (state.currentUserId) {
      const account = state.accounts.find((a) => a.id === state.currentUserId);
      if (account) setUser({ id: account.id, name: account.name, email: account.email });
    }
    setLoading(false);
    return () => {
      cancelled = true;
    };
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const normalizedEmail = validate(email, password, name);
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: { data: { name: name.trim() } },
      });
      if (error) throw new Error(error.message);
      const u = data.user;
      if (!u) throw new Error("Account created — check your email to confirm");
      const next: AuthUser = {
        id: u.id,
        email: u.email ?? normalizedEmail,
        name: name.trim(),
      };
      setUser(next);
      return next;
    }
    const state = readLocal();
    if (state.accounts.some((a) => a.email === normalizedEmail)) {
      throw new Error("An account with this email already exists");
    }
    const account: StoredAccount = {
      id: crypto.randomUUID(),
      name: name.trim(),
      email: normalizedEmail,
      passwordHash: await hashPassword(password),
    };
    const nextState: LocalState = {
      currentUserId: account.id,
      accounts: [...state.accounts, account],
    };
    writeLocal(nextState);
    const next: AuthUser = { id: account.id, name: account.name, email: account.email };
    setUser(next);
    return next;
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = validate(email, password);
    if (isSupabaseEnabled && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (error) throw new Error(error.message);
      const u = data.user;
      if (!u) throw new Error("Sign-in failed");
      const next: AuthUser = {
        id: u.id,
        email: u.email ?? normalizedEmail,
        name:
          (u.user_metadata?.name as string | undefined) ?? u.email ?? "Traveler",
      };
      setUser(next);
      return next;
    }
    const state = readLocal();
    const account = state.accounts.find((a) => a.email === normalizedEmail);
    const passwordHash = await hashPassword(password);
    if (!account || account.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }
    const nextState: LocalState = { ...state, currentUserId: account.id };
    writeLocal(nextState);
    const next: AuthUser = { id: account.id, name: account.name, email: account.email };
    setUser(next);
    return next;
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseEnabled && supabase) {
      await supabase.auth.signOut();
      setUser(null);
      return;
    }
    const state = readLocal();
    const nextState: LocalState = { ...state, currentUserId: null };
    writeLocal(nextState);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
