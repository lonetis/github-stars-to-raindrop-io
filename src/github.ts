import { Octokit } from "octokit";
import type { Star } from "./types.js";
import * as log from "./logger.js";

interface StarredRepo {
  starred_at: string;
  repo: {
    html_url: string;
    full_name: string;
    description: string | null;
    language: string | null;
    topics: string[];
  };
}

export async function fetchAllStars(token: string): Promise<Star[]> {
  const octokit = new Octokit({ auth: token });

  log.group("Fetching GitHub stars");

  const all: Star[] = [];
  let page = 1;

  while (true) {
    const res = await octokit.request("GET /user/starred", {
      per_page: 100,
      page,
      headers: { accept: "application/vnd.github.star+json" },
    });

    const items = res.data as unknown as StarredRepo[];
    if (items.length === 0) break;

    for (const item of items) {
      all.push({
        url: item.repo.html_url,
        fullName: item.repo.full_name,
        description: item.repo.description ?? "",
        language: item.repo.language,
        topics: item.repo.topics ?? [],
        starredAt: item.starred_at,
      });
    }

    if (items.length < 100) break;
    page++;
  }

  log.info(`Fetched ${all.length} stars`);
  log.groupEnd();

  if (all.length === 0) {
    log.warn(
      "GitHub returned 0 stars — check that GH_TOKEN has the correct scopes",
    );
  }

  return all;
}
