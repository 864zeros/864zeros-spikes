# GemmaEdge — On-Edge Personalization & SLM Engine

**Local-First Engineering Intelligence | Pillar: Edge AI & Privacy-First Personalization**  
*A modular, zero-cloud architecture for client-side intent qualification, dynamic UI adaptation, and on-device SLM execution.*

---

## 🌟 Overview & GitHub Pages Portal

**GemmaEdge** inverts the traditional cloud behavioral analytics stack (e.g., Adobe `alloy.js` + Customer Journey Analytics + Adobe Target). 

The GitHub Pages portal ([`index.html`](index.html)) provides an all-in-one developer showcase featuring:
1. **🕹️ Interactive Live Testbed:** 1-Click persona simulations, in-session clickstream tracking, and real-time DOM mutation.
2. **📊 Architecture & Executive Report:** Embedded SVG architecture diagrams, layman summaries, and cloud-vs-edge comparison matrices.
3. **🧠 LoRA Pipeline (Colab):** 1-Click free Google Colab notebook badge to train custom ~3MB domain adapters in 4 minutes for $0.
4. **🧱 Feature Bricks API:** Modular breakdown of the 5 decoupled, zero-dependency lego bricks.

---

## 🛡️ Core Principles (864zeros DNA)

1. **KISS (Keep It Simple, Stupid):** Built as modular, single-responsibility lego bricks with zero external runtime dependencies.
2. **100% Air-Gapped Privacy:** In-memory ring buffer. No cloud telemetry, no third-party cookies, no tracking beacons. Fully immune to ad-blockers, Safari ITP, and GDPR/CCPA restrictions.
3. **OIA Design System v1.0:** Warm neutral palette (Cream `#F5F2ED`, Warm White `#FDFCFA`, Sage `#8BA888`, Coral `#E8A598`, Slate `#475569`, Nunito typography).
4. **ADHD-Friendly UX:** Calm, single-focus interactions, zero guilt/shaming copy, large interactive targets, and smooth crossfades without layout jumps.

---

## 🧱 The 5 Re-Usable Feature Bricks

```
┌─────────────────────────────────────────────────────────────┐
│                 864zeros Feature-Brick Pipeline             │
│                                                             │
│  [Brick: Collector] ──> [Brick: SLM Engine] ──> [Brick: CJA]│
│   (XDM Clickstream)      (Pluggable Adapter)     (Segments) │
│                                                      │      │
│                                                      ▼      │
│                                            [Brick: Mutator] │
│                                             (Instant UI)    │
└─────────────────────────────────────────────────────────────┘
```

* 🧱 **Brick 1: `collector-brick.js` (XDM-Lite Ingestion)**
  * Captures browser interactions (`pageView`, `click`, `scroll`, `search`) into a strongly-typed XDM-Lite schema.
  * Maintains an in-memory rolling ring buffer that synthesizes raw clicks into a natural behavioral trajectory narrative.
* 🧱 **Brick 2: `slm-adapter-brick.js` (Pluggable Model Contract)**
  * Standard interface: `embed(text) => Promise<Float32Array>`.
  * Features **Matryoshka Representation Learning (MRL)** truncation (down to 256d/128d) and a deterministic local semantic projection engine.
  * Can swap in WebGPU Gemma 270M, LiteRT Android/iOS bridges, or BitNet ternary models without changing consumer code.
* 🧱 **Brick 3: `segmenter-brick.js` (On-Edge CJA Classifier)**
  * Evaluates the intent vector against natural-language Segment Prototypes via cosine similarity:
    * *Technical / Developer Evaluator*
    * *Enterprise Decision Maker*
    * *Price-Sensitive Explorer*
    * *Urgent Support / Crisis Seeker*
* 🧱 **Brick 4: `mutator-brick.js` (Zero-Latency UI Personalizer)**
  * Listens for qualified segments and smoothly adapts hero headlines, copy, badges, and CTAs in `<15ms` without DOM flicker.
* 🧱 **Brick 5: `inspector-brick.js` & Testbed Shell (`index.html`)**
  * Real-time split-screen diagnostic inspector displaying live XDM payloads, trajectory strings, vector angles, and a **"Network: 0 Bytes Transmitted"** air-gap meter.

---

## 🧪 Verification & Test Results

Run the automated test suite in Node.js:

```bash
npm test
# or: node tests/test-bricks.js
```

### Verified Benchmark Output:
* **MRL Truncation:** Unit-normalized 256d and 128d output verified.
* **Developer Trajectory:** Classified as *Technical / Developer Evaluator* (Score: `0.912`, Latency: `1.07 ms`).
* **Bargain Hunter Trajectory:** Classified as *Price-Sensitive Explorer* (Score: `0.940`, Latency: `0.42 ms`).
* **Urgent Support Trajectory:** Classified as *Urgent Support / Crisis Seeker* (Score: `0.900`, Latency: `0.71 ms`).

---

## 🚀 How to Run the Interactive Testbed

### Option 1: Live Dev Server (Active Now)
The zero-dependency static server is currently running:
👉 **[http://localhost:8640](http://localhost:8640)**

*(To start or restart manually: `node server.js`)*

### Option 2: Direct Local File (Zero-Server)
You can also open [`index.html`](file:///C:/dev/864zeros-spikes/GemmaEdge/index.html) directly via `file://` in any modern browser. All 5 feature bricks are self-contained and run without external dependencies.
