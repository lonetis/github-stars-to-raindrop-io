import type { SyncConfig, Star, Raindrop } from "./types.js";
import { fetchAllStars } from "./github.js";
import {
  fetchAllRaindrops,
  createRaindrops,
  deleteRaindrops,
} from "./raindrop.js";
import * as log from "./logger.js";

function normalizeUrl(url: string): string {
  return url.toLowerCase().replace(/\/+$/, "");
}

export async function sync(config: SyncConfig): Promise<void> {
  const stars = await fetchAllStars(config.ghToken);
  const raindrops = await fetchAllRaindrops(
    config.collectionId,
    config.raindropToken,
  );

  const starsByUrl = new Map<string, Star>();
  for (const star of stars) {
    starsByUrl.set(normalizeUrl(star.url), star);
  }

  const raindropsByUrl = new Map<string, Raindrop>();
  for (const rd of raindrops) {
    raindropsByUrl.set(normalizeUrl(rd.link), rd);
  }

  const toCreate: Star[] = [];
  for (const [url, star] of starsByUrl) {
    if (!raindropsByUrl.has(url)) {
      toCreate.push(star);
    }
  }

  const toDeleteIds: number[] = [];
  for (const [url, rd] of raindropsByUrl) {
    if (!starsByUrl.has(url)) {
      toDeleteIds.push(rd._id);
    }
  }

  log.info(
    `\nDiff: ${toCreate.length} to create, ${toDeleteIds.length} to delete`,
  );

  if (toCreate.length > 0) {
    await createRaindrops(config.collectionId, toCreate, config.raindropToken);
  }

  if (toDeleteIds.length > 0) {
    await deleteRaindrops(
      config.collectionId,
      toDeleteIds,
      config.raindropToken,
    );
  }

  log.info("\nSync complete ✓");
}
