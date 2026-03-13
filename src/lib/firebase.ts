import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getDatabase, type Database } from "firebase/database";

function assertRequiredClientEnv(config: Record<string, string | undefined>) {
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(
      `Missing required env var(s): ${missing.join(", ")}. ` +
        "Add them to your .env/.env.local (must be NEXT_PUBLIC_* to be available in the browser), then restart dev server / rebuild Docker image.",
    );
  }
}

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Database | undefined;

if (typeof window !== "undefined") {
  try {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DB_URL,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    };

    assertRequiredClientEnv({
      NEXT_PUBLIC_FIREBASE_API_KEY: firebaseConfig.apiKey,
      NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: firebaseConfig.authDomain,
      NEXT_PUBLIC_FIREBASE_DB_URL: firebaseConfig.databaseURL,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: firebaseConfig.projectId,
      NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET: firebaseConfig.storageBucket,
      NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID:
        firebaseConfig.messagingSenderId,
      NEXT_PUBLIC_FIREBASE_APP_ID: firebaseConfig.appId,
    });

    if (firebaseConfig.databaseURL) {
      const hostname = new URL(firebaseConfig.databaseURL).hostname;
      if (!/firebasedatabase\.(app|com)$/.test(hostname)) {
        console.warn(
          "NEXT_PUBLIC_FIREBASE_DB_URL looks unusual:",
          firebaseConfig.databaseURL,
        );
      }
    }

    if (
      firebaseConfig.storageBucket &&
      firebaseConfig.storageBucket.includes("firebasestorage.app")
    ) {
      console.warn(
        "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET should usually be a bucket name like '<project>.appspot.com', not a 'firebasestorage.app' domain:",
        firebaseConfig.storageBucket,
      );
    }

    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getDatabase(app);
  } catch (error) {
    console.error("Firebase initialization failed:", error);
  }
}

export { app, auth, db };
