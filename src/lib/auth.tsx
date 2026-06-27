import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

export interface KronosUser {
  id: string;
  name: string;
  email: string;
  role: string;
  plant: string;
  provider: string;
  avatar: string;
  loggedAt: string;
}

export interface LoginArgs {
  provider?: string;
  email?: string;
}

interface AuthCtxValue {
  user: KronosUser | null;
  loading: boolean;
  login: (args?: LoginArgs) => Promise<KronosUser>;
  logout: () => void;
}

const AuthCtx = createContext<AuthCtxValue | null>(null);

const STORAGE_KEY = "kronos_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<KronosUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        setUser(JSON.parse(raw) as KronosUser);
      }
    } catch {
      // ignore invalid JSON
    }

    setLoading(false);
  }, []);

  const login: AuthCtxValue["login"] = async ({
    provider = "sso",
    email,
  } = {}) => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const name = (email || "Harsh")
      .split("@")[0]
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());

    const user: KronosUser = {
      id: `usr_${Math.random().toString(36).slice(2, 9)}`,
      name: name || "Harsh",
      email: email || "harsh.1@adani.com",
      role: "Engineer",
      plant: "Ahmedabad",
      provider,
      avatar: (name || "HP")
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
      loggedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setUser(user);

    return user;
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthCtxValue {
  const ctx = useContext(AuthCtx);

  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return ctx;
}