import { NextResponse } from "next/server";

import { requireBridgeSession } from "@/lib/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { completeCommand, markDeviceOnline } from "@/lib/store";

export async function POST(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json({ error: "Firebase admin credentials are missing." }, { status: 503 });
  }

  try {
    const bridge = await requireBridgeSession(request);
    const body = await request.json();
    const commandId = typeof body.commandId === "string" ? body.commandId.trim() : "";
    const status = body.status === "failed" ? "failed" : "completed";
    const resultSummary = typeof body.resultSummary === "string" ? body.resultSummary : null;
    const output = typeof body.output === "string" ? body.output : null;

    if (!commandId) {
      return NextResponse.json({ error: "commandId is required." }, { status: 400 });
    }

    await Promise.all([
      completeCommand({
        ownerId: bridge.ownerId,
        commandId,
        status,
        resultSummary,
        output
      }),
      markDeviceOnline(bridge.ownerId, bridge.deviceId)
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to save the command result."
      },
      { status: 500 }
    );
  }
}
