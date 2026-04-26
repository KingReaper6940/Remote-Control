import { randomBytes, randomUUID, createHash } from "crypto";

import { FieldValue, Timestamp } from "firebase-admin/firestore";

import { getAdminDb } from "@/lib/firebase/admin";
import type { BootstrapResponse, CommandRecord, DevicePlatform, DeviceRecord } from "@/lib/types";

const PAIRING_CODE_TTL_MS = 10 * 60 * 1000;

function usersCollection() {
  return getAdminDb().collection("users");
}

function userDoc(userId: string) {
  return usersCollection().doc(userId);
}

function devicesCollection(userId: string) {
  return userDoc(userId).collection("devices");
}

function commandsCollection(userId: string) {
  return userDoc(userId).collection("commands");
}

function iso(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return null;
}

function makePairingCode() {
  return randomBytes(4).toString("hex").toUpperCase();
}

function normalizePlatforms(value: unknown): DevicePlatform[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((platform): platform is DevicePlatform => platform === "codex" || platform === "cursor");
}

function mapDevice(id: string, data: FirebaseFirestore.DocumentData): DeviceRecord {
  return {
    id,
    name: String(data.name ?? "Untitled device"),
    ownerId: String(data.ownerId),
    platforms: normalizePlatforms(data.platforms),
    status: data.status === "online" ? "online" : "offline",
    lastSeenAt: iso(data.lastSeenAt),
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    workspaceRoot: typeof data.workspaceRoot === "string" ? data.workspaceRoot : null
  };
}

function mapCommand(id: string, data: FirebaseFirestore.DocumentData): CommandRecord {
  return {
    id,
    ownerId: String(data.ownerId),
    deviceId: String(data.deviceId),
    target: data.target === "cursor" ? "cursor" : "codex",
    prompt: String(data.prompt ?? ""),
    status: data.status ?? "queued",
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    startedAt: iso(data.startedAt),
    completedAt: iso(data.completedAt),
    resultSummary: typeof data.resultSummary === "string" ? data.resultSummary : null,
    output: typeof data.output === "string" ? data.output : null,
    workspaceRoot: typeof data.workspaceRoot === "string" ? data.workspaceRoot : null
  };
}

export async function upsertUserProfile(userId: string, profile: { email?: string | null; displayName?: string | null }) {
  await userDoc(userId).set(
    {
      email: profile.email ?? null,
      displayName: profile.displayName ?? null,
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function getBootstrapData(userId: string): Promise<BootstrapResponse> {
  const [profileSnapshot, devicesSnapshot, commandsSnapshot] = await Promise.all([
    userDoc(userId).get(),
    devicesCollection(userId).orderBy("updatedAt", "desc").get(),
    commandsCollection(userId).orderBy("createdAt", "desc").limit(20).get()
  ]);

  const profileData = profileSnapshot.data() ?? {};

  return {
    profile: {
      uid: userId,
      email: typeof profileData.email === "string" ? profileData.email : null,
      displayName: typeof profileData.displayName === "string" ? profileData.displayName : null
    },
    devices: devicesSnapshot.docs.map((doc) => mapDevice(doc.id, doc.data())),
    commands: commandsSnapshot.docs.map((doc) => mapCommand(doc.id, doc.data())),
    firebaseConfigured: true
  };
}

export async function createPairingCode(userId: string) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = makePairingCode();
    const ref = getAdminDb().collection("pairingCodes").doc(code);
    const existing = await ref.get();

    if (existing.exists) {
      continue;
    }

    const expiresAt = new Date(Date.now() + PAIRING_CODE_TTL_MS);

    await ref.set({
      code,
      ownerId: userId,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt
    });

    return {
      code,
      expiresAt: expiresAt.toISOString()
    };
  }

  throw new Error("Unable to create a unique pairing code.");
}

export async function claimPairingCode(input: {
  code: string;
  deviceName: string;
  platforms: DevicePlatform[];
  workspaceRoot?: string | null;
}) {
  const db = getAdminDb();
  const pairingRef = db.collection("pairingCodes").doc(input.code.trim().toUpperCase());
  const bridgeToken = randomBytes(24).toString("hex");
  const bridgeTokenHash = createHash("sha256").update(bridgeToken).digest("hex");
  const deviceId = randomUUID();

  const result = await db.runTransaction(async (transaction) => {
    const pairingSnapshot = await transaction.get(pairingRef);

    if (!pairingSnapshot.exists) {
      throw new Error("That pairing code does not exist.");
    }

    const pairingData = pairingSnapshot.data();

    if (!pairingData) {
      throw new Error("That pairing code is invalid.");
    }

    if (pairingData.usedAt) {
      throw new Error("That pairing code has already been used.");
    }

    const expiresAt = pairingData.expiresAt instanceof Timestamp ? pairingData.expiresAt.toDate() : new Date(pairingData.expiresAt);

    if (expiresAt.getTime() < Date.now()) {
      throw new Error("That pairing code has expired.");
    }

    const ownerId = String(pairingData.ownerId);
    const deviceRef = devicesCollection(ownerId).doc(deviceId);
    const bridgeRef = db.collection("bridgeTokens").doc(bridgeTokenHash);

    transaction.set(deviceRef, {
      ownerId,
      name: input.deviceName.trim(),
      platforms: input.platforms,
      workspaceRoot: input.workspaceRoot ?? null,
      status: "online",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      lastSeenAt: FieldValue.serverTimestamp()
    });

    transaction.set(bridgeRef, {
      ownerId,
      deviceId,
      createdAt: FieldValue.serverTimestamp()
    });

    transaction.update(pairingRef, {
      deviceId,
      usedAt: FieldValue.serverTimestamp()
    });

    return {
      ownerId,
      deviceId
    };
  });

  return {
    bridgeToken,
    deviceId: result.deviceId,
    ownerId: result.ownerId
  };
}

export async function createCommand(input: {
  ownerId: string;
  deviceId: string;
  target: DevicePlatform;
  prompt: string;
  workspaceRoot?: string | null;
}) {
  const deviceSnapshot = await devicesCollection(input.ownerId).doc(input.deviceId).get();

  if (!deviceSnapshot.exists) {
    throw new Error("That device does not exist.");
  }

  const deviceData = deviceSnapshot.data();
  const platforms = normalizePlatforms(deviceData?.platforms);

  if (!platforms.includes(input.target)) {
    throw new Error(`That device is not connected for ${input.target}.`);
  }

  const commandRef = commandsCollection(input.ownerId).doc();

  await commandRef.set({
    ownerId: input.ownerId,
    deviceId: input.deviceId,
    target: input.target,
    prompt: input.prompt,
    status: "queued",
    workspaceRoot: input.workspaceRoot ?? null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp()
  });

  return commandRef.id;
}

export async function markDeviceOnline(ownerId: string, deviceId: string) {
  await devicesCollection(ownerId).doc(deviceId).set(
    {
      status: "online",
      lastSeenAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}

export async function getNextQueuedCommand(ownerId: string, deviceId: string) {
  const snapshot = await commandsCollection(ownerId).where("status", "==", "queued").limit(20).get();
  const pending = snapshot.docs.find((doc) => doc.data().deviceId === deviceId);

  if (!pending) {
    return null;
  }

  await pending.ref.set(
    {
      status: "running",
      startedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  const refreshed = await pending.ref.get();

  if (!refreshed.exists) {
    return null;
  }

  return mapCommand(refreshed.id, refreshed.data() ?? {});
}

export async function completeCommand(input: {
  ownerId: string;
  commandId: string;
  status: "completed" | "failed";
  resultSummary?: string | null;
  output?: string | null;
}) {
  await commandsCollection(input.ownerId).doc(input.commandId).set(
    {
      status: input.status,
      resultSummary: input.resultSummary ?? null,
      output: input.output ? input.output.slice(0, 12000) : null,
      completedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );
}
