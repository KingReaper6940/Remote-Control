import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
};

export const hasFirebaseClientEnv = Object.values(firebaseClientConfig).every(Boolean);

let clientApp: FirebaseApp | null = null;

if (hasFirebaseClientEnv) {
  clientApp = getApps().length > 0 ? getApp() : initializeApp(firebaseClientConfig);
}

export { firebaseClientConfig };
export const clientFirebaseApp = clientApp;
export const clientAuth = clientApp ? getAuth(clientApp) : null;
