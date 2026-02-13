# GitHub Stars to Raindrop.io

A GitHub Action that syncs your starred repositories to a Raindrop.io collection. Runs hourly — new stars are added, unstarred repos are removed.

## Setup

1. Create a **dedicated** collection in Raindrop.io (any bookmark in this collection that doesn't match a star will be deleted)
2. Get a [Raindrop.io test token](https://app.raindrop.io/settings/integrations)
3. Get a [GitHub personal access token](https://github.com/settings/tokens) (no scopes needed for public stars, `read:user` for private)
4. Add these repository secrets (`Settings → Secrets and variables → Actions`):
   - `GH_TOKEN` — GitHub PAT
   - `RAINDROP_TOKEN` — Raindrop.io test token
   - `RAINDROP_COLLECTION_ID` — numeric ID of the target collection

### Finding the collection ID

Open the collection in Raindrop.io — the URL looks like `https://app.raindrop.io/my/12345678`. The number at the end is the collection ID.

## Usage

The action runs automatically every hour. To trigger it manually: `Actions → Sync GitHub Stars to Raindrop.io → Run workflow`.

For local development:

```sh
cp .env.example .env   # fill in your tokens
npm install
npm run dev
```

## Tags

Each bookmark is tagged with:
- `github-star`
- Up to 5 repository topics
