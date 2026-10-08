# GemmaEdge: Free LoRA Training Pipeline & Dual-Track Workflow

## 🌟 The Philosophy: 100% Free for Everyone

Anyone who downloads or clones the `GemmaEdge` repository can run the entire personalization testbed **completely free** on their own local machine with **zero external API keys, zero cloud subscriptions, and zero infrastructure bills**.

If users or colleagues want to train their own specialized domain LoRA adapters, they do **not** need a paid GPU cluster or expensive hardware:
* The training notebook ([`Train_GemmaEdge_LoRA.ipynb`](Train_GemmaEdge_LoRA.ipynb)) runs **100% free on Google Colab's standard T4 GPU tier**.
* In **under 5 minutes**, it outputs a tiny **3MB to 5MB LoRA adapter file** that downloads straight to their browser.

---

## ⚡ The Dual-Track R&D Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                    DUAL-TRACK R&D ENGINE                    │
│                                                             │
│  [Track 1: R&D Acceleration] (You / Gemini Ultra)           │
│  - Synthesize 500+ rich contrastive training pairs          │
│  - Formulate hyper-specific edge domain taxonomies          │
│                                                             │
│  [Track 2: Free Public Execution] (Colleagues / Open Users) │
│  - Open Train_GemmaEdge_LoRA.ipynb in Google Colab (Free T4)│
│  - 1-Click "Run All" (Takes ~4 minutes, Costs $0.00)        │
│  - Downloads 3MB `gemmaedge-lora-adapter.zip`               │
│                                                             │
│  [Edge Deployment]                                          │
│  - Drop 3MB adapter into GemmaEdge local folder             │
│  - 100% Air-Gapped, Zero Network Egress                     │
└─────────────────────────────────────────────────────────────┘
```

### **Track 1: High-Speed Acceleration via Gemini Ultra (You)**
* Use your **Gemini Ultra / Advanced** subscription as an **R&D data factory**:
  * Generate hundreds of nuanced, edge-case behavioral clickstream sequences.
  * Construct realistic multi-intent user journeys (e.g. *"Enterprise security engineer on a budget with urgent Friday deadline"*).
  * Export clean JSON pairs (`anchor` trajectory $\leftrightarrow$ `positive` domain prototype).

### **Track 2: Frictionless Free Execution (Any User / Colleague)**
* Anyone can open [`Train_GemmaEdge_LoRA.ipynb`](Train_GemmaEdge_LoRA.ipynb) directly in Google Colab.
* Click **Runtime $\rightarrow$ Run all**.
* The notebook:
  1. Installs open-source libraries (`peft`, `sentence-transformers`, `bitsandbytes`).
  2. Loads the base SLM.
  3. Trains LoRA rank-8 adapter weights using contrastive `MultipleNegativesRankingLoss`.
  4. Automatically downloads `gemmaedge-lora-adapter.zip` (~3MB) directly to their browser.
* They drop the unzipped adapter into their local `GemmaEdge` directory for zero-latency, private edge inference.

---

## 🚀 How to Run the Notebook in Google Colab

1. Open [Google Colab](https://colab.research.google.com).
2. Click **Upload** and select [`Train_GemmaEdge_LoRA.ipynb`](Train_GemmaEdge_LoRA.ipynb).
3. Ensure GPU acceleration is enabled: **Runtime $\rightarrow$ Change runtime type $\rightarrow$ T4 GPU**.
4. Click **Runtime $\rightarrow$ Run all**.
5. Once complete, your browser will prompt you to save the generated `gemmaedge-lora-adapter.zip`.
