import { NextResponse } from "next/server";

import { requireUserId } from "@/lib/auth";
import { hasFirebaseAdminEnv } from "@/lib/firebase/admin";
import { createCommand } from "@/lib/store";
import type { DevicePlatform } from "@/lib/types";

function isPlatform(value: unknown): value is DevicePlatform {
  return value === "codex" || value === "cursor";
}

export async function POST(request: Request) {
  if (!hasFirebaseAdminEnv) {
    return NextResponse.json({ error: "Firebase admin credentials are missing." }, { status: 503 });
  }

  try {
    const decoded = await requireUserId(request);
    const body = await request.json();
    const deviceId = typeof body.deviceId === "string" ? body.deviceId.trim() : "";
    const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
    const target = body.target;
    const workspaceRoot = typeof body.workspaceRoot === "string" ? body.workspaceRoot.trim() : "";

    if (!deviceId || !prompt || !isPlatform(target)) {
      return NextResponse.json({ error: "deviceId, target, and prompt are required." }, { status: 400 });
    }

    const commandId = await createCommand({
      ownerId: decoded.uid,
      deviceId,
      target,
      prompt,
      workspaceRoot: workspaceRoot || null
    });

    return NextResponse.json({ commandId });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unable to queue the command."
      },
      { status: 500 }
    );
  }
}
