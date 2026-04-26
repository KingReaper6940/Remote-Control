"use client";

import { useDeferredValue, useEffect, useState } from "react";
import { SignOutButton, UserButton, useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

import { convexApi } from "@/lib/convex-api";
import { publicConvexSiteUrl } from "@/lib/env";
import type { BootstrapResponse, DevicePlatform } from "@/lib/types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

export function DashboardClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<DevicePlatform>("codex");
  const [prompt, setPrompt] = useState("");
  const [workspaceRoot, setWorkspaceRoot] = useState("");
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      window.location.href = "/signin";
    }
  }, [isLoaded, isSignedIn]);

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

  if (!isLoaded || isLoading || (isAuthenticated && !bootstrap)) {
    return (
      <section className="page-shell">
        <div className="panel loading-panel">Loading your remote control cockpit...</div>
      </section>
    );
  }

  if (!isSignedIn) {
    return null;
  }

  return (
    <section className="page-shell dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Remote Control Cloud</span>
          <h1>Operate your connected dev machines from anywhere.</h1>
        </div>

        <div className="topbar-actions">
          <span className="identity-pill">{user?.primaryEmailAddress?.emailAddress ?? user?.fullName ?? "Unknown user"}</span>
          <UserButton />
          <SignOutButton>
            <button className="chip" type="button">
              Sign out
            </button>
          </SignOutButton>
        </div>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

      {isLoaded && isSignedIn && !isAuthenticated ? (
        <div className="notice error">
          Clerk sign-in succeeded, but Convex auth is not ready yet. Make sure you set <code>CLERK_JWT_ISSUER_DOMAIN</code>{" "}
          for Convex and complete the Clerk + Convex integration setup.
        </div>
      ) : null}

      <div className="dashboard-grid">
        <article className="panel pair-panel">
          <div className="panel-header">
            <div>
              <h2>Pair a desktop connector</h2>
              <p>Generate a short-lived code, paste it into the connector, and bind a machine to this account.</p>
            </div>
            <button className="primary-button" onClick={handleCreatePairCode} type="button">
              Create code
            </button>
          </div>

          {pairingCode ? (
            <div className="pair-code-card">
              <span className="pair-code">{pairingCode.code}</span>
              <span>Expires {formatDate(pairingCode.expiresAt)}</span>
            </div>
          ) : (
            <div className="empty-state">No active pairing code yet.</div>
          )}

          <code className="snippet">
            {`npm run bridge:pair -- --server ${publicConvexSiteUrl || "https://your-deployment.convex.site"} --code ${pairingCode?.code ?? "AB12CD34"} --name "Studio PC" --platforms codex,cursor --workspace "C:\\Projects"`}
          </code>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Connected machines</h2>
              <p>Each connector becomes a routable endpoint for its owner.</p>
            </div>
          </div>

          {devices.length === 0 ? (
            <div className="empty-state">No devices yet. Pair your first machine to start routing work.</div>
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

        <article className="panel composer-panel">
          <div className="panel-header">
            <div>
              <h2>Queue remote work</h2>
              <p>Send a task from your phone and let the paired connector hand it to Codex or Cursor.</p>
            </div>
          </div>

          <form className="composer-form" onSubmit={handleSendCommand}>
            <label>
              <span>Target platform</span>
              <select
                onChange={(event) => setSelectedTarget(event.target.value as DevicePlatform)}
                value={effectiveSelectedTarget}
              >
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
                placeholder="Fix the auth redirect bug, run tests, and summarize what changed."
                rows={7}
                value={prompt}
              />
            </label>

            <button className="primary-button" disabled={sending || !prompt.trim() || devices.length === 0 || !isAuthenticated} type="submit">
              {sending ? "Queueing..." : "Queue command"}
            </button>
          </form>

          <div className="preview-card">
            <span className="eyebrow">Live preview</span>
            <p>{deferredPrompt.trim() || "Your queued prompt will preview here as you type."}</p>
          </div>
        </article>

        <article className="panel activity-panel">
          <div className="panel-header">
            <div>
              <h2>Recent activity</h2>
              <p>Track what your remote connectors have already received and completed.</p>
            </div>
          </div>

          {commands.length === 0 ? (
            <div className="empty-state">No commands have been queued yet.</div>
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
                    Device {command.deviceId.slice(0, 8)} | queued {formatDate(command.createdAt)}
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
