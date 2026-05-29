# Floor796 Character MCP

This MCP server turns the embedded `floor796.html` archive into reusable character and animation kits for other website-building agents.

Primary mission: when a user asks for a Floor796 character or animation, the MCP can search the extracted archive, return the relevant kit, and serve images, audio, scripts, and scene files with integration guidance.

## Setup

### From npm

```bash
npm install -g floor796-character-mcp
floor796-character-mcp-extract ./floor796.html ./assets
floor796-character-mcp
```

`floor796-character-mcp-extract` decodes your local `floor796.html` into `assets/` and writes `assets/index.json`. The source HTML and extracted assets are not bundled with the npm package.

Use a custom asset directory with either an argument or `FLOOR796_ASSETS_DIR`:

```bash
floor796-character-mcp-extract ./floor796.html ./floor796-assets
FLOOR796_ASSETS_DIR=./floor796-assets floor796-character-mcp
```

### From source

```bash
git clone https://github.com/Vaishnav369/floor796-character-mcp.git
cd floor796-character-mcp
npm install
npm run extract
npm run build
npm start
```

`npm run extract` decodes the Windows-1251/base223/gzip assets from `floor796.html` into `assets/` and writes `assets/index.json`.

## MCP Configuration

Run `floor796-character-mcp-extract` first so the server can find `assets/index.json`.

### Claude Desktop

Add this to your Claude Desktop MCP config. Use an absolute `FLOOR796_ASSETS_DIR` path if Claude Desktop cannot resolve your project-relative `./assets` directory.

```json
{
  "mcpServers": {
    "floor796-character-mcp": {
      "command": "floor796-character-mcp",
      "env": {
        "FLOOR796_ASSETS_DIR": "V:\\Antgravity\\aksomanic\\assets"
      }
    }
  }
}
```

If the globally installed command is not on Claude Desktop's PATH, replace `command` with the full path to the installed `floor796-character-mcp` executable.

### OpenCode

Add this to `opencode.json` in your project or to `~/.config/opencode/opencode.json`.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "floor796-character-mcp": {
      "type": "local",
      "command": ["floor796-character-mcp"],
      "enabled": true,
      "environment": {
        "FLOOR796_ASSETS_DIR": "V:\\Antgravity\\aksomanic\\assets"
      }
    }
  }
}
```

Prompt OpenCode with `use floor796-character-mcp` when you want it to search or serve Floor796 character assets.

## MCP Tools

- `search_floor796_characters`: find reusable character/animation kits by name or description.
- `get_floor796_site_character`: return a named site character from `changelog.json`, including reference image/link, coordinates, matching scene assets, and reuse guidance.
- `get_floor796_character_kit`: return assets, metadata, and web integration guidance for a kit.
- `list_floor796_animation_modules`: list all interactive modules.
- `get_floor796_animation_module`: inspect one interactive module.
- `serve_floor796_character_asset`: return one extracted asset as base64 and a data URI when useful.

## Examples

Search for Spider-Man site characters:

```text
Use floor796-character-mcp to search Floor796 characters for "spider".
```

Get the Naruto reusable character kit:

```text
Use floor796-character-mcp to get the Floor796 character kit for "naruto".
```

Serve the Naruto sprite sheet for direct website reuse:

```text
Use floor796-character-mcp to serve the asset "interactive/naruto/sprites.png".
```

## Reuse Notes

Images, sprites, and audio are the easiest assets to reuse in another website. `render.js` and `player.js` files are reference code for behavior and timing. `.f796.br` files are Floor796 scene data and need a compatible renderer or conversion pipeline before direct visual reuse.

Respect source attribution and permissions. The original embedded HTML states it is intended for local viewing of the Floor796 project.

Example: searching `spider` returns `Spider-Man (2004)` from the site character catalog. `get_floor796_site_character` then returns the reference image if extracted, coordinates in the Floor796 grid, and the scene files containing that character.

## Legal and Attribution

This package does not bundle `floor796.html` or extracted Floor796 assets. It only provides local extraction and MCP access tools for a copy of `floor796.html` that you already have permission to use.

Keep attribution to Floor796 and follow the source project's permissions when reusing images, sprites, audio, code, or scene data in another site.

## Troubleshooting

If the server reports that `assets/index.json` is missing, run:

```bash
floor796-character-mcp-extract ./floor796.html ./assets
```

If your MCP client starts the server from another working directory, set `FLOOR796_ASSETS_DIR` to an absolute path containing `index.json`.

If extraction fails with a missing source file error, pass the real local path to `floor796.html`:

```bash
floor796-character-mcp-extract V:\\path\\to\\floor796.html V:\\path\\to\\assets
```
