import { makeFunctionReference } from "convex/server";

import type { BootstrapResponse, DevicePlatform } from "@/lib/types";

export const convexApi = {
  dashboard: {
    bootstrap: makeFunctionReference<"query", Record<string, never>, BootstrapResponse>("dashboard:bootstrap"),
    createPairingCode: makeFunctionReference<"mutation", Record<string, never>, { code: string; expiresAt: string }>(
      "dashboard:createPairingCode"
    ),
    queueCommand: makeFunctionReference<
      "mutation",
      {
        deviceId: string;
        target: DevicePlatform;
        prompt: string;
        workspaceRoot?: string | null;
      },
      { commandId: string }
    >("dashboard:queueCommand")
  }
};
