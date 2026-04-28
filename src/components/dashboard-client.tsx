"use client";

import { useDeferredValue, useState } from "react";
import { useUser } from "@clerk/nextjs";
import {
  useConvexAuth,
  useConvexConnectionState,
  useMutation,
  useQuery,
} from "convex/react";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Cpu,
  KeyRound,
  Loader2,
  RefreshCw,
  Send,
  Sparkles,
  Terminal,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react";

import { convexApi } from "@/lib/convex-api";
import { publicConvexSiteUrl } from "@/lib/env";
import type { BootstrapResponse, DevicePlatform } from "@/lib/types";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import {
  EmptyState,
  Panel,
  PanelBody,
  PanelHeader,
} from "@/components/dashboard/panel";
import {
  MobileTabBar,
  Sidebar,
  type Section,
} from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

const promptTemplates: Array<{
  label: string;
  prompt: string;
  target: DevicePlatform;
  icon: typeof Sparkles;
}> = [
  {
    label: "Bug fix",
    target: "codex",
    icon: Zap,
    prompt:
      "Investigate the bug, make the fix, run the relevant checks, and summarize what changed.",
  },
  {
    label: "UI polish",
    target: "cursor",
    icon: Sparkles,
    prompt:
      "Polish the current UI, tighten spacing and copy, and leave the screen feeling production-ready.",
  },
  {
    label: "Ship prep",
    target: "codex",
    icon: CheckCircle2,
    prompt:
      "Review the current feature for launch readiness, patch any obvious risks, and write a short release summary.",
  },
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

function formatRelative(value: string | null | undefined) {
  if (!value) return "—";
  const diff = Date.now() - new Date(value).getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  return `${Math.floor(hr / 24)}d ago`;
}

export function DashboardClient() {
  const { user } = useUser();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const connectionState = useConvexConnectionState();

  const [section, setSection] = useState<Section>("overview");
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [selectedTarget, setSelectedTarget] = useState<DevicePlatform>("codex");
  const [prompt, setPrompt] = useState("");
  const [workspaceRoot, setWorkspaceRoot] = useState("");
  const [pairingCode, setPairingCode] = useState<{
    code: string;
    expiresAt: string;
  } | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedHint, setCopiedHint] = useState<string | null>(null);

  const deferredPrompt = useDeferredValue(prompt);

  const bootstrap = useQuery(
    convexApi.dashboard.bootstrap,
    isAuthenticated ? {} : "skip"
  ) as BootstrapResponse | undefined;
  const createPairingCode = useMutation(convexApi.dashboard.createPairingCode);
  const queueCommand = useMutation(convexApi.dashboard.queueCommand);

  const devices = bootstrap?.devices ?? [];
  const commands = bootstrap?.commands ?? [];
  const effectiveSelectedDeviceId = selectedDeviceId || devices[0]?.id || "";
  const selectedDevice =
    devices.find((device) => device.id === effectiveSelectedDeviceId) ?? null;
  const effectiveSelectedTarget = selectedDevice?.platforms.includes(selectedTarget)
    ? selectedTarget
    : selectedDevice?.platforms[0] ?? "codex";
  const onlineDevices = devices.filter((d) => d.status === "online").length;
  const queuedCommands = commands.filter(
    (c) => c.status === "queued" || c.status === "running"
  ).length;
  const completedCommands = commands.filter((c) => c.status === "completed").length;

  const pairCommand = `npm run bridge:pair -- --server ${
    publicConvexSiteUrl || "https://your-deployment.convex.site"
  } --code ${pairingCode?.code ?? "AB12CD34"} --name "Studio PC" --platforms codex,cursor --workspace "C:\\Projects"`;

  async function handleCreatePairCode() {
    try {
      setError(null);
      const payload = await createPairingCode({});
      setPairingCode(payload);
    } catch (pairError) {
      setError(
        pairError instanceof Error ? pairError.message : "Unable to create a pairing code."
      );
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
        workspaceRoot: workspaceRoot || null,
      });
      setPrompt("");
      setCopiedHint("Command queued");
      window.setTimeout(
        () => setCopiedHint((c) => (c === "Command queued" ? null : c)),
        1800
      );
    } catch (commandError) {
      setError(
        commandError instanceof Error ? commandError.message : "Unable to queue the command."
      );
    } finally {
      setSending(false);
    }
  }

  async function handleCopy(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedHint(label);
      window.setTimeout(
        () => setCopiedHint((current) => (current === label ? null : current)),
        1800
      );
    } catch {
      setError("Copy failed. You can still copy the text manually.");
    }
  }

  function applyTemplate(template: (typeof promptTemplates)[number]) {
    setSelectedTarget(template.target);
    setPrompt(template.prompt);
    setSection("compose");
  }

  // ---------- LOADING STATE ----------
  if (isLoading || (isAuthenticated && !bootstrap)) {
    return <DashboardLoading connectionState={connectionState} isLoading={isLoading} isAuthenticated={isAuthenticated} />;
  }

  const greetingName = user?.firstName ?? user?.fullName ?? "there";

  return (
    <div className="flex min-h-screen w-full bg-background">
      <Sidebar
        active={section}
        onChange={setSection}
        onlineDevices={onlineDevices}
        totalDevices={devices.length}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          title={sectionTitle(section)}
          subtitle={sectionSubtitle(section)}
          wsConnected={connectionState.isWebSocketConnected}
          copiedHint={copiedHint}
        />

        <main className="flex-1 px-4 pb-28 pt-6 md:px-6 lg:px-8 lg:pb-12">
          <div className="mx-auto w-full max-w-7xl space-y-6">
            {/* Greeting only on overview */}
            {section === "overview" ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-2"
              >
                <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted">
                  Cockpit
                </p>
                <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                  Welcome back, {greetingName}.
                </h2>
                <p className="max-w-xl text-sm text-muted-strong">
                  {nextStepCopy(devices.length, commands.length)}
                </p>
              </motion.div>
            ) : null}

            {/* Errors / auth notices */}
            {error ? (
              <Notice tone="danger">{error}</Notice>
            ) : null}
            {!isAuthenticated ? (
              <Notice tone="warning">
                Clerk sign-in succeeded, but Convex auth is not ready yet. Set{" "}
                <code className="rounded bg-background px-1.5 py-0.5 font-mono text-[11px]">
                  CLERK_JWT_ISSUER_DOMAIN
                </code>{" "}
                for Convex and complete the integration.
              </Notice>
            ) : null}

            {(section === "overview" || section === "devices") && (
              <KpiGrid
                devices={devices.length}
                onlineDevices={onlineDevices}
                queued={queuedCommands}
                completed={completedCommands}
                selectedDevice={selectedDevice}
                effectiveTarget={effectiveSelectedTarget}
              />
            )}

            {section === "overview" && (
              <div className="grid gap-6 lg:grid-cols-12">
                <ComposerPanel
                  className="lg:col-span-7"
                  prompt={prompt}
                  setPrompt={setPrompt}
                  workspaceRoot={workspaceRoot}
                  setWorkspaceRoot={setWorkspaceRoot}
                  onSubmit={handleSendCommand}
                  sending={sending}
                  selectedDevice={selectedDevice}
                  effectiveSelectedTarget={effectiveSelectedTarget}
                  setSelectedTarget={setSelectedTarget}
                  applyTemplate={applyTemplate}
                  isAuthenticated={isAuthenticated}
                  devicesCount={devices.length}
                  deferredPrompt={deferredPrompt}
                />
                <ActivityPanel
                  className="lg:col-span-5"
                  commands={commands}
                />
              </div>
            )}

            {section === "compose" && (
              <ComposerPanel
                prompt={prompt}
                setPrompt={setPrompt}
                workspaceRoot={workspaceRoot}
                setWorkspaceRoot={setWorkspaceRoot}
                onSubmit={handleSendCommand}
                sending={sending}
                selectedDevice={selectedDevice}
                effectiveSelectedTarget={effectiveSelectedTarget}
                setSelectedTarget={setSelectedTarget}
                applyTemplate={applyTemplate}
                isAuthenticated={isAuthenticated}
                devicesCount={devices.length}
                deferredPrompt={deferredPrompt}
              />
            )}

            {section === "devices" && (
              <DevicesPanel
                devices={devices}
                selectedDeviceId={effectiveSelectedDeviceId}
                onSelectDevice={(id, platform) => {
                  setSelectedDeviceId(id);
                  setSelectedTarget(platform);
                }}
              />
            )}

            {section === "activity" && (
              <ActivityPanel commands={commands} />
            )}

            {section === "pairing" && (
              <PairPanel
                pairingCode={pairingCode}
                onCreatePairCode={handleCreatePairCode}
                pairCommand={pairCommand}
                onCopy={handleCopy}
              />
            )}

            {section === "settings" && <SettingsPanel user={user} connectionState={connectionState} />}
          </div>
        </main>
      </div>

      <MobileTabBar active={section} onChange={setSection} />
    </div>
  );
}

/* -------------------------- Helpers -------------------------- */

function sectionTitle(section: Section) {
  return {
    overview: "Overview",
    compose: "Compose",
    devices: "Devices",
    activity: "Activity",
    pairing: "Pair a connector",
    settings: "Settings",
  }[section];
}

function sectionSubtitle(section: Section) {
  return {
    overview: "Your remote control cockpit at a glance",
    compose: "Write a task, route it to the right tool",
    devices: "Connected machines and their state",
    activity: "Live stream of remote work",
    pairing: "Bind a personal machine to this account",
    settings: "Account, connection, and preferences",
  }[section];
}

function nextStepCopy(devices: number, commands: number) {
  if (devices === 0)
    return "Pair your first desktop to unlock remote routing.";
  if (commands === 0)
    return "Send your first remote task to prove the loop works.";
  return "Keep routing work from anywhere. Activity is streaming live.";
}

/* -------------------------- KPI Grid -------------------------- */

function KpiGrid({
  devices,
  onlineDevices,
  queued,
  completed,
  selectedDevice,
  effectiveTarget,
}: {
  devices: number;
  onlineDevices: number;
  queued: number;
  completed: number;
  selectedDevice: BootstrapResponse["devices"][number] | null;
  effectiveTarget: DevicePlatform;
}) {
  const kpis = [
    {
      label: "Connected desktops",
      value: devices,
      sub: `${onlineDevices} online now`,
      icon: Cpu,
      tone: "default" as const,
    },
    {
      label: "Active queue",
      value: queued,
      sub: `${completed} completed recently`,
      icon: Clock,
      tone: "info" as const,
    },
    {
      label: "Active route",
      value: selectedDevice ? selectedDevice.name : "—",
      sub: selectedDevice
        ? `${effectiveTarget} · ${selectedDevice.platforms.join(" + ")}`
        : "Pair your first machine",
      icon: Zap,
      tone: "accent" as const,
    },
    {
      label: "Last heartbeat",
      value: selectedDevice?.lastSeenAt
        ? formatRelative(selectedDevice.lastSeenAt)
        : "—",
      sub: selectedDevice?.workspaceRoot ?? "Using device default",
      icon: Activity,
      tone: "success" as const,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {kpis.map((kpi, idx) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.45,
            delay: idx * 0.06,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-4 transition-colors duration-300 hover:border-border-strong"
        >
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] font-medium uppercase tracking-[0.12em] text-muted">
              {kpi.label}
            </span>
            <kpi.icon className="h-3.5 w-3.5 text-muted" />
          </div>
          <div className="mt-3 truncate text-2xl font-semibold tracking-tight md:text-3xl">
            {kpi.value}
          </div>
          <div className="mt-1 truncate text-xs text-muted">{kpi.sub}</div>
          <div
            className={cn(
              "pointer-events-none absolute -bottom-10 -right-10 h-24 w-24 rounded-full blur-2xl",
              kpi.tone === "accent"
                ? "bg-accent/20"
                : kpi.tone === "info"
                  ? "bg-info/15"
                  : kpi.tone === "success"
                    ? "bg-success/15"
                    : "bg-foreground/5"
            )}
          />
        </motion.div>
      ))}
    </div>
  );
}

/* -------------------------- Composer -------------------------- */

function ComposerPanel({
  className,
  prompt,
  setPrompt,
  workspaceRoot,
  setWorkspaceRoot,
  onSubmit,
  sending,
  selectedDevice,
  effectiveSelectedTarget,
  setSelectedTarget,
  applyTemplate,
  isAuthenticated,
  devicesCount,
  deferredPrompt,
}: {
  className?: string;
  prompt: string;
  setPrompt: (v: string) => void;
  workspaceRoot: string;
  setWorkspaceRoot: (v: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  sending: boolean;
  selectedDevice: BootstrapResponse["devices"][number] | null;
  effectiveSelectedTarget: DevicePlatform;
  setSelectedTarget: (t: DevicePlatform) => void;
  applyTemplate: (t: (typeof promptTemplates)[number]) => void;
  isAuthenticated: boolean;
  devicesCount: number;
  deferredPrompt: string;
}) {
  const platforms = selectedDevice?.platforms ?? (["codex", "cursor"] as DevicePlatform[]);

  return (
    <Panel className={className}>
      <PanelHeader
        title="Queue remote work"
        description="Write the task once, choose the right tool, and let your desktop bridge run it."
      />
      <PanelBody className="space-y-5">
        <div className="flex flex-wrap gap-2">
          {promptTemplates.map((template) => (
            <button
              key={template.label}
              type="button"
              onClick={() => applyTemplate(template)}
              className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-3 py-1.5 text-xs text-muted-strong transition-all hover:border-border-strong hover:bg-surface hover:text-foreground"
            >
              <template.icon className="h-3 w-3 text-muted group-hover:text-accent" />
              {template.label}
            </button>
          ))}
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Target platform</Label>
              <Select
                value={effectiveSelectedTarget}
                onChange={(e) =>
                  setSelectedTarget(e.target.value as DevicePlatform)
                }
              >
                {platforms.map((platform) => (
                  <option key={platform} value={platform}>
                    {platform}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Workspace override</Label>
              <Input
                placeholder="Optional path on the connected desktop"
                value={workspaceRoot}
                onChange={(e) => setWorkspaceRoot(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prompt</Label>
            <Textarea
              placeholder="Ship the login polish, run the checks, and tell me exactly what changed."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={7}
            />
          </div>

          <div className="flex flex-col items-stretch gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted">
              {selectedDevice
                ? `Routing to ${selectedDevice.name} · ${effectiveSelectedTarget}`
                : "Pair a machine before queuing."}
            </p>
            <Button
              variant="primary"
              size="md"
              type="submit"
              disabled={
                sending ||
                !prompt.trim() ||
                devicesCount === 0 ||
                !isAuthenticated
              }
            >
              {sending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Queueing
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Queue command
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="rounded-xl border border-border bg-background/40 p-4">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.12em] text-muted">
            <Terminal className="h-3.5 w-3.5" />
            Prompt preview
          </div>
          <p className="mt-2 text-pretty text-sm leading-relaxed text-muted-strong">
            {deferredPrompt.trim() ||
              "Your prompt preview will appear here as you type."}
          </p>
        </div>
      </PanelBody>
    </Panel>
  );
}

/* -------------------------- Devices Panel -------------------------- */

function DevicesPanel({
  devices,
  selectedDeviceId,
  onSelectDevice,
}: {
  devices: BootstrapResponse["devices"];
  selectedDeviceId: string;
  onSelectDevice: (id: string, platform: DevicePlatform) => void;
}) {
  return (
    <Panel>
      <PanelHeader
        title="Connected machines"
        description="Choose the device that should receive new work and inspect its live status."
      />
      <PanelBody>
        {devices.length === 0 ? (
          <EmptyState
            title="No devices yet"
            description="Pair your first desktop in the Pairing tab to unlock routing."
            icon={<Cpu className="h-4 w-4" />}
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {devices.map((device) => {
              const isActive = selectedDeviceId === device.id;
              const online = device.status === "online";
              return (
                <button
                  type="button"
                  key={device.id}
                  onClick={() =>
                    onSelectDevice(device.id, device.platforms[0] ?? "codex")
                  }
                  className={cn(
                    "group relative overflow-hidden rounded-xl border bg-background/40 p-4 text-left transition-all duration-200",
                    isActive
                      ? "border-accent/50 ring-2 ring-accent/20"
                      : "border-border hover:border-border-strong"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface-elevated text-muted-strong">
                        <Cpu className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold">{device.name}</div>
                        <div className="text-xs text-muted">
                          {device.platforms.join(" + ") || "No platforms"}
                        </div>
                      </div>
                    </div>
                    <Badge tone={online ? "success" : "warning"} dot>
                      {device.status}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-1 text-xs text-muted">
                    <div className="flex items-center justify-between">
                      <span>Last seen</span>
                      <span className="text-muted-strong">
                        {formatRelative(device.lastSeenAt)}
                      </span>
                    </div>
                    {device.workspaceRoot ? (
                      <div className="flex items-center justify-between">
                        <span>Workspace</span>
                        <span className="truncate font-mono text-muted-strong">
                          {device.workspaceRoot}
                        </span>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="text-muted">
                      {isActive ? "Active route" : "Tap to route here"}
                    </span>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </PanelBody>
    </Panel>
  );
}

/* -------------------------- Activity -------------------------- */

function ActivityPanel({
  className,
  commands,
}: {
  className?: string;
  commands: BootstrapResponse["commands"];
}) {
  return (
    <Panel className={className}>
      <PanelHeader
        title="Recent activity"
        description="Live stream of what your remote connectors received and completed."
      />
      <PanelBody>
        {commands.length === 0 ? (
          <EmptyState
            title="Nothing routed yet"
            description="Queue your first prompt to start the activity stream."
            icon={<Activity className="h-4 w-4" />}
          />
        ) : (
          <ul className="space-y-2">
            {commands.map((command, idx) => {
              const tone =
                command.status === "completed"
                  ? "success"
                  : command.status === "failed"
                    ? "danger"
                    : command.status === "running"
                      ? "info"
                      : "warning";
              return (
                <motion.li
                  key={command.id}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.35,
                    delay: idx * 0.04,
                    ease: "easeOut",
                  }}
                  className="rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-border-strong"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-md border border-border bg-surface-elevated px-2 py-0.5 font-mono text-[10px] uppercase text-muted-strong">
                          {command.target}
                        </span>
                        <span className="text-muted">·</span>
                        <span className="text-muted">
                          device {command.deviceId.slice(0, 8)}
                        </span>
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm text-muted-strong">
                        {command.prompt}
                      </p>
                    </div>
                    <Badge tone={tone} dot>
                      {command.status}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-[11px] text-muted">
                    <Clock className="h-3 w-3" />
                    queued {formatRelative(command.createdAt)}
                  </div>
                  {command.resultSummary ? (
                    <div className="mt-3 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted-strong">
                      {command.resultSummary}
                    </div>
                  ) : null}
                </motion.li>
              );
            })}
          </ul>
        )}
      </PanelBody>
    </Panel>
  );
}

/* -------------------------- Pair Panel -------------------------- */

function PairPanel({
  pairingCode,
  onCreatePairCode,
  pairCommand,
  onCopy,
}: {
  pairingCode: { code: string; expiresAt: string } | null;
  onCreatePairCode: () => void;
  pairCommand: string;
  onCopy: (text: string, label: string) => void;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel className="lg:col-span-7">
        <PanelHeader
          title="Pair a desktop connector"
          description="Generate the one-time code, then bind a personal machine to this account."
          actions={
            <Button
              variant={pairingCode ? "secondary" : "primary"}
              size="sm"
              type="button"
              onClick={onCreatePairCode}
            >
              {pairingCode ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh code
                </>
              ) : (
                <>
                  <KeyRound className="h-3.5 w-3.5" />
                  Create code
                </>
              )}
            </Button>
          }
        />
        <PanelBody className="space-y-5">
          {pairingCode ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl border border-accent/30 bg-accent-soft p-6"
            >
              <div className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-accent">
                Pairing code
              </div>
              <div className="mt-3 font-mono text-4xl font-semibold tracking-[0.18em] text-foreground md:text-5xl">
                {pairingCode.code}
              </div>
              <div className="mt-3 text-xs text-muted">
                Expires {formatDate(pairingCode.expiresAt)}
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  type="button"
                  onClick={() => onCopy(pairingCode.code, "Pairing code copied")}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy code
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => onCopy(pairCommand, "Bridge command copied")}
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copy full command
                </Button>
              </div>
              <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-accent/20 blur-3xl" />
            </motion.div>
          ) : (
            <EmptyState
              title="No active pairing code"
              description="Generate one when you are ready to connect a machine."
              icon={<KeyRound className="h-4 w-4" />}
            />
          )}

          <div>
            <div className="mb-2 flex items-center gap-2 text-[0.7rem] uppercase tracking-[0.12em] text-muted">
              <Terminal className="h-3.5 w-3.5" />
              Bridge command
            </div>
            <pre className="scrollbar-thin overflow-x-auto rounded-xl border border-border bg-background/60 p-4 font-mono text-[12px] leading-relaxed text-muted-strong">
              {pairCommand}
            </pre>
          </div>

          <p className="text-xs text-muted">
            The connector binds a user-owned machine to this account, so each
            person controls their own Codex and Cursor setup.
          </p>
        </PanelBody>
      </Panel>

      <Panel className="lg:col-span-5">
        <PanelHeader
          title="How pairing works"
          description="Short-lived codes, user-owned machines, and a calm setup flow."
        />
        <PanelBody>
          <ol className="space-y-4">
            {[
              {
                title: "Generate a pairing code",
                body: "Tied to your account and only valid for a short window.",
              },
              {
                title: "Run the bridge command",
                body: "On the desktop you want to control. The connector authenticates and stays online.",
              },
              {
                title: "Send work from anywhere",
                body: "Once the device shows up here, queue tasks from any phone or browser.",
              },
            ].map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <div className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-strong bg-surface-elevated font-mono text-xs text-muted-strong">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div>
                  <div className="text-sm font-medium">{step.title}</div>
                  <p className="mt-1 text-xs text-muted-strong">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </PanelBody>
      </Panel>
    </div>
  );
}

/* -------------------------- Settings Panel -------------------------- */

function SettingsPanel({
  user,
  connectionState,
}: {
  user: ReturnType<typeof useUser>["user"];
  connectionState: ReturnType<typeof useConvexConnectionState>;
}) {
  const items = [
    {
      label: "Account email",
      value: user?.primaryEmailAddress?.emailAddress ?? "—",
    },
    {
      label: "Display name",
      value: user?.fullName ?? "—",
    },
    {
      label: "User ID",
      value: user?.id ? `${user.id.slice(0, 14)}…` : "—",
    },
    {
      label: "Convex websocket",
      value: connectionState.isWebSocketConnected ? "Connected" : "Connecting",
    },
    {
      label: "Ever connected",
      value: connectionState.hasEverConnected ? "Yes" : "No",
    },
    {
      label: "Connection retries",
      value: String(connectionState.connectionRetries ?? 0),
    },
  ];
  return (
    <Panel>
      <PanelHeader
        title="Account & connection"
        description="Quick reference for your identity and live link to Convex."
      />
      <PanelBody>
        <dl className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="bg-background/40 p-4">
              <dt className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">
                {item.label}
              </dt>
              <dd className="mt-1.5 truncate text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>
      </PanelBody>
    </Panel>
  );
}

/* -------------------------- Notice -------------------------- */

function Notice({
  tone,
  children,
}: {
  tone: "danger" | "warning" | "info";
  children: React.ReactNode;
}) {
  const styles = {
    danger: "border-danger/30 bg-danger-soft text-danger",
    warning: "border-warning/30 bg-warning-soft text-warning",
    info: "border-info/30 bg-info-soft text-info",
  }[tone];
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm", styles)}>
      {children}
    </div>
  );
}

/* -------------------------- Loading -------------------------- */

function DashboardLoading({
  connectionState,
  isLoading,
  isAuthenticated,
}: {
  connectionState: ReturnType<typeof useConvexConnectionState>;
  isLoading: boolean;
  isAuthenticated: boolean;
}) {
  return (
    <div className="grid min-h-screen place-items-center px-6">
      <Panel className="w-full max-w-xl text-center">
        <PanelBody className="space-y-5 py-10">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-surface-elevated">
            <Loader2 className="h-5 w-5 animate-spin text-accent" />
          </div>
          <div>
            <p className="text-[0.72rem] font-medium uppercase tracking-[0.16em] text-muted">
              Connecting workspace
            </p>
            <h1 className="mt-3 text-balance text-2xl font-semibold tracking-tight md:text-3xl">
              Loading your remote control cockpit.
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-muted-strong">
              Syncing your identity, Convex connection, and the desktop devices
              tied to this account.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2 pt-2 text-xs text-muted">
            <DiagPill
              icon={isLoading ? Loader2 : isAuthenticated ? CheckCircle2 : Clock}
              label={`Auth: ${isLoading ? "checking" : isAuthenticated ? "ready" : "idle"}`}
              spin={isLoading}
            />
            <DiagPill
              icon={connectionState.isWebSocketConnected ? Wifi : WifiOff}
              label={
                connectionState.isWebSocketConnected ? "WebSocket connected" : "WebSocket connecting"
              }
            />
            <DiagPill
              icon={Activity}
              label={`Retries: ${connectionState.connectionRetries}`}
            />
          </div>
        </PanelBody>
      </Panel>
    </div>
  );
}

function DiagPill({
  icon: Icon,
  label,
  spin,
}: {
  icon: typeof Activity;
  label: string;
  spin?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-elevated px-2.5 py-1">
      <Icon className={cn("h-3 w-3", spin ? "animate-spin" : "")} />
      {label}
    </span>
  );
}
