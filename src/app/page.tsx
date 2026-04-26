import type { Route } from "next";
import Link from "next/link";

export default function Home() {
  return (
    <main className="hero-shell">
      <section className="hero-card">
        <span className="eyebrow">Remote Control Cloud</span>
        <h1>Run your desktop AI workflow from your phone.</h1>
        <p className="lede">
          Remote Control is the product surface for people who want their own Codex and Cursor setup reachable from
          anywhere, with Clerk-powered accounts, Convex-backed state, and mobile-first control.
        </p>

        <div className="hero-actions">
          <Link className="primary-button" href={"/signin" as Route}>
            Launch dashboard
          </Link>
          <a className="ghost-button" href="#product">
            See the product shape
          </a>
        </div>
      </section>

      <section className="feature-grid" id="product">
        <article className="feature-card">
          <h2>Account-based access</h2>
          <p>Clerk handles sign-in, sessions, and identity while keeping the product auth flow polished from day one.</p>
        </article>
        <article className="feature-card">
          <h2>Paired desktop connectors</h2>
          <p>Each user connects a local machine with a short-lived pairing code and gets a secure bridge token.</p>
        </article>
        <article className="feature-card">
          <h2>Command routing</h2>
          <p>Prompts are queued per account in Convex, delivered to the correct device, and reported back live.</p>
        </article>
        <article className="feature-card">
          <h2>Extensible adapters</h2>
          <p>Codex can run immediately through the CLI today, while Cursor can start in handoff mode and deepen later.</p>
        </article>
      </section>
    </main>
  );
}
