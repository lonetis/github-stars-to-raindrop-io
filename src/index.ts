import type { SyncConfig } from "./types.js";
import { sync } from "./sync.js";
import * as log from "./logger.js";

function loadConfig(): SyncConfig {
  const ghToken = process.env.GH_TOKEN;
  const raindropToken = process.env.RAINDROP_TOKEN;
  const collectionIdRaw = process.env.RAINDROP_COLLECTION_ID;

  if (!ghToken) throw new Error("Missing GH_TOKEN");
  if (!raindropToken) throw new Error("Missing RAINDROP_TOKEN");
  if (!collectionIdRaw) throw new Error("Missing RAINDROP_COLLECTION_ID");

  const collectionId = Number(collectionIdRaw);
  if (!Number.isFinite(collectionId)) {
    throw new Error(`Invalid RAINDROP_COLLECTION_ID: ${collectionIdRaw}`);
  }

  return { ghToken, raindropToken, collectionId };
}

async function main(): Promise<void> {
  const config = loadConfig();
  await sync(config);
}

main().catch((err) => {
  log.error(err instanceof Error ? err.message : String(err));
  process.exit(1);
});
