"use client";

import { useEffect, useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import { clientAuth } from "@/lib/firebase/client";

export function SignInForm() {
  const router = useRouter();
  const { firebaseEnabled, user } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!clientAuth) {
      setError("Firebase is not configured yet.");
      return;
    }

    setPending(true);
    setError(null);

    try {
      if (mode === "signup") {
        const credential = await createUserWithEmailAndPassword(clientAuth, email, password);

        if (name.trim()) {
          await updateProfile(credential.user, {
            displayName: name.trim()
          });
        }
      } else {
        await signInWithEmailAndPassword(clientAuth, email, password);
      }

      router.push("/dashboard");
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Authentication failed.");
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="hero-shell">
      <div className="hero-card form-card">
        <span className="eyebrow">Remote Control Cloud</span>
        <h1>Sign in to your remote build cockpit.</h1>
        <p className="lede">
          Connect your own machines, queue work for Codex or Cursor, and keep shipping when you are nowhere near
          your desk.
        </p>

        {!firebaseEnabled ? (
          <div className="notice error">
            Add your Firebase web config to <code>.env.local</code> before sign-in can work.
          </div>
        ) : null}

        <div className="toggle-row">
          <button className={mode === "signin" ? "chip active" : "chip"} onClick={() => setMode("signin")} type="button">
            Sign in
          </button>
          <button className={mode === "signup" ? "chip active" : "chip"} onClick={() => setMode("signup")} type="button">
            Create account
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <label>
              <span>Name</span>
              <input onChange={(event) => setName(event.target.value)} placeholder="Ada Lovelace" value={name} />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@remotecontrol.dev"
              type="email"
              value={email}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="At least 6 characters"
              type="password"
              value={password}
            />
          </label>

          {error ? <div className="notice error">{error}</div> : null}

          <button className="primary-button" disabled={!firebaseEnabled || pending} type="submit">
            {pending ? "Working..." : mode === "signin" ? "Enter dashboard" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}
