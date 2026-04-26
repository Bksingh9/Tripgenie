import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
  signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthState {
  currentUserId: string | null;
  accounts: StoredAccount[];
}

const emptyState: AuthState = { currentUserId: null, accounts: [] };

function readState(): AuthState {
  if (typeof window === "undefined") return emptyState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState;
    const parsed = JSON.parse(raw) as Partial<AuthState>;
    return {
      currentUserId: parsed.currentUserId ?? null,
      accounts: Array.isArray(parsed.accounts) ? parsed.accounts : [],
    };
  } catch {
    return emptyState;
  }
}

function writeState(state: AuthState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Lightweight obfuscation only — this app has no real backend. Do not treat as
// secure password storage.
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

function toUser({ id, name, email }: StoredAccount): AuthUser {
  return { id, name, email };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(emptyState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setState(readState());
    setLoading(false);
  }, []);

  const persist = useCallback((next: AuthState) => {
    setState(next);
    writeState(next);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const trimmedName = name.trim();
      const normalizedEmail = email.trim().toLowerCase();
      if (!trimmedName) throw new Error("Please enter your name");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        throw new Error("Please enter a valid email address");
      }
      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }
      const current = readState();
      if (current.accounts.some((a) => a.email === normalizedEmail)) {
        throw new Error("An account with this email already exists");
      }
      const account: StoredAccount = {
        id: crypto.randomUUID(),
        name: trimmedName,
        email: normalizedEmail,
        passwordHash: await hashPassword(password),
      };
      const next: AuthState = {
        currentUserId: account.id,
        accounts: [...current.accounts, account],
      };
      persist(next);
      return toUser(account);
    },
    [persist],
  );

  const signIn = useCallback(
    async (email: string, password: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail || !password) {
        throw new Error("Email and password are required");
      }
      const current = readState();
      const account = current.accounts.find((a) => a.email === normalizedEmail);
      const passwordHash = await hashPassword(password);
      if (!account || account.passwordHash !== passwordHash) {
        throw new Error("Invalid email or password");
      }
      persist({ ...current, currentUserId: account.id });
      return toUser(account);
    },
    [persist],
  );

  const signOut = useCallback(() => {
    const current = readState();
    persist({ ...current, currentUserId: null });
  }, [persist]);

  const user = useMemo<AuthUser | null>(() => {
    if (!state.currentUserId) return null;
    const account = state.accounts.find((a) => a.id === state.currentUserId);
    return account ? toUser(account) : null;
  }, [state]);

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
