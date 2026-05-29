import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { extname } from "node:path";
import type {
  AssetIndex,
  AssetKind,
  AssetRecord,
  CharacterListInclude,
  CharacterSummaryList,
  CharacterKit,
  CharacterKitSummary,
  InteractiveModule,
  PaginatedList,
  SiteCharacter,
  SiteCharacterSummary,
} from "./types.js";

const CURATED_ALIASES: Record<string, { title: string; aliases: string[]; summary: string }> = {
  naruto: {
    title: "Naruto Run Character",
    aliases: ["naruto", "anime", "ninja", "run", "running character"],
    summary: "Interactive Naruto-themed character animation with sprite and audio assets.",
  },
  jaws19: {
    title: "Jaws Shark Character",
    aliases: ["jaws", "shark", "mouth", "monster", "bite"],
    summary: "Interactive shark character with open/closed mouth images and sound.",
  },
  chuck: {
    title: "Chuck Punch Animation",
    aliases: ["chuck", "punch", "hand", "fight", "impact"],
    summary: "Punch interaction with hand/crack images and impact audio.",
  },
  meg: {
    title: "Meg Scene Character",
    aliases: ["meg", "megalodon", "shark", "creature"],
    summary: "Meg-themed scene asset packaged as Floor796 animation data.",
  },
  "where-is-waldo": {
    title: "Where Is Waldo Scene",
    aliases: ["waldo", "where is waldo", "wally", "hidden character"],
    summary: "Where's Waldo style scene asset.",
  },
  melody: {
    title: "Melody Piano Animation",
    aliases: ["melody", "piano", "music", "keyboard", "notes"],
    summary: "Interactive music module with note audio files and player logic.",
  },
  "hologram-room": {
    title: "Hologram Room Animation Set",
    aliases: ["hologram", "room", "sci fi", "character scene"],
    summary: "Multi-scene hologram animation module.",
  },
  interstellar: {
    title: "Interstellar Travel Animation",
    aliases: ["interstellar", "space", "travel", "sci fi"],
    summary: "Space travel themed animation logic.",
  },
};

export function normalizeAssetPath(path: string): string {
  return path.startsWith("/") ? path.slice(1) : path;
}

export function storagePathForAsset(path: string): string {
  return normalizeAssetPath(path).replace(/[<>:"|?*]/g, "_");
}

export function kindForPath(path: string): AssetKind {
  const clean = path.split("?")[0].toLowerCase();
  if (clean.endsWith(".js")) return "script";
  if (clean.endsWith(".f796.br")) return "scene";
  if (clean.endsWith(".f796i")) return "drawing";
  if (clean.endsWith(".json")) return "data";
  if (clean.endsWith(".wasm")) return "wasm";
  if (/\.(png|jpg|jpeg|webp|gif)$/.test(clean)) return "image";
  if (/\.(mp3|wav|ogg)$/.test(clean)) return "audio";
  return "other";
}

export function mimeTypeForPath(path: string): string {
  const clean = path.split("?")[0].toLowerCase();
  if (clean.endsWith(".js")) return "application/javascript";
  if (clean.endsWith(".json")) return "application/json";
  if (clean.endsWith(".wasm")) return "application/wasm";
  if (clean.endsWith(".png")) return "image/png";
  if (clean.endsWith(".jpg") || clean.endsWith(".jpeg")) return "image/jpeg";
  if (clean.endsWith(".webp")) return "image/webp";
  if (clean.endsWith(".mp3")) return "audio/mpeg";
  return "application/octet-stream";
}

export function moduleNameForPath(path: string): string | undefined {
  const match = normalizeAssetPath(path).match(/^interactive\/([^/]+)\//);
  return match?.[1];
}

export function toAssetRecord(path: string, compression: "gzip" | "none", data: Buffer): AssetRecord {
  const cleanPath = normalizeAssetPath(path);
  return {
    path,
    cleanPath,
    storagePath: storagePathForAsset(path),
    size: data.byteLength,
    compression,
    kind: kindForPath(path),
    mimeType: mimeTypeForPath(path),
    module: moduleNameForPath(path),
    extension: extname(path.split("?")[0]).toLowerCase(),
    sha256: createHash("sha256").update(data).digest("hex"),
  };
}

export function buildModules(assets: AssetRecord[]): InteractiveModule[] {
  const groups = new Map<string, AssetRecord[]>();
  for (const asset of assets) {
    if (!asset.module) continue;
    const group = groups.get(asset.module) ?? [];
    group.push(asset);
    groups.set(asset.module, group);
  }

  return Array.from(groups.entries())
    .map(([name, moduleAssets]) => ({
      name,
      pathPrefix: `interactive/${name}/`,
      assets: moduleAssets.map((asset) => asset.cleanPath).sort(),
      renderScript: moduleAssets.find((asset) => asset.cleanPath.endsWith("/render.js"))?.cleanPath,
      playerScript: moduleAssets.find((asset) => asset.cleanPath.endsWith("/player.js"))?.cleanPath,
      sceneFiles: moduleAssets.filter((asset) => asset.kind === "scene").map((asset) => asset.cleanPath).sort(),
      images: moduleAssets.filter((asset) => asset.kind === "image").map((asset) => asset.cleanPath).sort(),
      audio: moduleAssets.filter((asset) => asset.kind === "audio").map((asset) => asset.cleanPath).sort(),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getAssetsDir(): string {
  return process.env.FLOOR796_ASSETS_DIR ?? "assets";
}

export function loadAssetIndex(indexPath = join(getAssetsDir(), "index.json")): AssetIndex {
  if (!existsSync(indexPath)) {
    throw new Error(`Missing ${indexPath}. Run: floor796-character-mcp-extract ./floor796.html ${getAssetsDir()}`);
  }
  return JSON.parse(readFileSync(indexPath, "utf8")) as AssetIndex;
}

export function findCharacterKits(index: AssetIndex, query?: string): CharacterKit[] {
  const normalizedQuery = query?.trim().toLowerCase();
  const modulesByName = new Map(index.modules.map((module) => [module.name, module]));
  const kits: CharacterKit[] = [];

  for (const module of index.modules) {
    const curated = CURATED_ALIASES[module.name];
    const aliases = curated?.aliases ?? [module.name, module.name.replaceAll("-", " ")];
    const title = curated?.title ?? titleCase(module.name);
    const summary = curated?.summary ?? `Floor796 interactive module '${module.name}' packaged for web reuse.`;
    const searchable = [module.name, title, summary, ...aliases, ...module.assets].join(" ").toLowerCase();

    if (normalizedQuery && !searchable.includes(normalizedQuery)) {
      continue;
    }

    kits.push({
      id: module.name,
      title,
      summary,
      aliases,
      confidence: curated ? "high" : "medium",
      module: module.name,
      assets: assetsForModule(index, module.name),
      usageNotes: usageNotesForModule(module),
    });
  }

  if (normalizedQuery) {
    const directAssets = index.assets.filter((asset) => {
      const text = `${asset.cleanPath} ${asset.kind} ${asset.module ?? ""}`.toLowerCase();
      return text.includes(normalizedQuery) && (!asset.module || !modulesByName.has(asset.module));
    });
    if (directAssets.length > 0) {
      kits.push({
        id: `asset-search-${normalizedQuery.replace(/[^a-z0-9]+/g, "-")}`,
        title: `Direct Asset Matches: ${query}`,
        summary: "Assets matched by path/name outside a known interactive module.",
        aliases: [query ?? ""],
        confidence: "low",
        assets: directAssets.slice(0, 50),
        usageNotes: ["These are raw matches. Inspect assets before embedding them in another website."],
      });
    }
  }

  return kits;
}

export function listCharacterSummaries(
  index: AssetIndex,
  options: { include?: CharacterListInclude; limit?: number; offset?: number } = {},
): CharacterSummaryList {
  const include = options.include ?? "all";
  const limit = clampListLimit(options.limit);
  const offset = Math.max(0, options.offset ?? 0);
  const summary: CharacterSummaryList = {};

  if (include === "all" || include === "kits") {
    const kits = findCharacterKits(index).sort((a, b) => a.id.localeCompare(b.id));
    summary.reusableKits = paginate(kits.map(toCharacterKitSummary), limit, offset);
  }

  if (include === "all" || include === "siteCharacters") {
    const siteCharacters = findSiteCharacters(index);
    summary.siteCharacters = paginate(siteCharacters.map(toSiteCharacterSummary), limit, offset);
  }

  return summary;
}

export function assetsForModule(index: AssetIndex, moduleName: string): AssetRecord[] {
  return index.assets.filter((asset) => asset.module === moduleName).sort((a, b) => a.cleanPath.localeCompare(b.cleanPath));
}

export function integrationGuide(kit: CharacterKit): string {
  const imageAssets = kit.assets.filter((asset) => asset.kind === "image");
  const audioAssets = kit.assets.filter((asset) => asset.kind === "audio");
  const scriptAssets = kit.assets.filter((asset) => asset.kind === "script");
  const sceneAssets = kit.assets.filter((asset) => asset.kind === "scene");

  return [
    `Use this kit when the website builder asks for: ${kit.aliases.join(", ")}.`,
    imageAssets.length > 0
      ? `Images/sprites are directly reusable as <img>, CSS backgrounds, canvas textures, or game sprites: ${imageAssets.map((asset) => asset.cleanPath).join(", ")}.`
      : "No direct image sprites were found; this kit may rely on Floor796 scene data.",
    audioAssets.length > 0
      ? `Audio files can be wired to click/hover/animation events: ${audioAssets.map((asset) => asset.cleanPath).join(", ")}.`
      : "No audio files were found for this kit.",
    scriptAssets.length > 0
      ? `Render/player scripts show original behavior and timing. Treat them as reference code before adapting to a new site: ${scriptAssets.map((asset) => asset.cleanPath).join(", ")}.`
      : "No script files were found for this kit.",
    sceneAssets.length > 0
      ? "Scene files use Floor796 proprietary .f796.br data. Serve them as binary assets and reuse only through a compatible renderer or conversion pipeline."
      : "No proprietary scene files were found for this kit.",
    "Keep attribution and reuse permissions in mind; the source HTML explicitly says it is for local viewing of the project.",
  ].join("\n");
}

export function findSiteCharacters(index: AssetIndex, query?: string): SiteCharacter[] {
  const changelog = loadChangelog();
  const normalizedQuery = query?.trim().toLowerCase();

  return changelog
    .filter((entry) => {
      if (!normalizedQuery) return true;
      return `${entry.t} ${entry.l} ${entry.p}`.toLowerCase().includes(normalizedQuery);
    })
    .map((entry) => toSiteCharacter(index, entry))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function siteCharacterIntegrationGuide(character: SiteCharacter): string {
  const lines = [
    `${character.title} is a named Floor796 character/reference from ${character.date}.`,
    character.referenceAsset
      ? `The linked reference asset is available as ${character.referenceAsset.cleanPath}; use serve_floor796_character_asset to retrieve it as base64.`
      : `Original reference link: ${character.link || "none"}.`,
    character.module
      ? `This character is tied to interactive module '${character.module.name}', so get_floor796_character_kit id=${character.module.name} gives the reusable sprite/audio/script kit.`
      : "No direct interactive module is attached; use the scene cell assets as Floor796-renderer data or use the reference image for recreation.",
    character.sceneAssets.length > 0
      ? `Scene cell assets found for coordinates ${character.cells.join(", ")}. These .f796.br files represent the floor area containing the character.`
      : "No extracted scene assets matched the character coordinates.",
    "For a normal website builder, the safest output is a recreated/sprite-based component using the linked image/reference and any available module media, not direct unlicensed reuse.",
  ];
  return lines.join("\n");
}

interface ChangelogEntry {
  id: number;
  d: string;
  a: string;
  l: string;
  m: number;
  p: string;
  t: string;
}

function loadChangelog(): ChangelogEntry[] {
  const changelogPath = join(getAssetsDir(), "data", "changelog.json");
  if (!existsSync(changelogPath)) return [];
  return JSON.parse(readFileSync(changelogPath, "utf8")) as ChangelogEntry[];
}

function toSiteCharacter(index: AssetIndex, entry: ChangelogEntry): SiteCharacter {
  const cells = Array.from(
    new Set(
      entry.p
        .split(";")
        .map((point) => point.split(",")[0])
        .filter(Boolean),
    ),
  );
  const linkPath = linkToCleanPath(entry.l);
  const referenceAsset = linkPath ? index.assets.find((asset) => asset.cleanPath === linkPath || asset.cleanPath.startsWith(`${linkPath}?`)) : undefined;
  const moduleName = entry.l.startsWith("event://") ? entry.l.slice("event://".length) : undefined;
  const module = moduleName ? index.modules.find((candidate) => candidate.name === moduleName) : undefined;
  const sceneAssets = index.assets
    .filter((asset) => asset.kind === "scene" && cells.some((cell) => asset.cleanPath.includes(`/${cell}/`)))
    .slice(0, 32);

  return {
    id: entry.id,
    title: entry.t,
    date: entry.d,
    link: entry.l,
    animated: entry.m === 1,
    cells,
    polygon: entry.p,
    referenceAsset,
    module,
    sceneAssets,
  };
}

function linkToCleanPath(link: string): string | undefined {
  const prefix = "https://floor796.com/";
  if (!link.startsWith(prefix)) return undefined;
  return normalizeAssetPath(link.slice(prefix.length));
}

function usageNotesForModule(module: InteractiveModule): string[] {
  const notes = ["Use serve_floor796_character_asset to retrieve each file as base64 for the downstream web builder."];
  if (module.renderScript) notes.push("render.js is the best source for original animation behavior.");
  if (module.playerScript) notes.push("player.js contains reusable playback/controller behavior.");
  if (module.images.length > 0) notes.push("Image assets are the easiest assets to embed directly in another website.");
  if (module.audio.length > 0) notes.push("Audio assets can be connected to UI or animation triggers.");
  if (module.sceneFiles.length > 0) notes.push(".f796.br scene assets need the Floor796 renderer or a converter before direct visual reuse.");
  return notes;
}

function toCharacterKitSummary(kit: CharacterKit): CharacterKitSummary {
  return {
    id: kit.id,
    title: kit.title,
    summary: kit.summary,
    aliases: kit.aliases,
    confidence: kit.confidence,
    module: kit.module,
    assetCount: kit.assets.length,
    imageCount: kit.assets.filter((asset) => asset.kind === "image").length,
    audioCount: kit.assets.filter((asset) => asset.kind === "audio").length,
    sceneCount: kit.assets.filter((asset) => asset.kind === "scene").length,
    nextTool: `get_floor796_character_kit id=${kit.id}`,
  };
}

function toSiteCharacterSummary(character: SiteCharacter): SiteCharacterSummary {
  return {
    id: character.id,
    title: character.title,
    date: character.date,
    animated: character.animated,
    cells: character.cells,
    link: character.link,
    hasReferenceAsset: Boolean(character.referenceAsset),
    module: character.module?.name,
    sceneAssetCount: character.sceneAssets.length,
    nextTool: `get_floor796_site_character id=${character.id}`,
  };
}

function paginate<T>(items: T[], limit: number, offset: number): PaginatedList<T> {
  const nextOffset = offset + limit < items.length ? offset + limit : undefined;
  return {
    total: items.length,
    offset,
    limit,
    nextOffset,
    items: items.slice(offset, offset + limit),
  };
}

function clampListLimit(limit = 25): number {
  return Math.min(100, Math.max(1, Math.trunc(limit)));
}

function titleCase(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
