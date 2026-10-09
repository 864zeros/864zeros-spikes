# Session Continuity Snapshot: FrameMind Spike & On-Edge SLM Fleet Architecture

**Date:** 2026-10-09  
**Topic:** `framemind` (Edge AI Automated Cinematography & Smart Framing System)  
**State at Start:** GemmaEdge spike completed and deployed on GitHub Pages. FrameMind existed only as a raw concept markdown file `{idea}{frameMind} Edge AI Automated Cinematography & Smart Framing System.md`.  
**State at End:** FrameMind Tier 1 spike fully architected, implemented with 4 zero-dependency Feature Bricks, verified with automated test suite, accompanied by a Google Colab LoRA training pipeline, published in a live interactive dual-viewport testbed, and committed/pushed to GitHub with an accepted Architectural Decision Record (ADR) on Hybrid Mobile Wrappers and an updated Spikes Backlog.

---

## 1. What Was Built

### 1. Feature Bricks (`FrameMind/src/bricks/`)
* **`collector-audio-brick.js`**: Ingests timestamped speech tokens, acoustic energy (RMS dB), silence intervals, and cue tags (`[laughter]`, `[applause]`, `[rep_count]`). Maintains a rolling 10-second temporal window (`_pruneWindow()`) and synthesizes formatted context summaries (`synthesizeTrajectory()`).
* **`slm-cinematography-brick.js`**: Vectorizes semantic text trajectories into a 256-dimensional unit vector and manages on-edge LoRA adapter hot-swapping. Pre-loaded with 3 domain adapters: *Podcast & Banter LoRA*, *Fitness Form LoRA*, and *Keynote Presentation LoRA*. Hot-swaps in **0.047 ms**.
* **`director-brick.js`**: Evaluates cosine similarity of the trajectory vector against 6 cinematographic shot prototypes (`PUNCHLINE_PUSH`, `BANTER_PING_PONG`, `FORM_CHECK_WIDE`, `MOTIVATIONAL_PULSE`, `KEYNOTE_SLOW_PUSH`, `NEUTRAL_ANCHOR`). Generates non-destructive Edit Decision Lists (EDL) with dynamic speaker spatial panning in **0.30 ms**.
* **`framing-mutator-brick.js`**: Transforms 16:9 widescreen footage into 9:16 vertical Short/Reel viewports. Executes smooth 60fps cubic-bezier (`easeInOutCubic` and `easeOutQuad`) interpolation clock (`tick()`) and renders safe, bounds-checked crop coordinates to HTML5 Canvas (`renderToCanvas()`).
* **`inspector-brick.js`**: Diagnostic stream tracking speech tokens, editorial decisions, latency metrics, and asserting **strictly 0 bytes of network egress**.

### 2. Showcase Portal & Testbed (`FrameMind/index.html`)
* Multi-tab application featuring:
  * **Tab 1: Director Testbed:** Procedural 16:9 studio scene canvas with dynamic crop bounding box, real-time 9:16 vertical short rendered canvas, audio transcript ticker, LoRA genre selector, event triggers, and telemetry HUD.
  * **Tab 2: Architecture & Report:** Technical comparison with cloud tools (OpusClip, Descript), system dataflow, and feature-brick contracts.
  * **Tab 3: LoRA Pipeline:** 1-click Google Colab launcher and adapter specifications.
  * **Tab 4: Feature Bricks API:** Live interactive code snippets and interface contracts.

### 3. Verification Test Suite (`FrameMind/tests/test-framemind.js`)
* Automated test suite validating all 4 bricks:
  * Rolling window ingestion and pruning.
  * 256d vector normalization.
  * LoRA hot-swapping latency (<0.05ms).
  * Intent classification accuracy across Podcast, Fitness, and Keynote scenarios (<0.5ms).
  * Dynamic speaker pan coordinate adjustment.
  * Boundary safety invariants (crop window never exceeds [0, 1] frame limits).
  * 0 bytes network egress invariant.

### 4. LoRA Training Pipeline (`FrameMind/notebooks/`)
* **`synthetic_framing_dataset.json`**: Contrastive prompt-to-cinematography training pairs across Podcast, Fitness, and Keynote domains.
* **`Train_FrameMind_LoRA.ipynb`**: Ready-to-run Google Colab notebook fine-tuning `unsloth/gemma-2-2b-it` (rank 8, alpha 16) in 4-bit precision on free T4 GPU tier ($0 cost) and emitting ~3.1 MB `adapter_model.safetensors`.
* **`README.md` & `README.html`**: Dual-track pipeline documentation.

### 5. Architectural Decision Record & Fleet Governance
* **`docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.md` & `.html`**: Official ADR establishing local asset bundling (`capacitor://localhost` or `WKWebView` sandbox) with zero cloud runtime dependencies.
* **`BACKLOG.md` & `BACKLOG.html`**: Roadmap tracking completed spikes, active queue (shared core brick extraction), and deferred backlog (iOS build-kit, Android CameraX).
* **`server.js`**: Zero-dependency static dev server serving the entire spikes fleet on port 8640.
* **`index.html`**: Central fleet landing hub presenting GemmaEdge and FrameMind side-by-side.

---

## 2. Decision Record

### Decision 1: Browser-First Web/Canvas Testbed (Tier 1) Before Native Android (Tier 2)
* **Chosen:** Build FrameMind Tier 1 as a browser-first Web/PWA testbed using HTML5 Canvas, Web Audio, and ES modules.
* **Alternatives Considered:** Building directly in Kotlin + CameraX on Android Studio.
* **Reason:** The browser testbed allows instant verification of the mathematical framing logic, LoRA weights, and editorial timing with zero compilation delay, while running on any device without APK packaging.
* **Constraint:** Local development workstation is Windows; iOS native compilation cannot occur locally without macOS.

### Decision 2: Local Asset Bundling as Accepted Mobile Production Option
* **Chosen:** Standardize on local bundling inside native wrappers (Capacitor / WKWebView / PWA Service Worker) where HTML, JS, and `.safetensors` model weights reside in the local device sandbox.
* **Alternatives Considered:** Hosting the web app on cloud servers and loading it via remote URL inside mobile webviews.
* **Reason:** Guarantees 100% offline functionality in airplane mode, zero recurring server hosting costs, zero network latency, and complete video privacy.

### Decision 3: Single Base SLM with Modular LoRA Adapter Hot-Swapping
* **Chosen:** Load a single base quantized Gemma model and hot-swap ~3.1 MB LoRA adapters at runtime.
* **Alternatives Considered:** Bundling three separate multi-gigabyte models for Podcast, Fitness, and Keynote editing.
* **Reason:** Conserves device storage and VRAM; hot-swapping adapters takes 0.047 ms vs. seconds to load a full model.

---

## 3. Deferred Items (Logged to Backlog)

1. **864zeros iOS Build-Kit & AVFoundation Camera Binding**
   * **Why Deferred:** Workstation is Windows. Building and testing native Swift/Xcode bindings requires a macOS environment or cloud Mac CI runner.
   * **Trigger to Resume:** Setup of a macOS build agent or dedicated Mac workstation.
2. **FrameMind Tier 2: Native Android CameraX Implementation**
   * **Why Deferred:** Tier 1 logic and benchmarks needed verification first before wiring into native Android CameraX and MediaPipe LLM runtime.
   * **Trigger to Resume:** User prioritization of native Android APK distribution.
3. **Shared Core Bricks Extraction (`core-bricks/`)**
   * **Why Deferred:** GemmaEdge is currently frozen for testing; refactoring common bricks into `core-bricks/` was queued to avoid breaking live GemmaEdge tests during the user's evaluation.
   * **Trigger to Resume:** Post-testing phase of GemmaEdge.

---

## 4. In-Progress Work

* **None.** FrameMind Tier 1 is 100% complete, tested, committed, pushed to GitHub, and running on the local dev server.

---

## 5. Next Session Primer

* **Dev Server:** Running in background on port 8640 (`http://localhost:8640`).
* **Live Fleet Portals:**
  * Fleet Landing Hub: [`http://localhost:8640/`](http://localhost:8640/)
  * FrameMind Director Testbed: [`http://localhost:8640/FrameMind/`](http://localhost:8640/FrameMind/)
  * GemmaEdge Showcase Portal: [`http://localhost:8640/GemmaEdge/`](http://localhost:8640/GemmaEdge/)
* **Test Verification Command:** `node FrameMind/tests/test-framemind.js`
* **Remote Git Repository:** [`https://github.com/864zeros/864zeros-spikes`](https://github.com/864zeros/864zeros-spikes)
