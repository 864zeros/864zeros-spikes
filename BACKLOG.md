# 864zeros Spikes Fleet — Backlog & Roadmap

Official roadmap, engineering backlog, research publications, and accepted production options for the on-edge SLM spikes fleet.

---

## 1. Published Research & Flagship Whitepapers

### [Sovereign Edge Intelligence: Rejuvenating Low-Rank Adaptation (LoRA) for Real-Time On-Device SLM Feature Bricks](docs/RESEARCH-PAPER-SOVEREIGN-EDGE-SLM-LORA.md) `[PUBLISHED]`
* **Document Reference:** [docs/RESEARCH-PAPER-SOVEREIGN-EDGE-SLM-LORA.md](docs/RESEARCH-PAPER-SOVEREIGN-EDGE-SLM-LORA.md) ([HTML Version](docs/RESEARCH-PAPER-SOVEREIGN-EDGE-SLM-LORA.html))
* **Summary:** Open pattern specification proving the 50x mathematical leverage of LoRA on SLMs (1B–3B), sub-0.05ms adapter hot-swapping, and the AETHER feature-brick pattern across GemmaEdge and FrameMind.
* **Corporate Evangelism Ready:** Vendor-neutral body, abstractive leap from Google DeepMind's Gemma-2/EmbeddingGemma publications.

---

## 2. Completed Spikes & Delivered Capabilities

### [GemmaEdge: On-Edge Personalization & SLM Engine](GemmaEdge/index.html) `[COMPLETED]`
* **Live Deployment:** [https://864zeros.github.io/864zeros-spikes/GemmaEdge/](https://864zeros.github.io/864zeros-spikes/GemmaEdge/)
* **Executive Spike Report:** [GemmaEdge/REPORT_GemmaEdge_Spike.md](GemmaEdge/REPORT_GemmaEdge_Spike.md) ([HTML](GemmaEdge/REPORT_GemmaEdge_Spike.html))
* **Delivered:** In-memory behavioral vectorizer, 256d MRL projection, LoRA hot-swapping, zero-latency DOM mutator.

### [FrameMind Tier 1: Interactive Web/PWA Cinematography Testbed](FrameMind/index.html) `[COMPLETED]`
* **Live Testbed:** [FrameMind/index.html](FrameMind/index.html)
* **Executive Spike Report:** [FrameMind/REPORT_FrameMind_Spike.md](FrameMind/REPORT_FrameMind_Spike.md) ([HTML](FrameMind/REPORT_FrameMind_Spike.html))
* **Delivered:** Audio/ASR trajectory ingestion, 3 domain LoRAs hot-swapped in 0.047ms, 0.3ms shot directing, 60fps cubic-bezier 9:16 canvas reframing, zero network egress.

---

## 3. Accepted Architectural Options

### [Mobile Hybrid WebApp Wrapper & Zero-Cloud Offline Architecture](docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.md) `[ACCEPTED OPTION]`
* **Summary:** Official deployment pattern for running browser-first feature bricks inside native iOS/Android wrappers (Capacitor / WKWebView / PWA) with local asset bundling, OPFS binary storage, and zero cloud runtime egress.
* **Document Reference:** [docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.md](docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.md) (Companion: [docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.html](docs/PRODUCTION-OPTION-MOBILE-HYBRID-WRAPPER.html))

---

## 4. Immediate Active Queue (TODO)

### 1. Extract Shared Core Feature-Bricks Foundation `[TODO]`
* **Goal:** Factor out common on-edge SLM components (`slm-adapter-brick.js`, `lora-registry-brick.js`, `intent-matcher-brick.js`, and `brick-registry.js`) into a shared `core-bricks/` directory.
* **Benefit:** Ensures both GemmaEdge and FrameMind reuse the exact same runtime engine without duplication.

---

## 5. Engineering Backlog

### 1. 864zeros iOS Build-Kit & AVFoundation Camera Binding `[BACKLOG]`
* **Summary:** Create an official 864zeros iOS build-kit providing WKWebView / Capacitor native bridge plugins for Apple `AVCaptureDevice` hardware zoom, haptics, and Metal compute.
* **Status:** Deferred until Mac CI / cloud macOS runner is configured.

### 2. FrameMind Tier 2: Native Android CameraX Implementation `[BACKLOG]`
* **Summary:** Port the proven FrameMind feature bricks into the existing 864zeros Android build-kit using Kotlin, Google CameraX, and MediaPipe LLM Inference runtime.

### 3. GemmaEdge Workplace Internal Repo Extraction `[BACKLOG]`
* **Summary:** Package the white-labeled GemmaEdge package (free of LLC branding) for deployment to the user's internal enterprise GitHub organization.
