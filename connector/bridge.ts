import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

type DevicePlatform = "codex" | "cursor";

interface PairResponse {
  bridgeToken: string;
  deviceId: string;
  ownerId: string;
}

interface ConnectorConfig {
  server: string;
  bridgeToken: string;
  deviceId: string;
  ownerId: string;
  name: string;
  platforms: DevicePlatform[];
  workspaceRoot?: string | null;
}

const STATE_DIR = process.env.REMOTE_CONTROL_CONNECTOR_HOME ?? path.join(os.homedir(), "connector-state");
const STATE_PATH = path.join(STATE_DIR, "device.json");

function readArg(flag: string) {
  const index = process.argv.indexOf(flag);

  if (index === -1) {
    return null;
  }

  return process.argv[index + 1] ?? null;
}

function readPlatforms() {
  const platformsArg = readArg("--platforms") ?? "codex";

  return platformsArg
    .split(",")
    .map((value) => value.trim())
    .filter((value): value is DevicePlatform => value === "codex" || value === "cursor");
}

async function saveConfig(config: ConnectorConfig) {
  await mkdir(STATE_DIR, { recursive: true });
  await writeFile(STATE_PATH, JSON.stringify(config, null, 2), "utf8");
}

async function loadConfig() {
  const file = await readFile(STATE_PATH, "utf8");
  return JSON.parse(file) as ConnectorConfig;
}

async function postJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : `Request failed: ${response.status}`);
  }

  return payload as T;
}

async function runCodex(prompt: string, workspaceRoot?: string | null) {
  const cwd = workspaceRoot || process.cwd();

  return new Promise<{ status: "completed" | "failed"; resultSummary: string; output: string }>((resolve) => {
    const child = spawn(
      "codex",
      ["exec", "--skip-git-repo-check", "--json", "--color", "never", "-C", cwd, prompt],
      {
        cwd,
        shell: false
      }
    );

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      const output = `${stdout}\n${stderr}`.trim();

      resolve({
        status: code === 0 ? "completed" : "failed",
        resultSummary: code === 0 ? "Codex completed the remote task." : "Codex returned a non-zero exit code.",
        output
      });
    });
  });
}

async function runCursor(prompt: string, workspaceRoot?: string | null) {
  const promptDir = path.join(STATE_DIR, "cursor-prompts");
  await mkdir(promptDir, { recursive: true });

  const promptPath = path.join(promptDir, `${Date.now()}-remote-control.md`);
  const promptFile = [
    "# Remote Control Prompt",
    "",
    `Created: ${new Date().toISOString()}`,
    workspaceRoot ? `Workspace: ${workspaceRoot}` : "",
    "",
    prompt
  ]
    .filter(Boolean)
    .join("\n");

  await writeFile(promptPath, promptFile, "utf8");

  await new Promise<void>((resolve, reject) => {
    const child = spawn("cursor.exe", ["--reuse-window", promptPath], {
      cwd: workspaceRoot || process.cwd(),
      shell: false
    });

    child.on("error", reject);
    child.on("close", () => resolve());
  });

  return {
    status: "completed" as const,
    resultSummary: "Cursor prompt file was created and opened on the paired machine.",
    output: `Prompt file: ${promptPath}`
  };
}

async function executeCommand(command: {
  id: string;
  target: DevicePlatform;
  prompt: string;
  workspaceRoot?: string | null;
}) {
  if (command.target === "cursor") {
    return runCursor(command.prompt, command.workspaceRoot);
  }

  return runCodex(command.prompt, command.workspaceRoot);
}

async function pairConnector() {
  const server = readArg("--server");
  const code = readArg("--code");
  const name = readArg("--name") ?? os.hostname();
  const workspaceRoot = readArg("--workspace");
  const platforms = readPlatforms();

  if (!server || !code || platforms.length === 0) {
    throw new Error("Usage: npm run bridge:pair -- --server <url> --code <pair-code> --name <device> --platforms codex,cursor");
  }

  const response = await postJson<PairResponse>(`${server.replace(/\/$/, "")}/api/bridge/pair`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      code,
      deviceName: name,
      platforms,
      workspaceRoot
    })
  });

  const config: ConnectorConfig = {
    server,
    bridgeToken: response.bridgeToken,
    deviceId: response.deviceId,
    ownerId: response.ownerId,
    name,
    platforms,
    workspaceRoot: workspaceRoot ?? null
  };

  await saveConfig(config);
  console.log(`Paired ${name} as device ${response.deviceId}. Config saved to ${STATE_PATH}`);
}

async function runConnector() {
  const config = await loadConfig();
  console.log(`Remote Control connector active for ${config.name} (${config.deviceId}).`);

  while (true) {
    try {
      const response = await postJson<{ command: { id: string; target: DevicePlatform; prompt: string; workspaceRoot?: string | null } | null }>(
        `${config.server.replace(/\/$/, "")}/api/bridge/pull`,
        {
        method: "POST",
        headers: {
          "x-bridge-token": config.bridgeToken,
          "x-device-id": config.deviceId
        }
      }
      );

      if (!response.command) {
        await new Promise((resolve) => setTimeout(resolve, 4000));
        continue;
      }

      console.log(`Running ${response.command.target} command ${response.command.id}...`);
      const result = await executeCommand(response.command);

      await postJson(`${config.server.replace(/\/$/, "")}/api/bridge/results`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-bridge-token": config.bridgeToken,
          "x-device-id": config.deviceId
        },
        body: JSON.stringify({
          commandId: response.command.id,
          ...result
        })
      });
    } catch (error) {
      console.error(error instanceof Error ? error.message : error);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
}

async function main() {
  const subcommand = process.argv[2];

  if (subcommand === "pair") {
    await pairConnector();
    return;
  }

  await runConnector();
}

void main();
