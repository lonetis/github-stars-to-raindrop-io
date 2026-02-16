import type { Raindrop, Star } from "./types.js";
import * as log from "./logger.js";

const BASE = "https://api.raindrop.io/rest/v1";
const MIN_INTERVAL_MS = 500;

let lastRequestAt = 0;

async function raindropFetch(
  path: string,
  token: string,
  init: RequestInit = {},
): Promise<Response> {
  const elapsed = Date.now() - lastRequestAt;
  if (elapsed < MIN_INTERVAL_MS) {
    await sleep(MIN_INTERVAL_MS - elapsed);
  }

  lastRequestAt = Date.now();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (res.status === 429) {
    const resetHeader = res.headers.get("X-RateLimit-Reset");
    const resetMs = resetHeader
      ? Number(resetHeader) * 1000 - Date.now()
      : 60_000;
    log.warn(`Rate limited — sleeping ${Math.ceil(resetMs / 1000)}s`);
    await sleep(Math.max(resetMs, 1000));

    lastRequestAt = Date.now();
    return fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init.headers,
      },
    });
  }

  return res;
}

export async function fetchAllRaindrops(
  collectionId: number,
  token: string,
): Promise<Raindrop[]> {
  const all: Raindrop[] = [];
  let page = 0;

  log.group("Fetching existing raindrops");

  while (true) {
    const res = await raindropFetch(
      `/raindrops/${collectionId}?perpage=50&page=${page}`,
      token,
    );
    if (!res.ok) {
      throw new Error(`Raindrop fetch failed: ${res.status} ${res.statusText}`);
    }

    const body = (await res.json()) as { items: Raindrop[] };
    if (body.items.length === 0) break;

    all.push(...body.items);
    page++;
  }

  log.info(`Fetched ${all.length} existing raindrops`);
  log.groupEnd();

  return all;
}

export async function createRaindrops(
  collectionId: number,
  stars: Star[],
  token: string,
): Promise<void> {
  log.group(`Creating ${stars.length} raindrops`);

  for (const batch of chunk(stars, 100)) {
    const items = batch.map((star) => ({
      link: star.url,
      title: star.fullName,
      excerpt: star.description,
      created: star.starredAt,
      collection: { $id: collectionId },
      tags: buildTags(star),
    }));

    const res = await raindropFetch("/raindrops", token, {
      method: "POST",
      body: JSON.stringify({ items }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Raindrop bulk create failed: ${res.status} ${text}`);
    }

    log.info(`  Created batch of ${batch.length}`);
  }

  log.groupEnd();
}

export async function deleteRaindrops(
  collectionId: number,
  ids: number[],
  token: string,
): Promise<void> {
  log.group(`Deleting ${ids.length} raindrops`);

  for (const batch of chunk(ids, 100)) {
    const res = await raindropFetch(`/raindrops/${collectionId}`, token, {
      method: "DELETE",
      body: JSON.stringify({ ids: batch }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Raindrop bulk delete failed: ${res.status} ${text}`);
    }

    log.info(`  Deleted batch of ${batch.length}`);
  }

  log.groupEnd();
}

function buildTags(_star: Star): string[] {
  return ["ghstars"];
}

function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
