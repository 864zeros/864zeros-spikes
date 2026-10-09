# FrameMind — Edge AI Automated Cinematography

On-device Small Language Model (SLM) & dynamic LoRA adapter engine for audio-reactive smart framing and automated editing.

---

## Quick Navigation

* **Interactive Showcase Portal:** [`index.html`](index.html) (Live dual-viewport visualizer with procedural studio scene, dynamic bezier crop, LoRA switcher, and on-edge telemetry HUD).
* **Executive Spike Report:** [`REPORT_FrameMind_Spike.md`](REPORT_FrameMind_Spike.md) ([HTML Version](REPORT_FrameMind_Spike.html)).
* **LoRA Training Pipeline:** [`notebooks/README.md`](notebooks/README.md) ([HTML Version](notebooks/README.html)).
* **Spike Integration Evaluation:** [`864zeros-spike-integration.md`](864zeros-spike-integration.md) ([HTML Version](864zeros-spike-integration.html)).

---

## Feature Bricks

1. `src/bricks/collector-audio-brick.js`: Ingests speech events, volume energy, and pauses.
2. `src/bricks/slm-cinematography-brick.js`: Vectorizes semantic trajectories and hot-swaps LoRA weights in <0.05ms.
3. `src/bricks/director-brick.js`: Intent engine evaluating editorial shot prototypes.
4. `src/bricks/framing-mutator-brick.js`: Renders smooth cubic-bezier camera transitions and safe 9:16 vertical crop.
5. `src/bricks/inspector-brick.js`: Zero-egress telemetry logger.
