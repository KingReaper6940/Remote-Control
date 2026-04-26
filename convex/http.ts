import { httpActionGeneric, httpRouter, makeFunctionReference } from "convex/server";

const http = httpRouter();

const claimPairingCode = makeFunctionReference<"mutation">("bridge:claimPairingCode");
const pullCommand = makeFunctionReference<"mutation">("bridge:pullCommand");
const submitCommandResult = makeFunctionReference<"mutation">("bridge:submitCommandResult");

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json"
    }
  });
}

http.route({
  path: "/pair",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    try {
      const body = (await request.json()) as {
        code?: string;
        deviceName?: string;
        platforms?: ("codex" | "cursor")[];
        workspaceRoot?: string | null;
      };

      if (!body.code || !body.deviceName || !Array.isArray(body.platforms) || body.platforms.length === 0) {
        return json({ error: "code, deviceName, and at least one platform are required." }, 400);
      }

      const result = await ctx.runMutation(claimPairingCode, {
        code: body.code.trim().toUpperCase(),
        deviceName: body.deviceName.trim(),
        platforms: body.platforms,
        workspaceRoot: body.workspaceRoot ?? null
      });

      return json(result);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Unable to pair this connector." }, 500);
    }
  })
});

http.route({
  path: "/pull",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    try {
      const token = request.headers.get("x-bridge-token");
      const deviceId = request.headers.get("x-device-id");

      if (!token || !deviceId) {
        return json({ error: "Missing bridge credentials." }, 401);
      }

      const command = await ctx.runMutation(pullCommand, {
        token,
        deviceId
      });

      return json({ deviceId, command });
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Unable to fetch work for this bridge." }, 500);
    }
  })
});

http.route({
  path: "/results",
  method: "POST",
  handler: httpActionGeneric(async (ctx, request) => {
    try {
      const token = request.headers.get("x-bridge-token");
      const deviceId = request.headers.get("x-device-id");

      if (!token || !deviceId) {
        return json({ error: "Missing bridge credentials." }, 401);
      }

      const body = (await request.json()) as {
        commandId?: string;
        status?: "completed" | "failed";
        resultSummary?: string | null;
        output?: string | null;
      };

      if (!body.commandId) {
        return json({ error: "commandId is required." }, 400);
      }

      const result = await ctx.runMutation(submitCommandResult, {
        token,
        deviceId,
        commandId: body.commandId,
        status: body.status === "failed" ? "failed" : "completed",
        resultSummary: body.resultSummary ?? null,
        output: body.output ?? null
      });

      return json(result);
    } catch (error) {
      return json({ error: error instanceof Error ? error.message : "Unable to save the command result." }, 500);
    }
  })
});

export default http;
