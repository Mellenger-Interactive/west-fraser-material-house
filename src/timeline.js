// Timeline config: build timing, stage labels and footer timeline stops.
// Product `stage` fractions live in model.js; keep them inside the matching bands below.

/** Seconds for the in-browser build animation, 0 → 100% (`tick()`). */
export const BUILD_SECONDS = 22;

/** Length of the GLB `Build_From_Materials` clip: the build plus a hold at the end (`exportModel()`). */
export const CLIP_SECONDS = 24;

/**
 * Stage bands in order. `label` shows while progress < `until` (0–1).
 * `button` / `stop` are the footer timeline button text and its `data-progress` (0–100).
 */
export const STAGES = [
  { until: 0.08, label: 'A solid foundation', button: 'Foundation', stop: 0 },
  { until: 0.32, label: 'The floor takes shape', button: 'Floor system', stop: 25 },
  { until: 0.58, label: 'A framework for living', button: 'Framing', stop: 49 },
  { until: 0.82, label: 'Wrapping the structure', button: 'Envelope', stop: 75 },
  { until: 0.99, label: 'The finishing touches', button: 'Finishes', stop: 100 },
];

/** Label once progress reaches the last band's `until`. */
export const COMPLETE_LABEL = 'The finished home';

export const stageLabel = (progress) =>
  STAGES.find((s) => progress < s.until)?.label ?? COMPLETE_LABEL;
