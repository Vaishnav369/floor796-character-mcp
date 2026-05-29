import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { findCharacterKits, listCharacterSummaries, loadAssetIndex, storagePathForAsset } from "../build/src/lib/manifest.js";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function createFixtureAssetsDir() {
  const root = mkdtempSync(join(tmpdir(), "floor796-assets-"));
  const assetsDir = join(root, "assets");
  mkdirSync(assetsDir, { recursive: true });

  const narutoAsset = {
    path: "interactive/naruto/sprites.png",
    cleanPath: "interactive/naruto/sprites.png",
    storagePath: "interactive/naruto/sprites.png",
    size: 123,
    compression: "gzip",
    kind: "image",
    mimeType: "image/png",
    module: "naruto",
    extension: ".png",
    sha256: "fixture",
  };

  const jawsAsset = {
    path: "interactive/jaws19/open.png",
    cleanPath: "interactive/jaws19/open.png",
    storagePath: "interactive/jaws19/open.png",
    size: 456,
    compression: "gzip",
    kind: "image",
    mimeType: "image/png",
    module: "jaws19",
    extension: ".png",
    sha256: "fixture-jaws",
  };

  writeFileSync(
    join(assetsDir, "index.json"),
    JSON.stringify(
      {
        generatedAt: "2026-05-29T00:00:00.000Z",
        source: "fixture-floor796.html",
        assets: [narutoAsset, jawsAsset],
        modules: [
          {
            name: "naruto",
            pathPrefix: "interactive/naruto/",
            assets: [narutoAsset.cleanPath],
            sceneFiles: [],
            images: [narutoAsset.cleanPath],
            audio: [],
          },
          {
            name: "jaws19",
            pathPrefix: "interactive/jaws19/",
            assets: [jawsAsset.cleanPath],
            sceneFiles: [],
            images: [jawsAsset.cleanPath],
            audio: [],
          },
        ],
      },
      null,
      2,
    ),
  );

  return { root, assetsDir };
}

test("server exits with a clear missing assets error", () => {
  const root = mkdtempSync(join(tmpdir(), "floor796-missing-"));
  const missingAssetsDir = join(root, "missing-assets");

  try {
    const result = spawnSync(process.execPath, ["build/src/index.js"], {
      cwd: projectRoot,
      env: { ...process.env, FLOOR796_ASSETS_DIR: missingAssetsDir },
      encoding: "utf8",
    });

    const output = `${result.stdout}${result.stderr}`;
    assert.notEqual(result.status, 0);
    assert.match(output, /Missing .*index\.json/);
    assert.match(output, /floor796-character-mcp-extract/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("loadAssetIndex respects FLOOR796_ASSETS_DIR", () => {
  const fixture = createFixtureAssetsDir();
  const previousAssetsDir = process.env.FLOOR796_ASSETS_DIR;

  try {
    process.env.FLOOR796_ASSETS_DIR = fixture.assetsDir;
    const index = loadAssetIndex();

    assert.equal(index.source, "fixture-floor796.html");
    assert.equal(index.assets.length, 2);
    assert.equal(index.modules[0]?.name, "naruto");
  } finally {
    if (previousAssetsDir === undefined) {
      delete process.env.FLOOR796_ASSETS_DIR;
    } else {
      process.env.FLOOR796_ASSETS_DIR = previousAssetsDir;
    }
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("listCharacterSummaries returns paginated compact kit summaries", () => {
  const fixture = createFixtureAssetsDir();
  const previousAssetsDir = process.env.FLOOR796_ASSETS_DIR;

  try {
    process.env.FLOOR796_ASSETS_DIR = fixture.assetsDir;
    const index = loadAssetIndex();
    const page = listCharacterSummaries(index, { include: "kits", limit: 1, offset: 1 });

    assert.equal(page.reusableKits.total, 2);
    assert.equal(page.reusableKits.offset, 1);
    assert.equal(page.reusableKits.limit, 1);
    assert.equal(page.reusableKits.items.length, 1);
    assert.equal(page.reusableKits.items[0]?.id, "naruto");
    assert.equal(page.reusableKits.items[0]?.assetCount, 1);
    assert.equal(page.siteCharacters, undefined);
  } finally {
    if (previousAssetsDir === undefined) {
      delete process.env.FLOOR796_ASSETS_DIR;
    } else {
      process.env.FLOOR796_ASSETS_DIR = previousAssetsDir;
    }
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("findCharacterKits returns the curated Naruto kit from a minimal fixture", () => {
  const fixture = createFixtureAssetsDir();
  const previousAssetsDir = process.env.FLOOR796_ASSETS_DIR;

  try {
    process.env.FLOOR796_ASSETS_DIR = fixture.assetsDir;
    const index = loadAssetIndex();
    const kits = findCharacterKits(index, "naruto");

    assert.equal(kits.length, 1);
    assert.equal(kits[0]?.id, "naruto");
    assert.equal(kits[0]?.confidence, "high");
    assert.equal(kits[0]?.assets[0]?.cleanPath, "interactive/naruto/sprites.png");
  } finally {
    if (previousAssetsDir === undefined) {
      delete process.env.FLOOR796_ASSETS_DIR;
    } else {
      process.env.FLOOR796_ASSETS_DIR = previousAssetsDir;
    }
    rmSync(fixture.root, { recursive: true, force: true });
  }
});

test("storagePathForAsset replaces Windows-invalid path characters", () => {
  assert.equal(storagePathForAsset("references/azula-storm.jpg?2"), "references/azula-storm.jpg_2");
  assert.equal(storagePathForAsset("/bad:name|with*chars?.png"), "bad_name_with_chars_.png");
});
