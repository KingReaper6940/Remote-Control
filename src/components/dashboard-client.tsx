"use client";

import { startTransition, useCallback, useDeferredValue, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/components/auth-provider";
import type { BootstrapResponse, CommandRecord, DevicePlatform, DeviceRecord } from "@/lib/types";

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "Never";
  }

  return new Date(value).toLocaleString();
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Request failed.");
  }

  return payload as T;
}

export function DashboardClient() {
  const router = useRouter();
  const { ready, user, firebaseEnabled, getToken, signOutUser } = useAuth();
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [commands, setCommands] = useState<CommandRecord[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<DevicePlatform>("codex");
  const [prompt, setPrompt] = useState("");
  const [workspaceRoot, setWorkspaceRoot] = useState("");
  const [pairingCode, setPairingCode] = useState<{ code: string; expiresAt: string } | null>(null);
  const [loading, setLoading] = useState(firebaseEnabled);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const deferredPrompt = useDeferredValue(prompt);

  const refreshDashboard = useCallback(async () => {
    if (!user) {
      return;
    }

    const token = await getToken();

    if (!token) {
      return;
    }

    const response = await fetch("/api/bootstrap", {
      headers: {
        authorization: `Bearer ${token}`
      }
    });

    const payload = await readJson<BootstrapResponse>(response);

    startTransition(() => {
      setDevices(payload.devices);
      setCommands(payload.commands);
      setSelectedDeviceId((current) => {
        if (current && payload.devices.some((device) => device.id === current)) {
          return current;
        }

        return payload.devices[0]?.id ?? "";
      });
      setSelectedTarget((current) => {
        const defaultDevice = payload.devices.find((device) => device.id === selectedDeviceId) ?? payload.devices[0];

        if (defaultDevice?.platforms.includes(current)) {
          return current;
        }

        return defaultDevice?.platforms[0] ?? "codex";
      });
    });
  }, [getToken, selectedDeviceId, user]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!firebaseEnabled) {
      return;
    }

    if (!user) {
      router.replace("/signin");
      return;
    }

    let cancelled = false;

    async function boot() {
      try {
        await refreshDashboard();
      } catch (bootstrapError) {
        if (!cancelled) {
          setError(bootstrapError instanceof Error ? bootstrapError.message : "Unable to load the dashboard.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void boot();

    const interval = window.setInterval(() => {
      void refreshDashboard();
    }, 5000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [firebaseEnabled, ready, refreshDashboard, router, user]);

  async function callAuthedApi<T>(path: string, init?: RequestInit): Promise<T> {
    const token = await getToken();

    if (!token) {
      throw new Error("You are no longer signed in.");
    }

    const response = await fetch(path, {
      ...init,
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${token}`,
        ...(init?.headers ?? {})
      }
    });

    return readJson<T>(response);
  }

  async function handleCreatePairCode() {
    try {
      setError(null);
      const payload = await callAuthedApi<{
        code: string;
        expiresAt: string;
      }>("/api/pairing-codes", { method: "POST" });
      setPairingCode(payload);
    } catch (pairError) {
      setError(pairError instanceof Error ? pairError.message : "Unable to create a pairing code.");
    }
  }

  async function handleSendCommand(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedDeviceId) {
      setError("Connect a machine before sending commands.");
      return;
    }

    setSending(true);
    setError(null);

    try {
      await callAuthedApi("/api/commands", {
        method: "POST",
        body: JSON.stringify({
          deviceId: selectedDeviceId,
          target: selectedTarget,
          prompt,
          workspaceRoot
        })
      });

      setPrompt("");
      await refreshDashboard();
    } catch (commandError) {
      setError(commandError instanceof Error ? commandError.message : "Unable to queue the command.");
    } finally {
      setSending(false);
    }
  }

  if (!firebaseEnabled) {
    return (
      <section className="page-shell">
        <div className="notice error wide-notice">
          Add both the Firebase web config and Firebase admin credentials to <code>.env.local</code> to unlock
          authentication, pairing, and command routing.
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="page-shell">
        <div className="panel loading-panel">Loading your remote control cockpit...</div>
      </section>
    );
  }

  return (
    <section className="page-shell dashboard-shell">
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Remote Control Cloud</span>
          <h1>Operate your connected dev machines from anywhere.</h1>
        </div>

        <div className="topbar-actions">
          <span className="identity-pill">{user?.email ?? "Unknown user"}</span>
          <button
            className="chip"
            onClick={async () => {
              await signOutUser();
              router.push("/signin");
            }}
            type="button"
          >
            Sign out
          </button>
        </div>
      </div>

      {error ? <div className="notice error">{error}</div> : null}

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
            {`npm run bridge:pair -- --server https://your-app.example.com --code ${pairingCode?.code ?? "AB12CD34"} --name "Studio PC" --platforms codex,cursor --workspace "C:\\Projects"`}
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
              <select onChange={(event) => setSelectedTarget(event.target.value as DevicePlatform)} value={selectedTarget}>
                {(
                  devices.find((device) => device.id === selectedDeviceId)?.platforms ?? (["codex", "cursor"] as DevicePlatform[])
                ).map((platform) => (
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

            <button className="primary-button" disabled={sending || !prompt.trim() || devices.length === 0} type="submit">
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
