export interface Star {
  url: string;
  fullName: string;
  description: string;
  language: string | null;
  topics: string[];
  starredAt: string;
}

export interface Raindrop {
  _id: number;
  link: string;
  title: string;
}

export interface SyncConfig {
  ghToken: string;
  raindropToken: string;
  collectionId: number;
}
