# Remote Control

Remote Control is a product-style web app for people who want their own desktop AI tooling reachable from anywhere. The idea is simple:

- users create an account
- users pair one or more desktop connectors to that account
- the mobile web dashboard queues prompts for a chosen machine
- the connector delivers those prompts into local tools like Codex or Cursor
- results flow back into the dashboard

This repo now contains a working MVP foundation for that product.

## What is in the MVP

- `Next.js` app with a polished landing page, Clerk auth flow, and mobile-first dashboard
- `Clerk` for authentication and account management
- `Convex` for devices, commands, pairing codes, and bridge tokens
- desktop connector script that pairs via a one-time code and polls for queued work
- `Codex` adapter that runs `codex exec`
- `Cursor` handoff adapter that writes a prompt file and opens it in Cursor

## Product architecture

### Web app

- `src/app/page.tsx`
  - landing page that explains the product and routes users into auth
- `src/app/signin/[[...sign-in]]/page.tsx`
  - Clerk-powered sign-in
- `src/app/signup/[[...sign-up]]/page.tsx`
  - Clerk-powered sign-up
- `src/app/dashboard/page.tsx`
  - device list, pairing, command composer, and activity feed

### Convex backend

- `convex/dashboard.ts`
  - authenticated queries and mutations for the dashboard
- `convex/bridge.ts`
  - device pairing, command claiming, and result submission logic
- `convex/http.ts`
  - HTTP endpoints the desktop connector can call

### Data model

- `devices`
  - connected machine metadata and online status
- `commands`
  - queued, running, completed, or failed remote work items
- `pairingCodes`
  - short-lived pairing tokens
- `bridgeTokens`
  - secure connector lookup records

## Clerk + Convex setup

Create:

1. a `Clerk` application
2. a `Convex` project

Then connect them using the Convex Clerk guide:

- [docs.convex.dev/auth/clerk](https://docs.convex.dev/auth/clerk)
- [clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CONVEX_URL=
NEXT_PUBLIC_CONVEX_SITE_URL=
CLERK_JWT_ISSUER_DOMAIN=
```

You will also need to run:

```bash
npm run convex:dev
```

That creates the Convex deployment wiring for your project and lets the backend functions go live.

## Local development

Install dependencies:

```bash
npm install
```

Start Convex in one terminal:

```bash
npm run convex:dev
```

Run the web app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Pair a machine

1. Start the web app and create an account.
2. Open the dashboard and click `Create code`.
3. Pair a desktop connector:

```bash
npm run bridge:pair -- --server https://your-deployment.convex.site --code AB12CD34 --name "Studio PC" --platforms codex,cursor --workspace "C:\Projects"
```

4. Start the connector loop:

```bash
npm run bridge
```

The connector stores its local state in `connector-state/device.json` inside the current user's home folder unless `REMOTE_CONTROL_CONNECTOR_HOME` is set.

## How the adapters behave today

### Codex

The connector executes:

```bash
codex exec --skip-git-repo-check --json --color never -C <workspace> "<prompt>"
```

That makes Codex the first real end-to-end integration in the MVP.

### Cursor

Cursor does not expose a clean, product-grade remote prompt API in this repo yet, so the MVP starts with a handoff adapter:

- it writes a prompt file into the connector state folder
- it opens that file in Cursor
- it reports the handoff back to the dashboard

This still makes Cursor pairable now, while leaving room for a richer integration later.

## Deploying this as a product

A good first production path is:

1. Deploy the Next.js app to `Vercel`
2. Keep `Convex` as the system of record
3. Ship the connector as a signed desktop installer later
4. Lean into Convex realtime subscriptions for lower-latency delivery
5. Add billing, team workspaces, audit history, and scoped device permissions

## Near-term roadmap

The current repo is the foundation. The next product steps I would build are:

1. richer dashboard views for projects, active sessions, and per-device workspaces
2. deeper Cursor integration beyond prompt-file handoff
3. richer command types like `resume last session`, `attach screenshot`, and `open workspace`
4. streaming logs instead of polling snapshots
5. packaged desktop connector with auto-update and tray UI
