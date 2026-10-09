# FrameMind: On-Edge LoRA Fine-Tuning Pipeline

Zero-cost domain adapter training for Gemma-2 2B using Google Colab's free T4 GPU tier.

---

## Overview

FrameMind avoids shipping monolithic multi-gigabyte models for every video style. Instead, it utilizes a single on-device base SLM (Gemma-2 2B) and dynamically injects tiny, task-specific **LoRA (Low-Rank Adaptation)** weights (rank=8, alpha=16) measuring only ~3.1 MB.

* **Notebook:** [`Train_FrameMind_LoRA.ipynb`](Train_FrameMind_LoRA.ipynb)
* **Dataset:** [`synthetic_framing_dataset.json`](synthetic_framing_dataset.json)
* **HTML Documentation:** [`README.html`](README.html)

---

## Notebook Workflow

1. **Base Model Ingestion:** Loads `unsloth/gemma-2-2b-it` in 4-bit precision to fit within Colab's 15 GB VRAM limits.
2. **Low-Rank Injection:** Attaches trainable low-rank matrices to attention projections (`q_proj`, `k_proj`, `v_proj`, `o_proj`).
3. **Synthetic Dataset Training:** Trains on contrastive trajectory pairs in `synthetic_framing_dataset.json`.
4. **Export:** Emits an `adapter_model.safetensors` file (~3.1 MB) ready to be embedded into the mobile app bundle or PWA sandbox.

---

## Adapter Archetypes

* **Podcast & Banter LoRA:** Detects comedic punchlines, banter shifts, and laughter to trigger responsive zoom-ins.
* **Fitness Form LoRA:** Detects rep counts, posture cues, and cadence to trigger wide-angle stabilization and tempo pulses.
* **Keynote Presentation LoRA:** Detects rhetorical pauses, vision statements, and applause for slow cinematic pushes.
