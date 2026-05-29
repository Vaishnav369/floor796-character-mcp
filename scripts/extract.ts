#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { decodeEmbeddedAsset } from "../src/lib/base223.js";
import { buildModules, toAssetRecord } from "../src/lib/manifest.js";
import type { AssetIndex, AssetRecord } from "../src/lib/types.js";

const usage = `Usage: floor796-character-mcp-extract [floor796.html] [assets-dir]

Examples:
  floor796-character-mcp-extract ./floor796.html ./assets
  FLOOR796_ASSETS_DIR=./floor796-assets floor796-character-mcp-extract ./floor796.html

Defaults:
  floor796.html: ./floor796.html
  assets-dir: ./assets or FLOOR796_ASSETS_DIR`;

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    console.error(usage);
    return;
  }
  if (args.length > 2) {
    throw new Error(`${usage}\n\nToo many arguments.`);
  }

  const sourcePath = args[0] ?? "floor796.html";
  const outDir = args[1] ?? process.env.FLOOR796_ASSETS_DIR ?? "assets";

  if (!existsSync(sourcePath)) {
    throw new Error(`Missing source file: ${sourcePath}\n\nPlace your local floor796.html at that path or pass it explicitly.\n\n${usage}`);
  }

  const sourceBuffer = readFileSync(sourcePath);
  const html = new TextDecoder("windows-1251").decode(sourceBuffer);

  mkdirSync(outDir, { recursive: true });

  const scriptPattern = /<script\s+type="application\/octet-stream"([^>]*)>([\s\S]*?)<\/script>/g;
  const attrPattern = /data-([\w-]+)="([^"]*)"/g;
  const assets: AssetRecord[] = [];
  const seenHashesByPath = new Map<string, string>();
  let match: RegExpExecArray | null;

  while ((match = scriptPattern.exec(html))) {
    const attrs = Object.fromEntries(Array.from(match[1].matchAll(attrPattern), (attr) => [attr[1], attr[2]]));
    const file = attrs.file;
    const compression = attrs.compression as "gzip" | "none" | undefined;

    if (!file || !compression) {
      continue;
    }

    const data = decodeEmbeddedAsset(match[2], compression);
    const record = toAssetRecord(file, compression, data);
    const previousHash = seenHashesByPath.get(record.cleanPath);

    if (previousHash === record.sha256) {
      continue;
    }
    if (previousHash && previousHash !== record.sha256) {
      throw new Error(`Duplicate asset path with different content: ${record.cleanPath}`);
    }

    seenHashesByPath.set(record.cleanPath, record.sha256);
    const destination = join(outDir, record.storagePath);
    mkdirSync(dirname(destination), { recursive: true });
    writeFileSync(destination, data);
    assets.push(record);
    console.error(`extracted ${record.cleanPath} (${record.size} bytes)`);
  }

  const index: AssetIndex = {
    generatedAt: new Date().toISOString(),
    source: sourcePath,
    assets: assets.sort((a, b) => a.cleanPath.localeCompare(b.cleanPath)),
    modules: buildModules(assets),
  };

  writeFileSync(join(outDir, "index.json"), `${JSON.stringify(index, null, 2)}\n`);
  console.error(`wrote ${join(outDir, "index.json")} with ${index.assets.length} assets and ${index.modules.length} interactive modules`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
