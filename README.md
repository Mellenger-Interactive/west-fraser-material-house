# West Fraser material house

A browser-based, individually modelled timber-house explorer inspired by the supplied demo-house image. This is a conceptual reconstruction, not a dimensionally surveyed or engineering-approved building model.

## Use

- `npm install`
- `npm run dev` then open the local address printed in the terminal.
- `npm run build` produces the embeddable static website in `dist/`.
- Host `dist/` on a static web host or incorporate the Three.js scene into an existing website. No backend is required.

## Deliverables

- `public/west-fraser-material-house.glb`: independent mesh objects, product metadata, materials and a 24-second `Build_From_Materials` animation. Open in Blender or any compatible glTF viewer. All layers are included in this export; the website provides the cutaway presentation.
- `src/model.js`: editable parametric model and product descriptions. Dimensions use approximate metres; hidden geometry is inferred.
- `src/main.js`: assembly timeline, orbit camera, raycast selection, exploded view, cutaway and GLB export.
- `src/style.css`: responsive explorer interface.

The model includes lumber plates, OSB I-joist webstock, rimboard, subfloor panels, framing lumber, LVL headers, lumber roof trusses, wall and roof sheathing, deck boards/railings, MDF finishes and illustrative particleboard cabinet cores. OSB and plywood are presented as alternative panel applications; these are not individual branded SKUs. Pulp and residual products are not depicted as construction elements.

Product information: https://www.westfraser.com/products and https://osb.westfraser.com/. The supplied illustration is the visual source for the 11 original application labels. Particleboard is an additional family from the current product catalogue. Confirm regional product specifications, treated-lumber wording and approved branding before public release. The wordmark shown is a text placeholder, not an official logo asset.

Interaction checks run with `node checks/verify.mjs` while the local server is active. Checks cover startup errors, material selection, exploded view, assembly playback, GLB export and mobile overflow. Uses installed Chrome. Screenshot outputs are in `checks/`.

## Integration notes

The model has approximately 1,100 separate components. Geometry is shared in the browser, while separate meshes preserve animation and selection. For production on low-powered mobile devices, consider merging meshes by material for the settled view or using instancing while retaining component transforms for the assembly sequence. The current website loads fonts from Google Fonts and falls back to local sans-serif fonts. Geometry and materials are local and procedural.

## GitHub Pages

Live explorer: https://mellenger-interactive.github.io/west-fraser-material-house/

Pushes to `main` automatically build and publish the site through `.github/workflows/deploy.yml`. Vite uses relative asset paths so the explorer works under the repository's Pages subdirectory. The supplied image is preserved in `reference/`; source files, interaction checks, screenshots, and the exported GLB are included in this repository. Dependencies and generated website output are recreated during deployment.
