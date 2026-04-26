export type DevicePlatform = "codex" | "cursor";
export type CommandStatus = "queued" | "running" | "completed" | "failed";

export interface DeviceRecord {
  id: string;
  name: string;
  ownerId: string;
  platforms: DevicePlatform[];
  status: "online" | "offline";
  lastSeenAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  workspaceRoot?: string | null;
}

export interface CommandRecord {
  id: string;
  ownerId: string;
  deviceId: string;
  target: DevicePlatform;
  prompt: string;
  status: CommandStatus;
  createdAt: string | null;
  updatedAt: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  resultSummary?: string | null;
  output?: string | null;
  workspaceRoot?: string | null;
}

export interface PairingCodeRecord {
  code: string;
  ownerId: string;
  expiresAt: string;
  usedAt?: string | null;
}

export interface BootstrapResponse {
  profile: {
    uid: string;
    email: string | null;
    displayName: string | null;
  };
  devices: DeviceRecord[];
  commands: CommandRecord[];
  firebaseConfigured: boolean;
}
