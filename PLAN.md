# Floor796 Character MCP Publishing Plan

## Final Objective

Publish `floor796-character-mcp` so users can install it from npm or clone it from GitHub and use it in their own website-building projects.

The MCP should let a user ask for a Floor796 character or animation, then return reusable metadata, source references, extracted media assets, and practical integration guidance for building websites.

## Primary Product Goal

A website builder should be able to say:

> I want the Spider-Man character from Floor796 in my website.

The MCP should respond with:

- Matching Floor796 character records.
- Character title, date, reference link, and Floor796 coordinates.
- Related scene assets when available.
- Interactive module assets when available.
- Images, sprites, audio, and scripts as retrievable files.
- Guidance for adapting the character into a normal web project.

## Publishing Strategy

Do not publish `floor796.html` or extracted `assets/` directly to npm by default.

Reasons:

- `floor796.html` is about 189 MB.
- GitHub blocks normal files over 100 MB.
- npm packages should stay small.
- The Floor796 source comment says the offline copy is intended for local viewing.
- Re-distributing extracted copyrighted/reference assets may create licensing risk.

Instead, publish the MCP server and extractor code. Users provide their own local `floor796.html` archive, then run extraction locally.

## Package Shape

Published npm package should include:

- `build/`
- `src/`
- `scripts/extract.ts`
- `README.md`
- `PLAN.md`
- `package.json`
- `tsconfig.json`
- license file
- example MCP config

Published npm package should exclude:

- `floor796.html`
- `assets/`
- `node_modules/`
- large generated files
- local test outputs

## Required Changes Before Publishing

1. Add package metadata.

Update `package.json` with:

- `repository`
- `homepage`
- `bugs`
- `keywords`
- `author`
- `license`
- `files`
- `prepublishOnly`
- stable dependency versions instead of `latest`

2. Add CLI-friendly commands.

Add commands such as:

- `floor796-character-mcp`
- `floor796-character-mcp-extract`

The extractor should accept:

```bash
floor796-character-mcp-extract ./floor796.html ./assets
```

3. Make asset location configurable.

The MCP server should support:

```bash
FLOOR796_ASSETS_DIR=./assets floor796-character-mcp
```

Default remains:

```bash
assets/
```

4. Improve error messages.

If `assets/index.json` is missing, the server should clearly say:

```text
Missing assets/index.json.
Run: npm run extract -- ./floor796.html ./assets
```

5. Add examples.

Add examples for:

- Claude Desktop MCP config
- OpenCode MCP config
- direct local development
- searching for `spider`
- getting `naruto`
- serving `interactive/naruto/sprites.png`

6. Add legal and attribution notes.

README should clearly state:

- This project is an MCP tool for local extraction and indexing.
- It does not claim ownership over Floor796 content.
- Users are responsible for rights and permissions when reusing assets.
- Original project: `https://floor796.com`.

## GitHub Release Plan

1. Initialize git repository if needed.
2. Add `.npmignore` or package `files` allowlist.
3. Confirm `floor796.html` and `assets/` are ignored.
4. Add `LICENSE`.
5. Add GitHub Actions workflow:

- install
- build
- typecheck
- smoke test without assets

6. Push to GitHub.
7. Create first release tag:

```bash
v0.1.0
```

## npm Release Plan

1. Verify package contents:

```bash
npm pack --dry-run
```

2. Build package:

```bash
npm run build
```

3. Publish first public version:

```bash
npm publish --access public
```

4. Test install in a clean temp project:

```bash
npm install floor796-character-mcp
```

5. Test MCP startup without assets and confirm helpful error.
6. Test MCP startup after local extraction.

## User Installation Flow

Recommended user flow:

```bash
npm install -g floor796-character-mcp
floor796-character-mcp-extract ./floor796.html ./assets
FLOOR796_ASSETS_DIR=./assets floor796-character-mcp
```

Then configure their MCP client to run:

```bash
floor796-character-mcp
```

## Success Criteria

The package is ready when:

- `npm run build` passes.
- Server starts with clear error if assets are missing.
- Extractor works from a user-provided `floor796.html`.
- `search_floor796_characters` finds named characters like `Spider-Man`.
- `get_floor796_character_kit` returns reusable kits like `naruto`.
- `serve_floor796_character_asset` returns base64/data URI assets.
- npm package does not include large Floor796 archive files.
- README explains GitHub/npm setup clearly.
