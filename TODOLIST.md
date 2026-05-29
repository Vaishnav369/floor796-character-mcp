# Floor796 Character MCP Todo List

## Current Stage

We are at: Stage 10 - v0.1.1 patch release.

Completed so far:

- Created TypeScript MCP project.
- Added asset extractor for `floor796.html`.
- Decoded and extracted Floor796 assets locally.
- Built `assets/index.json`.
- Added MCP tools for searching characters and animation kits.
- Added site character lookup from `changelog.json`.
- Verified `spider` search finds `Spider-Man (2004)`.
- Verified `naruto` search finds the reusable Naruto kit.
- Created `PLAN.md`.
- Confirmed TypeScript build passes.
- Completed README install, MCP config, examples, attribution, and troubleshooting docs.
- Added dependency-free Node smoke tests.
- Confirmed `npm test` and `npm pack --dry-run` pass.
- Added GitHub Actions CI for install, test, and package dry-run.
- Initialized local git repository and confirmed large local Floor796 files are ignored.
- Created GitHub repository and pushed `main`.
- Added `v0.1.0` release notes.
- Published `floor796-character-mcp@0.1.0` to npm.
- Added `list_floor796_characters` for paginated catalog discovery.
- Prepared local `v0.1.1` package metadata and release notes.
- Tagged `v0.1.1` and pushed `main` plus the tag to GitHub.
- Published `floor796-character-mcp@0.1.1` to npm and verified the registry version.

## Stage 1 - Local Prototype

Status: Complete

Tasks:

- [x] Create `package.json`.
- [x] Create `tsconfig.json`.
- [x] Create MCP server entrypoint.
- [x] Create base223 decoder.
- [x] Create extractor script.
- [x] Extract Floor796 assets locally.
- [x] Build asset index.
- [x] Add character search tools.
- [x] Add animation module tools.
- [x] Add asset serving tool.
- [x] Run build verification.

## Stage 2 - Product Direction

Status: Complete

Tasks:

- [x] Define primary mission.
- [x] Shift from generic asset browser to character/animation reuse MCP.
- [x] Support examples like Spider-Man and Naruto.
- [x] Add publishing plan.
- [x] Decide not to publish `floor796.html` or extracted `assets/`.

## Stage 3 - npm/GitHub Readiness

Status: Complete

Tasks:

- [x] Add package metadata.
- [x] Add repository URL.
- [x] Add homepage URL.
- [x] Add bugs URL.
- [x] Add keywords.
- [x] Add author.
- [x] Add license.
- [x] Add package `files` allowlist.
- [x] Replace `latest` dependency versions with stable pinned versions.
- [x] Add `prepublishOnly` script.
- [x] Confirm `.npmignore` is not needed because package `files` controls published contents.
- [x] Confirm `floor796.html` is excluded from npm package.
- [x] Confirm `assets/` is excluded from npm package.
- [x] Confirm repository URL after GitHub repo is created.

## Stage 4 - CLI Improvements

Status: Complete

Tasks:

- [x] Add `floor796-character-mcp-extract` CLI command.
- [x] Make extractor executable from installed npm package.
- [x] Allow extractor input path argument.
- [x] Allow extractor output path argument.
- [x] Add clear usage output for extractor.
- [x] Add configurable `FLOOR796_ASSETS_DIR`.
- [x] Improve missing assets error message.

## Stage 5 - Documentation

Status: Complete

Tasks:

- [x] Basic README exists.
- [x] PLAN.md exists.
- [x] TODOLIST.md exists.
- [x] Expand README install instructions.
- [x] Add npm install instructions.
- [x] Add GitHub clone instructions.
- [x] Add Claude Desktop MCP config example.
- [x] Add OpenCode MCP config example.
- [x] Add example: search `spider`.
- [x] Add example: get `naruto`.
- [x] Add example: serve `interactive/naruto/sprites.png`.
- [x] Add legal and attribution notes.
- [x] Add troubleshooting section.

## Stage 6 - Testing

Status: Complete

Tasks:

- [x] Run `npm run build`.
- [x] Run extraction manually.
- [x] Run direct catalog smoke checks.
- [x] Add automated smoke test without assets.
- [x] Add automated smoke test with sample/minimal fixture.
- [x] Add test for missing `assets/index.json`.
- [x] Add test for configurable assets directory.
- [x] Add test for character search.
- [x] Add test for safe Windows paths.

## Stage 7 - GitHub Release

Status: Complete

Tasks:

- [x] Initialize git repository if needed.
- [x] Review changed files.
- [x] Ensure no large generated files are tracked.
- [x] Add LICENSE.
- [x] Add GitHub Actions workflow.
- [x] Push to GitHub.
- [x] Add repository description.
- [x] Add release notes.
- [x] Tag `v0.1.0`.
- [x] Push `v0.1.0` tag.

## Stage 8 - npm Release

Status: Partial

Tasks:

- [x] Run `npm pack --dry-run`.
- [x] Confirm package contents are small and correct.
- [ ] Run clean install test.
- [ ] Run clean MCP startup test.
- [x] Publish `floor796-character-mcp@0.1.0` with `npm publish --access public`.
- [ ] Test global install.
- [x] Document final user setup flow.

## Stage 10 - v0.1.1 Patch Release

Status: Complete

Tasks:

- [x] Add `list_floor796_characters` MCP tool.
- [x] Add listing helper and typed summary results.
- [x] Add smoke test coverage for listing pagination.
- [x] Update README with listing-tool documentation.
- [x] Bump package metadata to `0.1.1`.
- [x] Add `v0.1.1` release notes.
- [x] Verify `npm test` passes.
- [x] Verify `npm pack --dry-run` passes.
- [x] Tag `v0.1.1`.
- [x] Push `main` and `v0.1.1` to GitHub.
- [x] Publish `floor796-character-mcp@0.1.1` to npm.
- [x] Verify npm shows version `0.1.1`.
- [x] Complete npm OTP authentication for publish.

## Stage 9 - Future Improvements

Status: Backlog

Tasks:

- [ ] Add better character ranking.
- [ ] Add coordinate-to-scene preview metadata.
- [ ] Add lightweight generated thumbnails if legally acceptable.
- [ ] Add direct component templates for React/HTML/CSS.
- [ ] Add converter path for `.f796.br` scene data.
- [ ] Add more curated aliases for popular characters.
- [ ] Add MCP resource templates for character catalog browsing.

## Immediate Next Step

Regenerate npm recovery codes because one was used during the `v0.1.1` publish, then continue with Stage 9 future improvements.
