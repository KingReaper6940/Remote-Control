import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const platformValidator = v.union(v.literal("codex"), v.literal("cursor"));
const statusValidator = v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed"));

export default defineSchema({
  devices: defineTable({
    ownerId: v.string(),
    name: v.string(),
    platforms: v.array(platformValidator),
    status: v.union(v.literal("online"), v.literal("offline")),
    lastSeenAt: v.union(v.string(), v.null()),
    createdAt: v.string(),
    updatedAt: v.string(),
    workspaceRoot: v.optional(v.union(v.string(), v.null()))
  }).index("by_owner", ["ownerId"]),
  commands: defineTable({
    ownerId: v.string(),
    deviceId: v.string(),
    target: platformValidator,
    prompt: v.string(),
    status: statusValidator,
    createdAt: v.string(),
    updatedAt: v.string(),
    startedAt: v.optional(v.union(v.string(), v.null())),
    completedAt: v.optional(v.union(v.string(), v.null())),
    resultSummary: v.optional(v.union(v.string(), v.null())),
    output: v.optional(v.union(v.string(), v.null())),
    workspaceRoot: v.optional(v.union(v.string(), v.null()))
  })
    .index("by_owner", ["ownerId"])
    .index("by_device_status_created", ["deviceId", "status", "createdAt"]),
  pairingCodes: defineTable({
    code: v.string(),
    ownerId: v.string(),
    expiresAt: v.string(),
    createdAt: v.string(),
    usedAt: v.optional(v.union(v.string(), v.null())),
    deviceId: v.optional(v.union(v.string(), v.null()))
  }).index("by_code", ["code"]),
  bridgeTokens: defineTable({
    token: v.string(),
    ownerId: v.string(),
    deviceId: v.string(),
    createdAt: v.string()
  }).index("by_token", ["token"])
});
