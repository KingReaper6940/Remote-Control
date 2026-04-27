import type { Route } from "next";
import Link from "next/link";

export default function Home() {
  return (
    <main className="hero-shell">
      <section className="hero-grid">
        <div className="hero-card hero-story-card">
          <span className="eyebrow">Remote Control Cloud</span>
          <h1>Your desktop AI stack, reachable from anywhere.</h1>
          <p className="lede">
            Sign in, pair your own machine, and route work into Codex or Cursor from your phone without losing the
            context of your real desktop setup.
          </p>

          <div className="hero-actions">
            <Link className="primary-button" href={"/signin" as Route}>
              Launch dashboard
            </Link>
            <a className="ghost-button" href="#product">
              See how it works
            </a>
          </div>

          <div className="hero-footnote">
            Trusted sessions with Clerk. Realtime machine state with Convex. Built for people who want to keep shipping
            when they are away from their desk.
          </div>
        </div>

        <aside className="panel hero-proof-card">
          <span className="mini-label">Remote session snapshot</span>
          <div className="proof-line">
            <strong>Studio MacBook Pro</strong>
            <span className="status-badge online">online</span>
          </div>
          <p>Connected for Codex + Cursor, waiting for the next task from your phone.</p>
          <div className="proof-stack">
            <div className="proof-row">
              <span>Queued task</span>
              <strong>Polish auth screen</strong>
            </div>
            <div className="proof-row">
              <span>Workspace</span>
              <strong>C:\Projects\Remote-Control</strong>
            </div>
            <div className="proof-row">
              <span>Last sync</span>
              <strong>Just now</strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="stat-row">
        <article className="metric-card">
          <span className="mini-label">One account</span>
          <strong>All your machines</strong>
          <p>Each user pairs their own desktop and keeps ownership of their workflow.</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">Mobile first</span>
          <strong>Control from anywhere</strong>
          <p>Send prompts, check activity, and steer work from a phone-friendly surface.</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">Built for trust</span>
          <strong>Clear, calm UX</strong>
          <p>Readable states, sane defaults, and product decisions that feel safe and understandable.</p>
        </article>
      </section>

      <section className="workflow-grid" id="product">
        <article className="step-card">
          <span className="step-number">01</span>
          <strong>Sign in once</strong>
          <p>Create an account and land in a dashboard that knows who owns each connected device.</p>
        </article>
        <article className="step-card">
          <span className="step-number">02</span>
          <strong>Pair your desktop</strong>
          <p>Generate a short-lived code, run the bridge command locally, and link your machine to your account.</p>
        </article>
        <article className="step-card">
          <span className="step-number">03</span>
          <strong>Keep building remotely</strong>
          <p>Queue work into your own Codex or Cursor workflow and review activity as it comes back.</p>
        </article>
      </section>

      <section className="feature-grid">
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
