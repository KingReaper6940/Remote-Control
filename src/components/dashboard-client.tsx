"use client";

import { useDeferredValue, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useConvexAuth, useConvexConnectionState, useMutation, useQuery } from "convex/react";

import { convexApi } from "@/lib/convex-api";
import { publicConvexSiteUrl } from "@/lib/env";
import type { BootstrapResponse, DevicePlatform } from "@/lib/types";

const promptTemplates: Array<{ label: string; prompt: string; target: DevicePlatform }> = [
  {
    label: "Bug fix",
    target: "codex",
    prompt: "Investigate the bug, make the fix, run the relevant checks, and summarize what changed."
  },
  {
    label: "UI polish",
    target: "cursor",
    prompt: "Polish the current UI, tighten spacing and copy, and leave the screen feeling production-ready."
  },
  {
    label: "Ship prep",
    target: "codex",
    prompt: "Review the current feature for launch readiness, patch any obvious risks, and write a short release summary."
  }
];

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

export function DashboardClient() {
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const connectionState = useConvexConnectionState();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<DevicePlatform>("codex");
  const [prompt, setPrompt] = useState("");
  const [workspaceRoot, setWorkspaceRoot] = useState("");
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);
  const deferredPrompt = useDeferredValue(prompt);
  const bootstrap = useQuery(convexApi.dashboard.bootstrap, isAuthenticated ? {} : "skip") as BootstrapResponse | undefined;
  const createPairingCode = useMutation(convexApi.dashboard.createPairingCode);
  const queueCommand = useMutation(convexApi.dashboard.queueCommand);

  const devices = bootstrap?.devices ?? [];
  const commands = bootstrap?.commands ?? [];
  const effectiveSelectedDeviceId = selectedDeviceId || devices[0]?.id || "";
  const selectedDevice = devices.find((device) => device.id === effectiveSelectedDeviceId) ?? null;
  const effectiveSelectedTarget = selectedDevice?.platforms.includes(selectedTarget)
    ? selectedTarget
    : selectedDevice?.platforms[0] ?? "codex";
  const onlineDevices = devices.filter((device) => device.status === "online").length;
  const queuedCommands = commands.filter((command) => command.status === "queued" || command.status === "running").length;
  const completedCommands = commands.filter((command) => command.status === "completed").length;
  const nextStep =
    devices.length === 0
      ? "Generate a pairing code and connect the first desktop."
      : commands.length === 0
        ? "Send the first remote task to prove the loop works."
        : "Review recent output and keep routing work from wherever you are.";
  const pairCommand = `npm run bridge:pair -- --server ${publicConvexSiteUrl || "https://your-deployment.convex.site"} --code ${
    pairingCode?.code ?? "AB12CD34"
  } --name "Studio PC" --platforms codex,cursor --workspace "C:\\Projects"`;

  async function handleCreatePairCode() {
    try {
      setError(null);
      const payload = await createPairingCode({});
      setPairingCode(payload);
    } catch (pairError) {
      setError(pairError instanceof Error ? pairError.message : "Unable to create a pairing code.");
    }
  }

  async function handleSendCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!effectiveSelectedDeviceId) {
      setError("Connect a machine before sending commands.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await queueCommand({
        deviceId: effectiveSelectedDeviceId,
        target: effectiveSelectedTarget,
        prompt,
        workspaceRoot: workspaceRoot || null
      });
      setPrompt("");
    } catch (commandError) {
      setError(commandError instanceof Error ? commandError.message : "Unable to queue the command.");
    } finally {
      setSending(false);
    }
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHint(label);
      window.setTimeout(() => {
        setCopiedHint((current) => (current === label ? null : current));
      }, 1800);
    } catch {
      setError("Copy failed. You can still copy the text manually.");
    }
  }

  function applyTemplate(template: (typeof promptTemplates)[number]) {
    setSelectedTarget(template.target);
    setPrompt(template.prompt);
  }

  if (isLoading || (isAuthenticated && !bootstrap)) {
    return (
      <section className="page-shell">
        <div className="panel loading-panel">
          <span className="eyebrow">Connecting Workspace</span>
          <h1>Loading your remote control cockpit.</h1>
          <p className="lede">Syncing your identity, Convex connection, and the desktop devices tied to this account.</p>
          <div className="loading-diagnostics">
            <span>Convex auth: {isLoading ? "checking" : isAuthenticated ? "ready" : "not ready"}</span>
            <span>Websocket: {connectionState.isWebSocketConnected ? "connected" : "connecting"}</span>
            <span>Ever connected: {connectionState.hasEverConnected ? "yes" : "no"}</span>
            <span>Retries: {connectionState.connectionRetries}</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="page-shell dashboard-shell">
      <div className="dashboard-topbar">
        <div className="dashboard-story">
          <span className="eyebrow">Remote Control Cloud</span>
          <h1>Your desktop AI workflow, reachable from anywhere.</h1>
          <p className="lede">
            Pair your machine once, then send work to Codex or Cursor from your phone without losing the context of your own
            setup.
          </p>
        </div>

        <div className="dashboard-topbar-card">
          <span className="mini-label">Signed in as</span>
          <strong>{user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? "Unknown user"}</strong>
          <p>{nextStep}</p>
          {copiedHint ? <span className="inline-feedback">{copiedHint}</span> : null}
        </div>
      </div>

      <div className="metric-strip">
        <article className="metric-card">
          <span className="mini-label">Connected desktops</span>
          <strong>{devices.length}</strong>
          <p>{onlineDevices} online right now</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">Queued work</span>
          <strong>{queuedCommands}</strong>
          <p>{completedCommands} completed recently</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">Active route</span>
          <strong>{selectedDevice ? selectedDevice.name : "No device yet"}</strong>
          <p>{selectedDevice ? `${effectiveSelectedTarget} on ${selectedDevice.platforms.join(" + ")}` : "Pair your first machine"}</p>
        </article>
        <article className="metric-card">
          <span className="mini-label">Workspace override</span>
          <strong>{selectedDevice?.workspaceRoot ?? workspaceRoot || "Using device default"}</strong>
          <p>{selectedDevice?.lastSeenAt ? `Last seen ${formatDate(selectedDevice.lastSeenAt)}` : "No machine heartbeat yet"}</p>
        </article>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

      {!isAuthenticated ? (
        <div className="notice error">
          Clerk sign-in succeeded, but Convex auth is not ready yet. Make sure you set <code>CLERK_JWT_ISSUER_DOMAIN</code>{" "}
          for Convex and complete the Clerk + Convex integration setup.
        </div>
      ) : null}

      {devices.length === 0 ? (
        <section className="panel welcome-panel">
          <div className="panel-header">
            <div>
              <h2>Start with a calm, guided setup</h2>
              <p>This first-run flow is designed so the product still feels clear on a phone, even before a machine is paired.</p>
            </div>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span className="step-number">01</span>
              <strong>Generate a pairing code</strong>
              <p>Create a short-lived code tied to this account.</p>
            </article>
            <article className="step-card">
              <span className="step-number">02</span>
              <strong>Run the bridge command</strong>
              <p>Paste the generated command on the desktop you want to control.</p>
            </article>
            <article className="step-card">
              <span className="step-number">03</span>
              <strong>Start sending work</strong>
              <p>Once the machine appears here, queue tasks from anywhere.</p>
            </article>
          </div>
        </section>
      ) : null}

      <div className="dashboard-grid">
        <article className="panel pair-panel">
          <div className="panel-header">
            <div>
              <h2>Pair a desktop connector</h2>
              <p>Generate the one-time code, then bind a personal machine to this account.</p>
            </div>
            <button className="primary-button" onClick={handleCreatePairCode} type="button">
              {pairingCode ? "Refresh code" : "Create code"}
            </button>
          </div>

          {pairingCode ? (
            <div className="pair-code-card">
              <span className="pair-code">{pairingCode.code}</span>
              <span>Expires {formatDate(pairingCode.expiresAt)}</span>
              <div className="inline-actions">
                <button className="secondary-button" onClick={() => handleCopy(pairingCode.code, "Pairing code copied")} type="button">
                  Copy code
                </button>
                <button className="ghost-button" onClick={() => handleCopy(pairCommand, "Bridge command copied")} type="button">
                  Copy full command
                </button>
              </div>
            </div>
          ) : (
            <div className="empty-state">No active pairing code yet. Generate one when you are ready to connect a machine.</div>
          )}

          <code className="snippet">{pairCommand}</code>

          <div className="support-note">
            The connector binds a user-owned machine to this account, so each person controls their own Codex and Cursor setup.
          </div>
        </article>

        <article className="panel composer-panel">
          <div className="panel-header">
            <div>
              <h2>Queue remote work</h2>
              <p>Write the task once, choose the right tool, and let the desktop bridge execute it on your machine.</p>
            </div>
          </div>

          <div className="template-row">
            {promptTemplates.map((template) => (
              <button className="chip" key={template.label} onClick={() => applyTemplate(template)} type="button">
                {template.label}
              </button>
            ))}
          </div>

          <form className="composer-form" onSubmit={handleSendCommand}>
            <label>
              <span>Target platform</span>
              <select onChange={(event) => setSelectedTarget(event.target.value as DevicePlatform)} value={effectiveSelectedTarget}>
                {(selectedDevice?.platforms ?? (["codex", "cursor"] as DevicePlatform[])).map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Workspace override</span>
              <input
                onChange={(event) => setWorkspaceRoot(event.target.value)}
                placeholder="Optional path on the connected desktop"
                value={workspaceRoot}
              />
            </label>

            <label>
              <span>Prompt</span>
              <textarea
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Ship the login polish, run the checks, and tell me exactly what changed."
                rows={7}
                value={prompt}
              />
            </label>

            <button className="primary-button" disabled={sending || !prompt.trim() || devices.length === 0 || !isAuthenticated} type="submit">
              {sending ? "Queueing..." : "Queue command"}
            </button>
          </form>

          <div className="preview-card">
            <span className="mini-label">Prompt preview</span>
            <p>{deferredPrompt.trim() || "Your prompt preview will appear here as you type."}</p>
          </div>
        </article>

        <article className="panel devices-panel">
          <div className="panel-header">
            <div>
              <h2>Connected machines</h2>
              <p>Choose the device that should receive new work and inspect its live status.</p>
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="empty-state">No devices yet. Pair your first desktop to unlock routing.</div>
          ) : (
            <div className="stack-list">
              {devices.map((device) => (
                <label className={selectedDeviceId === device.id ? "device-card active" : "device-card"} key={device.id}>
                  <input
                    checked={selectedDeviceId === device.id}
                    name="selectedDevice"
                    onChange={() => {
                      setSelectedDeviceId(device.id);
                      setSelectedTarget(device.platforms[0] ?? "codex");
                    }}
                    type="radio"
                  />
                  <div>
                    <div className="device-row">
                      <strong>{device.name}</strong>
                      <span className={device.status === "online" ? "status-badge online" : "status-badge offline"}>
                        {device.status}
                      </span>
                    </div>
                    <div className="meta-row">{device.platforms.join(" + ") || "No platforms selected"}</div>
                    <div className="meta-row">Last seen {formatDate(device.lastSeenAt)}</div>
                    {device.workspaceRoot ? <div className="meta-row">{device.workspaceRoot}</div> : null}
                  </div>
                </label>
              ))}
            </div>
          )}
        </article>

        <article className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Recent activity</h2>
              <p>Keep a tight feedback loop on what your remote connectors have already received and completed.</p>
            </div>
          </div>

          {commands.length === 0 ? (
            <div className="empty-state">No commands yet. Pair a machine and send your first prompt to start the activity stream.</div>
          ) : (
            <div className="stack-list">
              {commands.map((command) => (
                <div className="command-card" key={command.id}>
                  <div className="device-row">
                    <strong>{command.target}</strong>
                    <span className={`status-badge ${command.status}`}>{command.status}</span>
                  </div>
                  <p>{command.prompt}</p>
                  <div className="meta-row">
                    Device {command.deviceId.slice(0, 8)} · queued {formatDate(command.createdAt)}
                  </div>
                  {command.resultSummary ? <div className="result-box">{command.resultSummary}</div> : null}
                </div>
              ))}
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
