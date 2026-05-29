# floor796.html — Structure Analysis

## Overview

- **File:** `floor796.html`
- **Size:** ~189 MB (180 MB compressed embedded assets)
- **Type:** Self-contained offline copy of [floor796.com](https://floor796.com) as of **2026-05-27**
- **Encoding:** Windows-1251 (enables efficient binary embedding with ~3% overhead)
- **Author:** Pavel Sannikau \<info@floor796.com\>
- **Purpose:** Single-file, offline-viewable animation project (runs without a web server)

---

## 1. HTML Document Structure

```
<!DOCTYPE html>
<html lang="en" data-mode="embedded" data-date="2026-05-27">
├── <head>
│   ├── <title>Floor796 (2026-05-27)</title>
│   ├── <meta charset="windows-1251">
│   ├── <meta name="viewport" ...>
│   ├── <script> (embedded CSS blob — gzip + base223 encoded)
│   ├── <script> (embedded JS runtime blob — gzip + base223 encoded)
│   ├── <script> (bootloader: embeddedProg — boot logic)
│   └── <link>/<style> (injected by buildScript)
├── <body draggable="false" ondragstart="return false;" ondrop="return false;">
│   ├── <noscript> — Fallback message if JS disabled
│   ├── <div class="boot-loader"> — Loading screen (initially hidden)
│   │   ├── .boot-loader__pc — Percentage (e.g. "0%")
│   │   ├── .boot-loader__text — "Reading Embedded Assets"
│   │   └── .boot-loader__file — Current file being loaded
│   ├── <script> — Sets embeddedProg.totalBytes = 188732034
│   ├── ── ASSET EMBEDDING SECTION (see Section 2) ──
│   └── </body>
</html>
```

---

## 2. Data Embedding Architecture

### 2.1 Encoding Pipeline

Each embedded binary asset follows this loading pipeline:

1. **JavaScript** triggers `embeddedProg.updateLoader(path, byteCount)` — updates the loading UI.
2. **Asset data** is stored in `<script type="application/octet-stream">` with attributes:
   - `data-file="..."` — original server path
   - `data-compression="gzip"` or `"none"` — compression type
3. **Base223 decoding** — Custom encoding scheme (223-character alphabet based on Windows-1251):
   - Encodes 5 base-223 digits into 39 bits = 4.875 bytes per 5 chars
   - Uses BigInt arithmetic for decoding
   - Padding byte at end indicates how many padding bytes to strip
4. **Decompression** — Uses `DecompressionStream('gzip')` (built-in browser API)
5. **Asset type handling:**
   - `.js` / `.wasm` → Creates `<script>` in `<head>` (CSS) or `<body>` (JS)
   - `.json` → Data available at runtime to the embedded renderer
   - `.f796.br` / `.f796i` / `.png` / `.mp3` / `.jpg` / `.webp` → Binary blobs accessible via paths

### 2.2 Boot Logic (`embeddedProg`)

```javascript
window.embeddedProg = {
    totalBytes: 0,       // set to 188732034
    updateLoader(file, loaded)  // UI progress
}
```

- `illegalCodes` — 0-31, 127, 152 (excluded from base-223 alphabet)
- `alphaCp1251` — 223 legal Windows-1251 byte values
- `b223AlphaInv32` / `b223AlphaInv64` — Reverse lookup arrays (value → index)
- `testBrowser()` — Feature detection: CSS color-mix, nesting, :has(), DecompressionStream, attachInternals, RegExp flags
- `showError(type)` — Renders error overlay (browser unsupported or decoding failure)
- `decodeBase223(data)` — Decodes base223 → Uint8Array → gzip decompression → text
- `buildScript(tag, data)` — Decodes + decompresses + injects CSS or JS into DOM

---

## 3. Embedded Assets Inventory

### 3.1 Core Workers (loaded first)

| Path | Size | Compression |
|------|------|-------------|
| `/workers/embedded-scene-slot-v1.js` | 1,531 B | gzip |
| `/workers/brotli_decompress.js` | 1,046 B | gzip |
| `/workers/brotli_decompress_bg.wasm` | 120,756 B | gzip |

### 3.2 Data Files

| Path | Size | Compression |
|------|------|-------------|
| `/data/matrix.json` | 11,391 B | gzip |
| `/data/changelog.json` | 49,186 B | gzip |
| `/data/changelog-ru.json` | 56,286 B | gzip |

### 3.3 Interactive Modules

| Module Path | Assets | Notes |
|-------------|--------|-------|
| `/interactive/stat/render.js` | 1 B (empty/minimal) | Statistics panel |
| `/interactive/power-station-stat/render.js` | 1,451 B | Power station statistics |
| `/interactive/interstellar/render.js` | 1,191 B | Interstellar travel animation |
| `/interactive/twin-pines-mall/render.js` | 901 B | Scene data: `1714330211.f796.br` (245,881 B) |
| `/interactive/jaws19/render.js` | 1,991 B | Scene: `1713214674.f796.br` (97,341 B)<br>Images: `jaws-closed.png` (89,441 B), `jaws-opened.png` (142,376 B)<br>Audio: `sound.mp3` (155,111 B) |
| `/interactive/hologram-room/render.js` | 4,046 B | Multiple scenes (see below) |
| `/interactive/change-my-mind/render.js` | — | Change My Mind meme |
| `/interactive/chuck/render.js` | — | Chuck Norris punch:<br>`cracks.png`, `hand.png`, `punch.mp3` |
| `/interactive/free-ads/render.js` | — | Free ads: `mrwong.f796.br`, `sunesis.f796.br` |
| `/interactive/fun-drawing-v9/render.js` | — | Drawing board (v9):<br>`player.js`, `render.js` |
| `/interactive/meg/render.js` | — | Meg: `1773767566.f796.br` |
| `/interactive/melody/render.js` | — | Piano: `C2.mp3`–`C6.mp3`, `player.js` |
| `/interactive/memorial1/render.js` | — | Memorial: `popcorn3.webp` |
| `/interactive/naruto/render.js` | — | Naruto run: `1749812703.f796.br`, `sound.mp3`, `sound2.mp3`, `sprites.png` |
| `/interactive/where-is-waldo/render.js` | — | Where's Waldo: `1675617723.f796.br` |

### 3.4 Hologram Room Scenes

| Scene Path | Size |
|------------|------|
| `1681591909.f796.br` | 127,851 B |
| `1681661928.f796.br` | 42,531 B |
| `1682104496.f796.br` | 753,911 B |
| `1682274269.f796.br` | 1,173,556 B |
| `1682865942.f796.br` | 424,316 B |
| `1682867247.f796.br` | 330,356 B |
| `1683045493.f796.br` | 1,693,571 B |
| `quest-tuner.f796.br` | — |

### 3.5 Scene Grid — Floor Layout

The animation is a **tiled scene grid** organized by coordinates:

**Coordinate system:** `tXrY` / `bXlY` (top/bottom × row/column)

#### Left Side (t0lX — Top Floor Left)

| Row | Blocks | Fin Files (4 per cell: `{ts}-{row}-{col}.f796.br`) |
|-----|--------|------------------------------------------------------|
| t0l0–t0l2 | 1 | `1669618724-1-1`, `1719176637-0-1,-1-0`, `1721458304-0-0` |
| t0l0–t0l4 | 1 | `1669618056-1-0`, `1719176128-0-1`, `1721457940-1-1` |
| t0l0–t0l6 | 1 | `1713248786-0-0,-0-1,-1-0,-1-1` |
| t0l0–t0l8 | 1 | `1750368217-0-0,-0-1,-1-0,-1-1` |
| t0l0–t1l1 | 1 | `1668261643-0-0,-0-1,-1-0,-1-1` |
| t0l0–t1l3 | 1 | `1719176176-1-1`, `1721458004-1-0`, `1756670694-0-0,-0-1` |
| t0l0–t1l5 | 1 | `1667767166-1-1`, `1756669718-0-0,-1-1`, `1756766188-0-1` |
| t0l0–t1l7 | 1 | `1739567479-0-0,-0-1,-1-0,-1-1` |
| t0l0–t1l9 | 1 | `1750368140-0-0,-0-1,-1-0,-1-1` |
| t0l0–t2l2 | 1 | `1670019241-0-0,-0-1,-1-0,-1-1` |
| t0l0–t2l4 | 1 | `1756669836-0-0,-0-1,-1-0,-1-1` |
| t0l0–t2l6 | 1 | `1739567491-1-1`, `1756669205-1-1` |
| t0l0–t2l8 | 1 | `1750368148-0-0,-0-1,-1-0,-1-1` |
| t0l0–t3l1 | 1 | `1681410222-0-0,-0-1,-1-0,-1-1` |
| t0l0–t3l3 | 1 | `1751655373-1-0`, `1756670390-0-0`, `1757263267-1-1`, `1761325658-0-1` |
| t0l0–t3l5 | 1 | `1753736389-0-0,-0-1`, `1755367390-1-0`, `1756669284-1-1` |
| t0l0–t3l7 | 1 | `1750368157-0-0,-0-1,-1-0,-1-1` |
| t0l0–t3l9 | 1 | `1777852180-0-0,-0-1,-1-0,-1-1` |
| t0l0–t4l2 | 1 | `1677003567-1-1`, `1757263581-1-0`, `1764509636-0-0`, `1768678397-0-1` |
| t0l0–t4l4 | 1 | `1739567605-0-1`, `1750363256-0-0`, `1756669604-1-0`, `1762020710-1-1` |
| t0l0–t4l6 | 1 | `1750368168-1-0`, `1753736302-1-1` |
| t0l0–t4l8 | 1 | `1777852185-0-0,-0-1,-1-0,-1-1` |
| t0l0–t5l1 | 1 | `1681410102-1-1`, `1766516435-0-1,-1-0`, `1769275339-0-0` |
| t0l0–t5l3 | 1 | `1763364872-0-0`, `1764509108-1-0`, `1766145525-0-1`, `1768678152-1-1` |
| t0l0–t5l5 | 1 | `1750368180-1-1` |
| t0l0–t5l7 | 1 | `1777852191-0-0,-0-1,-1-0,-1-1` |
| t0l0–t6l2 | 1 | `1739567651-0-1,-1-1`, `1768678267-1-0` |
| t0l0–t6l4 | 1 | `1750368188-1-1` |
| t0l0–t6l6 | 1 | `1777852196-0-0,-0-1,-1-0,-1-1` |
| t0l0–t7l1 | 1 | `1663527011-1-1` |
| t0l0–t7l3 | 1 | `1750368195-0-0,-0-1,-1-0,-1-1` |
| t0l0–t7l5 | 1 | `1777852201-0-0,-0-1,-1-0,-1-1` |
| t0l0–t8l2 | 1 | `1750368202-0-0,-0-1,-1-0,-1-1` |
| t0l0–t8l4 | 1 | `1777852206-0-0,-0-1,-1-0,-1-1` |
| t0l0–t9l1 | 1 | `1750368210-0-0,-0-1,-1-0,-1-1` |
| t0l0–t9l3 | 1 | `1777852211-0-0,-0-1,-1-0,-1-1` |

#### Right Side (t0rX — Top Floor Right)

| Block | Fin Files |
|-------|-----------|
| t0r0–t0r0 | `1690653242-0-0,-0-1,-1-0`, `1776015190-1-1` |
| t0r0–t0r2 | `1701011289-0-0,-1-0,-1-1`, `1753903772-0-1` |
| t0r0–t0r4 | `1701011543-0-0,-0-1,-1-0,-1-1` |
| t0r0–t0r6 | `1685046116-0-0,-0-1,-1-0,-1-1` |
| t0r0–t0r8 | `1663527534-1-1` |
| t0r0–t1r1 | `1667770742-0-0,-0-1,-1-0,-1-1` |
| t0r0–t1r3 | `1701469586-0-0,-1-0,-1-1`, `1703940979-0-1` |
| t0r0–t1r5 | `1667772659-0-0,-0-1,-1-0,-1-1` |
| t0r0–t1r7 | `1663527447-1-1` |
| t0r0–t1r9 | `1777852497-0-0,-0-1,-1-0,-1-1` |
| t0r0–t2r0 | `1667769241-0-1,-1-1`, `1763365496-0-0,-1-0` |
| t0r0–t2r2 | `1701469229-0-0,-0-1,-1-0`, `1703439153-1-1` |
| t0r0–t2r4 | `1701469683-1-0,-1-1`, `1704730235-0-1`, `1764510417-0-0` |
| t0r0–t2r6 | `1663527436-1-1` |
| t0r0–t2r8 | `1777852441-0-0,-0-1,-1-0,-1-1` |
| t0r0–t3r1 | `1683046609-0-0,-1-0,-1-1`, `1753738171-0-1` |
| t0r0–t3r3 | `1706470177-1-0`, `1730668444-0-0`, `1737010691-1-1`, `1738652184-0-1` |
| t0r0–t3r5 | `1663527425-1-1` |
| t0r0–t3r7 | `1777852436-0-0,-0-1,-1-0,-1-1` |
| t0r0–t4r0 | `1683046332-0-0,-0-1,-1-0,-1-1` |
| t0r0–t4r2 | `1732085392-0-0`, `1733575754-1-0`, `1733837828-0-1`, `1738651877-1-1` |
| t0r0–t4r4 | `1663527414-1-1`, `1735234690-0-1`, `1737653667-1-0`, `1738652322-0-0` |
| t0r0–t4r6 | `1777852431-0-0,-0-1,-1-0,-1-1` |
| t0r0–t5r1 | `1725000221-0-0`, `1725652402-0-1,-1-0`, `1730030511-1-1` |
| t0r0–t5r3 | `1663527404-1-1`, `1730030829-0-0`, `1738652054-1-0` |
| t0r0–t5r5 | `1777852426-0-0,-0-1,-1-0,-1-1` |
| t0r0–t6r0 | `1679238388-1-0,-1-1` |
| t0r0–t6r2 | `1663527393-1-1`, `1730030658-1-0` |
| t0r0–t6r4 | `1777852421-0-0,-0-1,-1-0,-1-1` |
| t0r0–t7r1 | `1663527382-1-1` |
| t0r0–t7r3 | `1777852416-0-0,-0-1,-1-0,-1-1` |
| t0r0–t8r0 | `1663527371-1-1` |
| t0r0–t8r2 | `1777852410-0-0,-0-1,-1-0,-1-1` |
| t0r0–t9r1 | `1777852405-0-0,-0-1,-1-0,-1-1` |

#### Extended Top Floor

| Block | Fin Files |
|-------|-----------|
| t1l0–t10l2 | `1777852216-0-0,-0-1,-1-0,-1-1` |
| t1l0–t11l1 | `1777852395-0-0,-0-1,-1-0,-1-1` |
| t1r0–t10r0 | `1777852400-0-0,-0-1,-1-0,-1-1` |
| t0l1–t2l10 | `1777852175-0-0,-0-1,-1-0,-1-1` |

#### Bottom Floor (b0lX / b0rX)

| Block | Fin Files |
|-------|-----------|
| b0l0–b1l1 | `1684568515-0-1,-1-1`, `1706910808-0-0`, `1709142125-1-0` |
| b0l0–b1l3 | `1717701007-0-0`, `1718201353-1-0`, `1719674982-1-1`, `1757345245-0-1` |
| b0l0–b1l5 | `1713248793-0-0,-0-1,-1-0,-1-1` |
| b0l0–b1l7 | `1750368225-0-0,-0-1,-1-0,-1-1` |
| b0l0–b2l2 | `1712485539-1-1`, `1714935864-1-0`, `1715353778-0-1`, `1715895760-0-0` |
| b0l0–b2l4 | `1713248805-1-0`, `1714935667-1-1` |
| b0l0–b2l6 | `1750368232-0-0,-0-1,-1-0,-1-1` |
| b0l0–b3l1 | `1684568658-1-0`, `1706910957-1-1`, `1712146788-0-0,-0-1` |
| b0l0–b3l3 | `1713248826-0-0,-1-0`, `1714935753-0-1,-1-1` |
| b0l0–b3l5 | `1750368239-0-0,-0-1,-1-0,-1-1` |
| b0l0–b4l2 | `1713248861-0-0,-0-1,-1-0,-1-1` |
| b0l0–b4l4 | `1750368247-0-0,-0-1,-1-0,-1-1` |
| b0l0–b5l1 | `1713248868-0-0,-0-1,-1-0,-1-1` |
| b0l0–b5l3 | `1750368255-0-0,-0-1,-1-0,-1-1` |
| b0l0–b6l2 | `1750368262-0-0,-0-1,-1-0,-1-1` |
| b0l0–b7l1 | `1750368269-0-0,-0-1,-1-0,-1-1` |
| b0r0–b1r1 | `1693920593-0-0,-0-1,-1-0,-1-1` |
| b0r0–b1r3 | `1698175021-0-0,-0-1,-1-1`, `1777851503-1-0` |
| b0r0–b1r5 | `1685046109-1-1`, `1777851793-1-0` |
| b0r0–b1r7 | `1663527523-1-1` |
| b0r0–b2r0 | `1690653399-0-1,-1-1`, `1706911011-1-0`, `1754946366-0-0` |
| b0r0–b2r2 | `1771483442-0-0`, `1773768350-0-1`, `1775419969-1-0`, `1777851384-1-1` |
| b0r0–b2r4 | `1777878094-0-0`, `1779738116-0-1,-1-0,-1-1` |
| b0r0–b2r6 | `1663527512-1-1` |
| b0r0–b3r1 | `1688065365-0-0,-0-1,-1-0,-1-1` |
| b0r0–b3r3 | `1685046095-1-1`, `1775420158-0-0`, `1777271837-0-1`, `1777851590-1-1` |
| b0r0–b3r5 | `1663527502-1-1`, `1777852475-0-0,-0-1` |
| b0r0–b4r0 | `1667772594-0-0,-0-1,-1-0,-1-1` |
| b0r0–b4r2 | `1685046088-0-0,-0-1,-1-0,-1-1` |
| b0r0–b4r4 | `1663527491-1-1` |
| b0r0–b5r1 | `1685046082-0-0,-0-1,-1-0,-1-1` |
| b0r0–b5r3 | `1663527480-1-1` |
| b0r0–b6r0 | `1663527220-1-1` |
| b0r0–b6r2 | `1663527469-1-1` |
| b0r0–b7r1 | `1663527458-1-1` |
| b0r0–b8r0 | `1777852446-0-0,-0-1,-1-0,-1-1` |

### 3.6 Miscellaneous Media

| Path | Type |
|------|------|
| `/data/misc/5th-el-num.png` | Image |
| `/data/misc/anjumaniya.jpg` | Image |
| `/data/misc/azula-storm.jpg?2` | Image |
| `/data/misc/bat-note2.jpg` | Image |
| `/data/misc/carmageddon.jpg` | Image |
| `/data/misc/fight-club-rules-v2.jpg` | Image |
| `/data/misc/flintstone-v4.mp3` | Audio |
| `/data/misc/floor796-in-metro.jpg` | Image |
| `/data/misc/goofy.mp3` | Audio |
| `/data/misc/half-life-charge.mp3` | Audio |
| `/data/misc/half-life-health.mp3` | Audio |
| `/data/misc/halloween.mp3` | Audio |
| `/data/misc/joi.mp3` | Audio |
| `/data/misc/killme.mp3` | Audio |
| `/data/misc/michael_winslow.mp3` | Audio |
| `/data/misc/mimino-w400.png` | Image |
| `/data/misc/mr-sandman3.mp3` | Audio |
| `/data/misc/street-fighter-dendy.jpg` | Image |
| `/data/misc/tmnt-camera-w586.png` | Image |
| `/data/misc/twin-pines-mall.jpg` | Image |
| `/data/misc/zodiac.mp3` | Audio |

### 3.7 Fun Drawings (600+ user drawings)

Nearly 700 `.f796i` files under `data/fun-drawing/2025/` and `data/fun-drawing/2026/` — timestamped user-submitted drawings from the fun-drawing interactive module.

---

## 4. Asset Naming Conventions

- **`.f796.br`** — Custom scene/animation data (likely binary format with Brotli compression)
- **`.f796i`** — Custom interactive/drawing data format
- **Scene naming:** `{unix_timestamp}-{row_version}-{col_version}.f796.br`
  - Each scene cell can have up to **4 variants**: `0-0`, `0-1`, `1-0`, `1-1`
  - Timestamp indicates when the scene was last modified
- **Interactive naming:** `render.js` — Rendering logic, `player.js` — Player/controller logic
- **Grid coordinate system:** `t` = top floor, `b` = bottom floor, `l` = left, `r` = right
  - `t0l0/tXlY` — Top floor, left wing, grid position X/Y
  - `t0r0/tXrY` — Top floor, right wing
  - `b0l0/bXlY` — Bottom floor, left wing
  - `b0r0/bXrY` — Bottom floor, right wing
- **Fin files:** `fin/{timestamp}-{row}-{col}.f796.br` — Final scene render data for specific tile positions

---

## 5. Browser Compatibility Requirements

The `testBrowser()` function checks for:
- **CSS:** `color-mix()`, nesting `&`, `:is()`, `:has()`, `mix-blend-mode: hard-light`, `background-clip: padding-box`
- **JS:** `DecompressionStream`, `ElementInternals.attachInternals`, `String.replaceAll`, `String.endsWith`
- **RegExp:** `/.../ms` flag (dotAll + multiline)
- Compatible with: **Chrome 120+**, **Edge 120+**, **Firefox 125+**, **Safari 17.5+** (approximate)

---

## 6. Error Handling

- **Browser too old:** `<div>` overlay with red background and warning message
- **Decoding failure:** Same overlay with decoding-specific message (triggered when file is served with UTF-8 HTTP headers)
- **JS disabled:** `<noscript>` fallback message displayed
- **Boot error check:** `isBootError` flag prevents loading UI updates after error

---

## 7. Key Observations

1. **Self-contained:** All assets are embedded in a single HTML file — no network requests needed
2. **Custom compression:** Uses a novel base223 encoding scheme over Windows-1251 charset, combined with gzip compression for efficient binary embedding
3. **90 MB+ total embedded content** across CSS, JS, WASM, JSON, images, audio, and proprietary scene formats
4. **Modular architecture:** Separate render.js files for each interactive module, loaded on-demand
5. **Scene grid pattern:** Large animation composed of small tile cells, each with versioned state files
6. **Two compression layers:** Base223 (encoding overhead ~3%) + gzip/br for decompression efficiency
7. **Loading progress:** Custom loader UI shows percentage and current file name
