#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  assetsForModule,
  findCharacterKits,
  findSiteCharacters,
  getAssetsDir,
  integrationGuide,
  listCharacterSummaries,
  loadAssetIndex,
  normalizeAssetPath,
  siteCharacterIntegrationGuide,
} from "./lib/manifest.js";

const assetsDir = getAssetsDir();
const index = loadAssetIndex();

const server = new McpServer({
  name: "floor796-character-mcp",
  version: "0.1.0",
});

server.registerTool(
  "list_floor796_characters",
  {
    title: "List Floor796 Characters",
    description:
      "Browse available reusable Floor796 character kits and named site characters without needing a search keyword. Use this for discovery before choosing get_floor796_character_kit or get_floor796_site_character.",
    inputSchema: {
      include: z.enum(["all", "kits", "siteCharacters"]).default("all"),
      limit: z.number().int().positive().max(100).default(25),
      offset: z.number().int().nonnegative().default(0),
    },
  },
  async ({ include, limit, offset }) => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(listCharacterSummaries(index, { include, limit, offset }), null, 2),
      },
    ],
  }),
);

server.registerTool(
  "search_floor796_characters",
  {
    title: "Search Floor796 Characters",
    description:
      "Find reusable Floor796 character or animation kits by name, alias, style, or asset path. Use this first when a builder asks for a character such as Naruto, shark/Jaws, Chuck punch, Waldo, melody, hologram, or similar.",
    inputSchema: {
      query: z.string().optional().describe("Character, animation, or style to search for."),
      limit: z.number().int().positive().max(50).default(10),
    },
  },
  async ({ query, limit }) => {
    const kits = findCharacterKits(index, query).slice(0, limit);
    const siteCharacters = findSiteCharacters(index, query).slice(0, limit);
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              reusableKits: kits.map((kit) => ({
                id: kit.id,
                title: kit.title,
                summary: kit.summary,
                aliases: kit.aliases,
                confidence: kit.confidence,
                assetCount: kit.assets.length,
                imageCount: kit.assets.filter((asset) => asset.kind === "image").length,
                audioCount: kit.assets.filter((asset) => asset.kind === "audio").length,
                sceneCount: kit.assets.filter((asset) => asset.kind === "scene").length,
                usageNotes: kit.usageNotes,
                nextTool: `get_floor796_character_kit id=${kit.id}`,
              })),
              siteCharacters: siteCharacters.map((character) => ({
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
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "get_floor796_site_character",
  {
    title: "Get Floor796 Site Character",
    description:
      "Return a named Floor796 site character from changelog.json, including its reference link, floor coordinates, matching scene files, and reuse guidance. Use this for requests like 'Spider-Man character from the website'.",
    inputSchema: {
      id: z.number().int().describe("Character id from search_floor796_characters siteCharacters results."),
    },
  },
  async ({ id }) => {
    const character = findSiteCharacters(index).find((candidate) => candidate.id === id);
    if (!character) {
      throw new Error(`Unknown Floor796 site character id: ${id}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              id: character.id,
              title: character.title,
              date: character.date,
              animated: character.animated,
              link: character.link,
              cells: character.cells,
              polygon: character.polygon,
              referenceAsset: character.referenceAsset
                ? {
                    path: character.referenceAsset.cleanPath,
                    kind: character.referenceAsset.kind,
                    mimeType: character.referenceAsset.mimeType,
                    size: character.referenceAsset.size,
                    retrieveWith: `serve_floor796_character_asset path=${character.referenceAsset.cleanPath}`,
                  }
                : undefined,
              module: character.module
                ? {
                    name: character.module.name,
                    retrieveWith: `get_floor796_character_kit id=${character.module.name}`,
                  }
                : undefined,
              sceneAssets: character.sceneAssets.map((asset) => ({
                path: asset.cleanPath,
                size: asset.size,
                mimeType: asset.mimeType,
                retrieveWith: `serve_floor796_character_asset path=${asset.cleanPath}`,
              })),
              integrationGuide: siteCharacterIntegrationGuide(character),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "get_floor796_character_kit",
  {
    title: "Get Floor796 Character Kit",
    description:
      "Return a complete reusable kit for a Floor796 character or animation, including assets, MIME types, and practical web integration guidance.",
    inputSchema: {
      id: z.string().describe("Kit id from search_floor796_characters, usually the interactive module name."),
    },
  },
  async ({ id }) => {
    const kit = findCharacterKits(index).find((candidate) => candidate.id === id);
    if (!kit) {
      throw new Error(`Unknown Floor796 character kit: ${id}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ...kit,
              integrationGuide: integrationGuide(kit),
              assets: kit.assets.map((asset) => ({
                path: asset.cleanPath,
                size: asset.size,
                kind: asset.kind,
                mimeType: asset.mimeType,
                sha256: asset.sha256,
                retrieveWith: `serve_floor796_character_asset path=${asset.cleanPath}`,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "list_floor796_animation_modules",
  {
    title: "List Floor796 Animation Modules",
    description: "List all extracted interactive Floor796 modules and their reusable asset categories.",
    inputSchema: {},
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(index.modules, null, 2),
      },
    ],
  }),
);

server.registerTool(
  "get_floor796_animation_module",
  {
    title: "Get Floor796 Animation Module",
    description: "Return detailed files for an interactive module, including render.js/player.js paths and media files.",
    inputSchema: {
      name: z.string().describe("Interactive module name, for example naruto, jaws19, chuck, melody."),
    },
  },
  async ({ name }) => {
    const module = index.modules.find((candidate) => candidate.name === name);
    if (!module) {
      throw new Error(`Unknown Floor796 module: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              ...module,
              assets: assetsForModule(index, name).map((asset) => ({
                path: asset.cleanPath,
                kind: asset.kind,
                size: asset.size,
                mimeType: asset.mimeType,
              })),
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "serve_floor796_character_asset",
  {
    title: "Serve Floor796 Character Asset",
    description:
      "Return one extracted character/animation asset as base64 with its MIME type so another website builder can embed or save it.",
    inputSchema: {
      path: z.string().describe("Asset path from a character kit, for example interactive/naruto/sprites.png."),
    },
  },
  async ({ path }) => {
    const cleanPath = normalizeAssetPath(path);
    const asset = index.assets.find((candidate) => candidate.cleanPath === cleanPath);
    if (!asset) {
      throw new Error(`Unknown Floor796 asset: ${path}`);
    }

    const data = readFileSync(join(assetsDir, asset.storagePath));
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              path: asset.cleanPath,
              mimeType: asset.mimeType,
              kind: asset.kind,
              size: asset.size,
              sha256: asset.sha256,
              base64: data.toString("base64"),
              dataUri: asset.kind === "image" || asset.kind === "audio" ? `data:${asset.mimeType};base64,${data.toString("base64")}` : undefined,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerResource(
  "floor796-character-catalog",
  "floor796://characters",
  {
    title: "Floor796 Character Catalog",
    description: "Reusable Floor796 character and animation kit catalog.",
    mimeType: "application/json",
  },
  async (uri) => ({
    contents: [
      {
        uri: uri.href,
        mimeType: "application/json",
        text: JSON.stringify(findCharacterKits(index), null, 2),
      },
    ],
  }),
);

const transport = new StdioServerTransport();
await server.connect(transport);
