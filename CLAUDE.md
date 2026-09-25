# West Fraser Material House: working guide for Claude

Interactive Three.js explorer built by Mellenger Interactive for West Fraser (the client). A procedural timber house assembles itself across a five-stage timeline. It also has 11 selectable material applications (the reference's labels; header count hard-coded in `index.html`), explode and cutaway views, and a GLB export.

- Live: https://mellenger-interactive.github.io/west-fraser-material-house/
- Repo: `~/Projects/west-fraser-material-house` (origin `Mellenger-Interactive/west-fraser-material-house`)
- Stack: Vite 7, three r180, vanilla ES modules. No framework, no backend.

## Who you're working with

Sasha is a developer who is working through client feedback one change at a time. She describes each change in chat. Be terse: point to files, functions, and line numbers, and skip the basics. Don't recap work she has already seen.

## Session start

1. Make sure the repo folder is connected, and request access if it isn't. In `device_bash` it is `$HOME/mnt/west-fraser-material-house`.
2. Run `git status -sb` and `git log --oneline -5`. Say which branch you're on and whether anything is uncommitted.
3. Git needs to delete its own lock files, and `vite build --emptyOutDir` needs to clear old hashed files in `dist/`. If either fails with `Operation not permitted` on unlink, request delete permission for the repo folder once. Then remove `.git/index.lock` if it's empty and no git process is running. Never leave a stale lock behind: it breaks git on Sasha's Mac. Delete permission resets whenever the device link reconnects, and git then still commits but leaves empty `.git/*.lock` and `.git/objects/*/tmp_obj_*` files behind. After every git command, check `ls .git/*.lock .git/objects/*.lock`, and if anything is there, re-request permission and clean up.
4. Prepare the build sandbox and take baseline screenshots (see **Build & verify**).

## Per-change workflow: plan, then wait

1. **Restate** the request in one line. If it's ambiguous, check the reference image (below). If the reference doesn't settle it, ask.
2. **Plan.** Name the files and functions you'll touch and the approach. List any coupled values affected (see **Gotchas**) and how you'll verify. **Stop and wait for Sasha's OK.**
3. **Edit** in place on Sasha's machine with `device_bash`, using `sed -i` or a short Python read-modify-write. Never re-type a file from earlier output. Keep edits scoped to the request: no drive-by refactors.
4. **Build and screenshot** the after state. Show before and after side by side for the affected views. Report console or page errors and the part-count change (`houseExplorer.parts`).
5. **Show the diff**: `git diff --stat` plus the key hunks.
6. **Commit** once she approves. Make one commit per client change on the current revisions branch. **Never push.** Pushing `main` deploys the live site, and Sasha does that herself.

If a request would take several independent changes, split it and run each one through this loop.

## Git

- Work on a revisions branch (`revisions/round-N`). If you're on `main`, ask which branch to create.
- Git identity isn't configured in the sandbox. Commit with `git -c user.name="Sasha Zherdeva" -c user.email="sasha@mellenger.com" commit …`.
- Message format: `<area>: <imperative summary>`. Area is one of `model`, `anim`, `ui`, `content`, `style`, `perf`, or `chore`. In the body, add one line quoting or paraphrasing the client request.
- Never push, force-push, rebase shared history, or merge into `main` unless Sasha asks.

## Build & verify

The `device_bash` sandbox is Linux (arm64). Sasha runs the project on macOS.

**Never run `npm install` or `npm ci` inside the repo.** Linux-native rollup and esbuild binaries in `node_modules` would break `npm run dev` on her Mac. Build from a scratch copy instead:

```bash
mkdir -p $HOME/wf-build && cd $HOME/mnt/west-fraser-material-house \
  && tar --exclude=node_modules --exclude=.git --exclude=dist -cf - . | (cd $HOME/wf-build && tar xf -)
cd $HOME/wf-build && { [ -d node_modules ] || npm ci --no-audit --no-fund; } \
  && npx vite build --outDir "$HOME/mnt/west-fraser-material-house/dist" --emptyOutDir
```

`dist/` is gitignored, so building into it is safe.

**Formatting:** Prettier 3 (`.prettierrc.json`: single quotes, width 100). `npm run format` needs `node_modules` in the repo, so in the sandbox run the scratch copy's binary from the repo root: `$HOME/wf-build/node_modules/.bin/prettier --write src index.html`. Run it before building on any change to `src/` or `index.html`.

**Screenshots: `checks/snap.mjs`** produces the standard shot set (below) and prints a JSON summary with `parts`, `fps`, `overflow`, `errors`, and `failedRequests`. It exits 1 on a page error or horizontal overflow at 390 px.

```bash
node checks/snap.mjs [baseUrl] [outDir] [--select <productId>] [--crop x,y,w,h[:view]] [--full-motion]
```

- Defaults: `http://localhost:5173/` and `checks/snaps/`, which is gitignored. `--select` defaults to `mdf`. `--crop` adds `09-closeup` as a 2× DPR clip of the 1440×900 page. `view` is `cutaway` (100%, the default), `25`, `50`, `75`, `explode`, `cutaway-off`, or `select`.
- **In the cloud:** the `device_bash` sandbox can't run Chromium because system libraries are missing. Build, then stage `dist/index.html`, the hashed files in `dist/assets/` (`ls` them first), and `checks/snap.mjs`. Copy the staged `dist/` to its own scratch folder per build and serve it with `python3 -m http.server <port>`. Put `snap.mjs` in a folder whose `node_modules/playwright` links to the global Playwright (`$(npm root -g)/playwright`); the script falls back from `@playwright/test` to `playwright`. It uses `/opt/pw-browsers/chromium` (or `PW_CHROMIUM`) with software GL automatically. A full run takes about a minute at ~2 fps. Compare runs pixel by pixel (PIL `ImageChops.difference`) and Read the PNGs.
- **On Sasha's Mac:** `npm run dev`, then `npm run snap` (installed Chrome via `channel: 'chrome'`).
- Keep shots and contact sheets in the cloud scratchpad. Anything written to the session's outputs folder is synced into the repo as `Claude outputs/`, which is gitignored.
- Runs are pixel-stable, and a local build matches the live site pixel for pixel, so any diff is real. The script settles by rendered frames with `reducedMotion: 'reduce'`, and takes the mobile shot from a fresh 390×844 load. See the comments in the script for why.

Page hooks for ad-hoc scripting:

- Wait for `window.houseExplorer`. Then `houseExplorer.getState()` returns `{progress, playing, exploded, cutaway, selected}`, and `houseExplorer.parts` is the mesh count.
- Scrub the timeline: set `#progress` to a value from 0 to 100 and dispatch an `input` event.
- Toggle views: click `#explode` or `#cutaway`. Select a material by clicking `[data-id="<productId>"]`.
- Settle by frame count, not wall time: `tick()` caps `dt` at 0.05 s. The build animation is a pure function of `progress`; only explode and OrbitControls damping are time-based.

**Standard shot set** (1440×900 unless noted; `snap.mjs` file names in brackets):

- 100% with cutaway on (`01-100-cutaway`)
- 25%, 50%, and 75% progress (`02-25`, `03-50`, `04-75`)
- Explode on (`05-explode`)
- Cutaway off (`06-cutaway-off`)
- One selected material relevant to the change (`07-select-<id>`, via `--select`)
- Mobile at 390×844, full page, with no horizontal overflow (`08-mobile`)
- A zoomed or cropped close-up of whatever the change touched (`09-closeup`, via `--crop`)

`checks/verify.mjs` is Sasha's full interaction check. It needs `npm run dev` on `localhost:5173` and installed Chrome, so it runs on her Mac, not in the sandbox. It **overwrites** `public/west-fraser-material-house.glb` and `checks/*.png`.

## Repo map (keep this current when structure changes)

| File | What's there |
|---|---|
| `src/model.js` | `products` array with `{id, name, type, color, stage, desc}`. Canvas textures: `texture()` (wood, OSB), `lapTexture()` (siding), `shingleTexture()`, `skyTexture()` (equirect gradient the glass reflects); `uvBox(tile, map)` builds unit boxes with UVs in metres so siding and shingle courses line up. `createHouse()` holds the materials map (products plus `siding`, `trim`, `shingle`, `base`, `glass`, and `<id>Edge` for OSB products) and the builders: `box()` (optional `geo` for non-box shapes, kept out of `userData`; OSB ids get `panelGeos` + edge material), `beam()`, `floor()` (optional front `notch`), `wall()` (framing, sheathing, siding, windows/doors; `opts` = `out`, `sheathEnds`, `sidingEnds`, `siding` range, `fit`), and `roof()` (trusses with end trusses on the end walls, sheathing, shingle sheets, fascia, rake trim; `clip` for lower roofs under the 2nd storey, `gables` for gable sheathing + siding). Then the layout: foundation slabs, floors, ground walls incl. recess return walls, upper walls, three roofs, garage door, corner boards, porch (deck, skirt, slab, steps, posts, LVL beam, ledger, rafters, roof), right-hand deck, MDF cabinets. |
| `src/timeline.js` | Timeline config: `BUILD_SECONDS` (10), `CLIP_SECONDS` (12), `PART_RAMP`, `PART_STAGGER`, `STAGES` (`{until, label, button, stop}` per stage), `COMPLETE_LABEL`, and `stageLabel(progress)`. |
| `src/main.js` | Renderer and lights, camera with `reset()`, OrbitControls limits, ground and grid, the product list with `select()`, and `syncUI()` for the stage label (`stageLabel()`) and percentage. Renders the footer timeline buttons from `STAGES`. Also play/scrub/explode/cutaway handlers, raycast hover and select, `resize()` (FOV plus the `VIEW_DROP` lens shift via `setViewOffset`), `partFraction()` and `updateParts()` for the build animation, explode, and selection dimming, `tick()`, `exportModel()` for the GLB with its animation clip (no in-page download button; scripts call it through the hook), and the `window.houseExplorer` hook. |
| `index.html` | Static markup: official West Fraser favicon links (files in `public/`), no header, intro copy, view buttons, sidebar shell, and footer shell. `.timeline-labels` is empty; `main.js` fills it from `STAGES`. |
| `src/style.css` | All UI styling, following the West Fraser theme (Open Sans from Google Fonts; brand tokens in the project doc `claude/brand-reference.md`). |
| `reference/WF Demo House - with deck 2026-labels.png.webp` | The client's reference illustration, with 11 labelled applications. |
| `public/west-fraser-material-house.glb` | Exported deliverable. Regenerate only at handoffs (below). |
| `checks/` | `verify.mjs` plus its screenshots, and `snap.mjs` for the standard shot set (output in the gitignored `checks/snaps/`). |
| `.github/workflows/deploy.yml` | Builds and deploys to Pages on every push to `main`. |

Model conventions: units are roughly metres, y is up, and the whole house is shifted `house.position.x = -1`. Each mesh is a scaled unit box with `userData = {product, stage, cut, basePosition, baseScale, baseQuaternion}`. Animation and explode always compute from the `base*` values, so **after moving a mesh, update `userData.basePosition` (and the scale and quaternion equivalents)**. Otherwise the change is overwritten on the next frame.

## Gotchas: values that must stay in sync

- **Stage timing lives in two places.** Each product's `stage` fraction is in `model.js`. Everything else is in `STAGES` in `src/timeline.js`: the label thresholds (`until`: `.08 / .32 / .58 / .82 / .99`) and the timeline button stops (`stop`: `0 / 25 / 49 / 75 / 100`). Keep product stages inside the band their label describes. Exception: `mdf` (0.4) lands right after the sub-floor, inside the Framing band (Sasha, round 3); its cabinet pulls (`trim`) take the same stage.
- **Build duration:** `BUILD_SECONDS` (10) and `CLIP_SECONDS` (12) in `src/timeline.js`, read by `tick()` and `exportModel()`. Per-part timing is `PART_RAMP` (0.07) and `PART_STAGGER` (0.0035 × `i % 17`), shared by `partFraction()` and `exportModel()`; together they make each product overlap the next one's start. Keep the latest part's end (0.92 + 16 × stagger + ramp, × BUILD_SECONDS) under `CLIP_SECONDS`.
- **Non-product parts** (`siding`, `trim`, `shingle`, `glass`) default to stage `.92`, and `base` defaults to `0`. They aren't selectable and don't appear in the sidebar.
- **Product array order matters.** It sets the sidebar card order and the explode offsets (`level` in `updateParts()` is the product's index). Reordering products changes how the house pulls apart.
- **Explode:** `updateParts()` moves products listed in `SPREAD` (`main.js`) as assemblies. An assembly is a set of touching parts of one product (union-find at startup). It lifts like its product, slides straight out from the house along its main horizontal axis until it clears every other exploded part by `EXPLODE_GAP`, and spreads its parts about its own centre by the product's factor. Long members stretch by the same factor. `RADIAL` products (`plates`) wrap the house: they spread about the house centre in plan with no stretch or slide, and any piece that would still overlap an exploded part is nudged further out by `NUDGE_GAP`. Parts can carry `userData.above` / `below` (plates in `wall()`): they lift `above`'s lift + `EXPLODE_GAP`, or halfway between `above` and `below`, so walls stack floor → bottom plate → studs → top plate. Everything else still uses `looseOffset()` (split at x 0.5 / z 0). Sasha's tuned values: `deck` 0.8, `EXPLODE_GAP` 0.7; `plates` 0.5 is untuned. Assemblies are computed in `SPREAD` order, and each one clears only the assemblies before it.
- **Cutaway** (button label "Our products only", `#cutaway`, off by default so the page opens on the finished house; round 3) hides `FINISHES`, showing only West Fraser wood products plus the foundation; off is the finished house. The `cut` flag that `wall()` and `roof()` still set is no longer read. Anything structural that is modelled as `trim` needs a wood core (as the porch posts have) or it disappears in this view.
- **Selection:** `selection` (a Set in `main.js`) holds every picked product; cards and clicks in the view toggle products in and out, and `select(null)` clears. Any selection hides every unselected product except `base`. `selected` is the latest pick (detail panel); `getState()` returns both `selected` and `selection`.
- **Finishes:** `FINISHES` in `main.js` (`siding`, `shingle`, `trim`, `glass`) hide in cutaway, while exploded or while a material is selected. New finish materials must be added there.
- **Glass** is transparent (`opacity` 0.45, `depthWrite: false`) and casts no shadow, so anything directly behind it shows through: door slabs are split around their lites, and the garage door slab is open behind the glazed row. Window muntin verticals and horizontals use different depths so their crossings don't count as coplanar faces.
- **Wall faces:** sheathing sits at ±0.1 from the wall line (outer face 0.1225), siding outside it (outer face 0.1425). Anything placed against a wall (porch, deck, clip lines `upperZ` and the lower roofs' `clip.x`) is keyed to the siding face.
- **OSB texture** applies to `webstock`, `rim`, and `walls`. Everything else gets the wood texture.
- **OSB green edges:** `OSB` in `model.js` (`webstock`, `rim`, `walls`). Those meshes use `panelGeos[thinAxis]` (groups: 2 faces, 4 edges) with `[mats[id], mats[`${id}Edge`]]`; gables' ExtrudeGeometry takes the same array. Edge materials carry `userData.product` so `updateParts()` dims/highlights them with their product, and `exportModel()` maps over material arrays. Each OSB mesh costs 2 draw calls per pass (148 meshes, about +300 calls).
- **Mesh names** are `${id}_${index}`, using the global part index. Adding parts renames every later mesh in the GLB export. Warn Sasha if the client relies on node names.
- The camera FOV switches from 35 to 46 below 550 px wide. OrbitControls clamp distance to 13–40. `VIEW_DROP` (`desktop` 0.1, `phone` 0.04) shifts the picture down without moving the orbit pivot.
- The part count is about 1,400 meshes (1,412 after round 2). Report any significant increase: the README notes mobile performance headroom is limited.

## Design source of truth

The reference illustration is the **source of truth** for layout, proportions, detailing, and what's included whenever the client hasn't said otherwise. Stage it and look at it before any geometry or look-and-feel change, and say how the change moves the model closer to or further from it. Where the client's request conflicts with the reference, the client wins. Flag the conflict.

## Content & brand rules

- Product copy stays factual and conservative. Don't invent specs, grades, certifications, or regional availability. Product families come from westfraser.com/products and osb.westfraser.com.
- There is no header or logo on the page. Don't recreate the West Fraser logo. The favicon is West Fraser's official one from westfraser.com (Sasha's request); use other official assets only if Sasha supplies or asks for them.
- Treated-lumber wording, regional specs, and branding still need client confirmation (per the README). Flag copy changes that touch these.
- Keep accessibility intact: `aria-*` attributes, `prefers-reduced-motion` handling, visible focus styles, and keyboard-reachable controls.
- No new dependencies without asking.

## GLB export

Don't regenerate `public/west-fraser-material-house.glb` on routine commits. At a client handoff, Sasha runs `checks/verify.mjs` on her Mac, which re-exports it, and it goes in as a separate `chore: regenerate GLB for <round>` commit. If she asks you to export it, call `houseExplorer.exportModel()` in the cloud browser and write the bytes out.

## Reporting format

After each change:

- **What changed:** one or two lines.
- **Files:** a list, with the functions touched.
- **Screenshots:** before and after.
- **Parts:** before → after.
- **Coupled values touched:** or "none".
- **Open questions:** or "none".
