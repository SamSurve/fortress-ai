"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { User } from "@/types";
import {
  authApi,
  getStoredToken,
  setStoredToken,
  getStoredUser,
  setStoredUser
} from "@/lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  signup: (name: string, email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initial hydration
    const storedToken = getStoredToken();
    const storedUser = getStoredUser();

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(storedUser);
      // Validate session with server in background
      authApi.getMe()
        .then((freshUser) => {
          setUser(freshUser);
          setStoredUser(freshUser);
        })
        .catch(() => {
          // Token expired
          setStoredToken(null);
          setStoredUser(null);
          setUser(null);
          setToken(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const res = await authApi.login(email, pass);
    setStoredToken(res.access_token);
    setStoredUser(res.user);
    setToken(res.access_token);
    setUser(res.user);

    // Route based on role
    if (res.user.role === "ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/workspace");
    }

    return res.user;
  };

  const signup = async (name: string, email: string, pass: string): Promise<User> => {
    const res = await authApi.signup(name, email, pass);
    setStoredToken(res.access_token);
    setStoredUser(res.user);
    setToken(res.access_token);
    setUser(res.user);

    router.push("/workspace");
    return res.user;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
      setStoredUser(null);
      setUser(null);
      setToken(null);
      router.push("/login");
    }
  };

  const refreshUser = async () => {
    try {
      const fresh = await authApi.getMe();
      setUser(fresh);
      setStoredUser(fresh);
    } catch (e) {
      console.error("Failed to refresh user profile", e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
