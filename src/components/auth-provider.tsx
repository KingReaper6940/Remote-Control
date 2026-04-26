"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged, signOut } from "firebase/auth";

import { clientAuth, hasFirebaseClientEnv } from "@/lib/firebase/client";

interface AuthContextValue {
  ready: boolean;
  firebaseEnabled: boolean;
  user: User | null;
  getToken: () => Promise<string | null>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  ready: false,
  firebaseEnabled: false,
  user: null,
  getToken: async () => null,
  signOutUser: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(!hasFirebaseClientEnv);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (!clientAuth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(clientAuth, (nextUser) => {
      setUser(nextUser);
      setReady(true);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ready,
        firebaseEnabled: hasFirebaseClientEnv,
        user,
        getToken: async () => {
          if (!clientAuth || !clientAuth.currentUser) {
            return null;
          }

          return clientAuth.currentUser.getIdToken();
        },
        signOutUser: async () => {
          if (!clientAuth) {
            return;
          }

          await signOut(clientAuth);
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
