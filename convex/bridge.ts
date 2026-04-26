import { mutationGeneric } from "convex/server";
import { v } from "convex/values";

function nowIso() {
  return new Date().toISOString();
}

function randomToken() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

async function requireBridgeSession(
  ctx: any,
  token: string,
  deviceId: string
) {
  const bridgeToken = await ctx.db.query("bridgeTokens").withIndex("by_token", (query: any) => query.eq("token", token)).first();

  if (!bridgeToken || bridgeToken.deviceId !== deviceId) {
    throw new Error("Invalid bridge credentials.");
  }

  const normalizedDeviceId = ctx.db.normalizeId("devices", deviceId);

  if (!normalizedDeviceId) {
    throw new Error("That device is no longer available.");
  }

  const device = await ctx.db.get(normalizedDeviceId);

  if (!device || device.ownerId !== bridgeToken.ownerId) {
    throw new Error("That device is no longer available.");
  }

  return {
    bridgeToken,
    device,
    deviceDocId: normalizedDeviceId
  };
}

export const claimPairingCode = mutationGeneric({
  args: {
    code: v.string(),
    deviceName: v.string(),
    platforms: v.array(v.union(v.literal("codex"), v.literal("cursor"))),
    workspaceRoot: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const pairing = await ctx.db.query("pairingCodes").withIndex("by_code", (query: any) => query.eq("code", args.code)).first();

    if (!pairing) {
      throw new Error("That pairing code does not exist.");
    }

    if (pairing.usedAt) {
      throw new Error("That pairing code has already been used.");
    }

    if (new Date(pairing.expiresAt).getTime() < Date.now()) {
      throw new Error("That pairing code has expired.");
    }

    const timestamp = nowIso();
    const deviceId = await ctx.db.insert("devices", {
      ownerId: pairing.ownerId,
      name: args.deviceName.trim(),
      platforms: args.platforms,
      status: "online",
      lastSeenAt: timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      workspaceRoot: args.workspaceRoot ?? null
    });
    const bridgeToken = randomToken();

    await ctx.db.insert("bridgeTokens", {
      token: bridgeToken,
      ownerId: pairing.ownerId,
      deviceId: String(deviceId),
      createdAt: timestamp
    });

    await ctx.db.patch(pairing._id, {
      usedAt: timestamp,
      deviceId: String(deviceId)
    });

    return {
      bridgeToken,
      deviceId: String(deviceId),
      ownerId: pairing.ownerId
    };
  }
});

export const pullCommand = mutationGeneric({
  args: {
    token: v.string(),
    deviceId: v.string()
  },
  handler: async (ctx, args) => {
    const session = await requireBridgeSession(ctx, args.token, args.deviceId);
    const timestamp = nowIso();

    await ctx.db.patch(session.deviceDocId, {
      status: "online",
      lastSeenAt: timestamp,
      updatedAt: timestamp
    });

    const queuedCommands = await ctx.db
      .query("commands")
      .withIndex("by_device_status_created", (query: any) => query.eq("deviceId", args.deviceId).eq("status", "queued"))
      .collect();

    const nextCommand = queuedCommands.sort((left, right) => left.createdAt.localeCompare(right.createdAt))[0];

    if (!nextCommand) {
      return null;
    }

    await ctx.db.patch(nextCommand._id, {
      status: "running",
      startedAt: timestamp,
      updatedAt: timestamp
    });

    return {
      id: String(nextCommand._id),
      deviceId: nextCommand.deviceId,
      target: nextCommand.target,
      prompt: nextCommand.prompt,
      workspaceRoot: nextCommand.workspaceRoot ?? null
    };
  }
});

export const submitCommandResult = mutationGeneric({
  args: {
    token: v.string(),
    deviceId: v.string(),
    commandId: v.string(),
    status: v.union(v.literal("completed"), v.literal("failed")),
    resultSummary: v.optional(v.union(v.string(), v.null())),
    output: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const session = await requireBridgeSession(ctx, args.token, args.deviceId);
    const commandDocId = ctx.db.normalizeId("commands", args.commandId);

    if (!commandDocId) {
      throw new Error("That command does not exist.");
    }

    const command = await ctx.db.get(commandDocId);

    if (!command || command.ownerId !== session.bridgeToken.ownerId || command.deviceId !== session.bridgeToken.deviceId) {
      throw new Error("That command does not belong to this device.");
    }

    const timestamp = nowIso();

    await ctx.db.patch(commandDocId, {
      status: args.status,
      resultSummary: args.resultSummary ?? null,
      output: args.output ? args.output.slice(0, 12000) : null,
      completedAt: timestamp,
      updatedAt: timestamp
    });

    await ctx.db.patch(session.deviceDocId, {
      status: "online",
      lastSeenAt: timestamp,
      updatedAt: timestamp
    });

    return { ok: true };
  }
});
