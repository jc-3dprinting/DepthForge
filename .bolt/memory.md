# Project memory

## Product intent & audience

- **DepthScope**: in-browser image-to-3D depth estimation tool; all processing local, no backend.
- Stage 1 (current): image upload + real AI depth estimation pipeline only.
- Planned future stage: 3D geometry generation and mesh export (Three.js, GLB/STL) — explicitly deferred, not yet started.
- Audience: developers/creators needing private, client-side depth maps.

## Brand personality & voice

- Technical, honest, no-nonsense; emphasizes real functionality over decoration.
- App name: **DepthScope**.

## Visual design & UX direction

- Clean, modern, responsive; lightweight with minimal animations and no decorative elements.
- Layout: dropzone on top, side-by-side preview panel below (original image | depth map).
- Canvas rendering for depth map, preserving original aspect ratio.
- Components: drag-and-drop + click-to-browse dropzone (JPG/JPEG/PNG/WEBP), backend status badge (`WebGPU`/`WASM`), progress bar with real download %, status messages (Initializing → Downloading → Running → Done/Failed), reset/upload-another button.
- Clear loading, error, and success states throughout.

## Decisions, constraints & rationale

- Stack: Vite + React + TypeScript + Tailwind + `@huggingface/transformers`.
- Model: `onnx-community/depth-anything-v2-small` via Transformers.js `depth-estimation` pipeline — no mock data, placeholders, gradients, or simulated progress.
- Backend strategy: attempt `device: 'webgpu'` first; on init or inference failure, clear cached pipeline and retry `device: 'wasm'`; if WASM fails, surface real error message. Badge must reflect actual active backend.
- Pipeline input type restricted to `string | Blob` (Transformers.js types don't accept `HTMLImageElement`).
- Normalized grayscale depth values stored alongside result for future 3D consumption.
- Vite config adjusted to handle the `transformers` package.
- Modular depth-pipeline module kept separate so future 3D stage can consume depth output directly.
- Resource cleanup: object URLs revoked and state cleared on image replacement / unmount.
- No unnecessary dependencies installed.

## Open questions & assumptions

- WebGPU may require COOP/COEP cross-origin isolation headers (SharedArrayBuffer) — not yet addressed in config or deployment.
- Live inference not verified in dev environment (no browser/GPU available during build); verified via build + typecheck only.
- Model weights (~25 MB) download on first use; UX assumes user accepts wait.
- Future 3D stage interface (how depth tensor feeds into mesh generation) not yet designed.