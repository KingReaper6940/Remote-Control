import { createHash } from "crypto";

import { getAdminAuthClient, getAdminDb, hasFirebaseAdminEnv } from "@/lib/firebase/admin";

function unauthorized(message: string) {
  return new Response(JSON.stringify({ error: message }), {
    status: 401,
    headers: {
      "content-type": "application/json"
    }
  });
}

export async function requireUserId(request: Request) {
  if (!hasFirebaseAdminEnv) {
    throw new Error("Firebase admin credentials are not configured.");
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    throw unauthorized("Missing bearer token.");
  }

  try {
    const decoded = await getAdminAuthClient().verifyIdToken(token);
    return decoded;
  } catch {
    throw unauthorized("Invalid bearer token.");
  }
}

export async function requireBridgeSession(request: Request) {
  if (!hasFirebaseAdminEnv) {
    throw new Error("Firebase admin credentials are not configured.");
  }

  const token = request.headers.get("x-bridge-token");
  const deviceId = request.headers.get("x-device-id");

  if (!token || !deviceId) {
    throw unauthorized("Missing bridge credentials.");
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const tokenDoc = await getAdminDb().collection("bridgeTokens").doc(tokenHash).get();

  if (!tokenDoc.exists) {
    throw unauthorized("Unknown bridge token.");
  }

  const bridgeRecord = tokenDoc.data();

  if (!bridgeRecord || bridgeRecord.deviceId !== deviceId) {
    throw unauthorized("Bridge credentials do not match this device.");
  }

  return {
    ownerId: bridgeRecord.ownerId as string,
    deviceId
  };
}
