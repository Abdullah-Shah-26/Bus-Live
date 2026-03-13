"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<any>;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!auth) {
      console.error(
        "Firebase Auth is not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars and restart the dev server.",
      );
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = () => {
    if (!auth) {
      return Promise.reject(
        new Error(
          "Firebase Auth not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.",
        ),
      );
    }
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  };

  const loginWithEmail = (email: string, password: string) => {
    if (!auth) {
      return Promise.reject(
        new Error(
          "Firebase Auth not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.",
        ),
      );
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    if (!auth) {
      throw new Error(
        "Firebase Auth not initialized. Check NEXT_PUBLIC_FIREBASE_* env vars.",
      );
    }
    await firebaseSignOut(auth);
    router.push("/login");
  };

  const value = {
    user,
    loading,
    loginWithGoogle,
    loginWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
