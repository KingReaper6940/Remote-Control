import { queryGeneric, mutationGeneric } from "convex/server";
import { v } from "convex/values";

function nowIso() {
  return new Date().toISOString();
}

function makePairingCode() {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("").toUpperCase();
}

async function requireIdentity(ctx: { auth: { getUserIdentity: () => Promise<Record<string, unknown> | null> } }) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity || typeof identity.subject !== "string") {
    throw new Error("You must be signed in.");
  }

  return {
    ownerId: identity.subject,
    email: typeof identity.email === "string" ? identity.email : null,
    displayName:
      typeof identity.name === "string"
        ? identity.name
        : typeof identity.given_name === "string"
          ? identity.given_name
          : null
  };
}

export const bootstrap = queryGeneric({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const [devices, commands] = await Promise.all([
      ctx.db.query("devices").withIndex("by_owner", (query: any) => query.eq("ownerId", identity.ownerId)).collect(),
      ctx.db.query("commands").withIndex("by_owner", (query: any) => query.eq("ownerId", identity.ownerId)).collect()
    ]);

    return {
      profile: {
        uid: identity.ownerId,
        email: identity.email,
        displayName: identity.displayName
      },
      devices: devices
        .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
        .map((device) => ({
          id: String(device._id),
          name: device.name,
          ownerId: device.ownerId,
          platforms: device.platforms,
          status: device.status,
          lastSeenAt: device.lastSeenAt,
          createdAt: device.createdAt,
          updatedAt: device.updatedAt,
          workspaceRoot: device.workspaceRoot ?? null
        })),
      commands: commands
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
        .slice(0, 20)
        .map((command) => ({
          id: String(command._id),
          ownerId: command.ownerId,
          deviceId: command.deviceId,
          target: command.target,
          prompt: command.prompt,
          status: command.status,
          createdAt: command.createdAt,
          updatedAt: command.updatedAt,
          startedAt: command.startedAt ?? null,
          completedAt: command.completedAt ?? null,
          resultSummary: command.resultSummary ?? null,
          output: command.output ?? null,
          workspaceRoot: command.workspaceRoot ?? null
        })),
      stackConfigured: true
    };
  }
});

export const createPairingCode = mutationGeneric({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = makePairingCode();
      const existing = await ctx.db.query("pairingCodes").withIndex("by_code", (query: any) => query.eq("code", code)).first();

      if (existing) {
        continue;
      }

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      const createdAt = nowIso();

      await ctx.db.insert("pairingCodes", {
        code,
        ownerId: identity.ownerId,
        expiresAt,
        createdAt,
        usedAt: null,
        deviceId: null
      });

      return { code, expiresAt };
    }

    throw new Error("Unable to create a unique pairing code.");
  }
});

export const queueCommand = mutationGeneric({
  args: {
    deviceId: v.string(),
    target: v.union(v.literal("codex"), v.literal("cursor")),
    prompt: v.string(),
    workspaceRoot: v.optional(v.union(v.string(), v.null()))
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const normalizedDeviceId = ctx.db.normalizeId("devices", args.deviceId);

    if (!normalizedDeviceId) {
      throw new Error("That device does not exist.");
    }

    const device = await ctx.db.get(normalizedDeviceId);

    if (!device || device.ownerId !== identity.ownerId) {
      throw new Error("That device does not belong to you.");
    }

    if (!device.platforms.includes(args.target)) {
      throw new Error(`That device is not connected for ${args.target}.`);
    }

    const timestamp = nowIso();
    const commandId = await ctx.db.insert("commands", {
      ownerId: identity.ownerId,
      deviceId: args.deviceId,
      target: args.target,
      prompt: args.prompt.trim(),
      status: "queued",
      workspaceRoot: args.workspaceRoot ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
      startedAt: null,
      completedAt: null,
      resultSummary: null,
      output: null
    });

    return { commandId: String(commandId) };
  }
});
