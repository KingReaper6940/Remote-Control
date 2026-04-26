# Remote Control

Remote Control is a product-style web app for people who want their own desktop AI tooling reachable from anywhere. The idea is simple:

- users create an account
- users pair one or more desktop connectors to that account
- the mobile web dashboard queues prompts for a chosen machine
- the connector delivers those prompts into local tools like Codex or Cursor
- results flow back into the dashboard

This repo now contains a working MVP foundation for that product.

## What is in the MVP

- `Next.js` app with a polished landing page, sign-in flow, and mobile-first dashboard
- `Firebase Auth` on the client for account creation and sign-in
- `Firebase Admin + Firestore` on the server for pairing codes, devices, and commands
- desktop connector script that pairs via a one-time code and polls for queued work
- `Codex` adapter that runs `codex exec`
- `Cursor` handoff adapter that writes a prompt file and opens it in Cursor

## Product architecture

### Web app

- `src/app/page.tsx`
  - landing page that explains the product and routes users into auth
- `src/app/signin/page.tsx`
  - email/password sign-in and sign-up
- `src/app/dashboard/page.tsx`
  - device list, pairing, command composer, and activity feed

### API layer

- `src/app/api/bootstrap/route.ts`
  - returns the authenticated user's devices and recent commands
- `src/app/api/pairing-codes/route.ts`
  - creates a short-lived pairing code
- `src/app/api/commands/route.ts`
  - queues a command for a device
- `src/app/api/bridge/*`
  - connector pairing, polling, and result reporting

### Data model

- `users/{uid}`
  - profile info
- `users/{uid}/devices/{deviceId}`
  - connected machine metadata and online status
- `users/{uid}/commands/{commandId}`
  - queued, running, completed, or failed remote work items
- `pairingCodes/{code}`
  - short-lived pairing tokens
- `bridgeTokens/{sha256(token)}`
  - secure connector lookup records

## Firebase setup

Create a Firebase project and enable:

1. `Authentication`
   Use Email/Password sign-in.
2. `Cloud Firestore`
   Start in production or development mode.
3. `Service account`
   Generate a service account key for server-side credentials.

Add these values to `.env.local`:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

## Local development

Install dependencies:

```bash
npm install
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
npm run bridge:pair -- --server http://localhost:3000 --code AB12CD34 --name "Studio PC" --platforms codex,cursor --workspace "C:\Projects"
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

1. Deploy the Next.js app to `Vercel` or `Firebase App Hosting`
2. Keep Firestore as the system of record
3. Ship the connector as a signed desktop installer later
4. Add websockets or FCM for lower-latency delivery
5. Add billing, team workspaces, audit history, and scoped device permissions

## Near-term roadmap

The current repo is the foundation. The next product steps I would build are:

1. Firebase session cookies so dashboard auth is server-aware too
2. Firestore security rules and indexes committed to the repo
3. richer command types like `resume last session`, `attach screenshot`, and `open workspace`
4. streaming logs instead of polling snapshots
5. packaged desktop connector with auto-update and tray UI
