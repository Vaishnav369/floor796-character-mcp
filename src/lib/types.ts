export type Compression = "gzip" | "none";

export type AssetKind =
  | "script"
  | "scene"
  | "image"
  | "audio"
  | "data"
  | "wasm"
  | "drawing"
  | "other";

export interface AssetRecord {
  path: string;
  cleanPath: string;
  storagePath: string;
  size: number;
  compression: Compression;
  kind: AssetKind;
  mimeType: string;
  module?: string;
  extension: string;
  sha256: string;
}

export interface CharacterKit {
  id: string;
  title: string;
  summary: string;
  aliases: string[];
  confidence: "high" | "medium" | "low";
  module?: string;
  assets: AssetRecord[];
  usageNotes: string[];
}

export interface SiteCharacter {
  id: number;
  title: string;
  date: string;
  link: string;
  animated: boolean;
  cells: string[];
  polygon: string;
  referenceAsset?: AssetRecord;
  module?: InteractiveModule;
  sceneAssets: AssetRecord[];
}

export interface AssetIndex {
  generatedAt: string;
  source: string;
  assets: AssetRecord[];
  modules: InteractiveModule[];
}

export interface InteractiveModule {
  name: string;
  pathPrefix: string;
  assets: string[];
  renderScript?: string;
  playerScript?: string;
  sceneFiles: string[];
  images: string[];
  audio: string[];
}
