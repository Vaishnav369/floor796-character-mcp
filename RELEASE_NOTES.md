# Release Notes

## v0.1.0

Initial public release of `floor796-character-mcp`.

### Added

- MCP server for discovering reusable Floor796 character and animation kits.
- Local extractor CLI: `floor796-character-mcp-extract`.
- Character search and lookup tools for curated kits and named Floor796 site characters.
- Animation module listing and lookup tools.
- Asset serving tool for extracted local Floor796 assets.
- Configurable runtime asset directory via `FLOOR796_ASSETS_DIR`.
- Smoke tests using Node's built-in test runner.
- GitHub Actions CI for install, tests, and package dry-run.

### Packaging Notes

- The npm package does not include `floor796.html`.
- The npm package does not include extracted `assets/`.
- Users provide their own local Floor796 HTML file and extract assets locally.
