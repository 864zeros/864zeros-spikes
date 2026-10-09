# 864zeros Production Option: Mobile Hybrid WebApp Wrapper & Zero-Cloud Offline Architecture

> **Status:** Accepted Official Production Option  
> **Applicability:** `GemmaEdge`, `FrameMind`, and 864zeros On-Edge SLM Fleet  
> **Classification:** Architectural Decision Record (ADR)  

---

### 1. Does iOS have a web app (SPA) mobile wrapper for quick creation?

**Yes.** There are three modern ways this is done on iOS:

1. **Capacitor (by Ionic) — *The Modern Industry Standard*:**
   * Capacitor is the modern successor to the old PhoneGap/Cordova era. 
   * It takes your compiled SPA folder (`dist/` or `index.html + bundle.js`) and drops it directly into a standard iOS Xcode project using Apple’s high-performance **`WKWebView`** engine.
   * It provides plug-and-play JavaScript APIs to call native iOS device features (Camera, Haptics, Filesystem, Biometrics) directly from your JS code.
2. **Raw Native `WKWebView` Shell (10–15 Lines of Swift):**
   * If you don't want any third-party framework, you can open Xcode, create a blank iOS project, and load your web app into a single native `WKWebView`. 
   * JavaScript talks to native Swift via Apple's built-in message bus:
     ```javascript
     // In your JS: Send intent to iOS native camera
     window.webkit.messageHandlers.cameraZoom.postMessage({ factor: 1.4 });
     ```
3. **PWA (Progressive Web App) — Zero Xcode Needed:**
   * iOS Safari supports **"Add to Home Screen"**. 
   * When configured with a `manifest.json` setting `"display": "standalone"`, the browser URL bar, tabs, and navigation chrome completely disappear. It launches from an app icon on the home screen and looks/feels identical to a native app.

---

### 2. Does the web app have to be available online / in the cloud?

**No. 100% False.** A wrapper app does **not** need to touch the cloud or be hosted on a remote server.

There are two offline architectures:

* **Inside a Wrapper (Capacitor / Native Shell): Local Bundling**
  * Your HTML, JS, CSS, and even your Gemma `.safetensors` model weights are placed inside the iOS app’s local bundle directory.
  * When the app opens, `WKWebView` loads the files locally via a simulated internal scheme (e.g., `capacitor://localhost` or `local://index.html`).
  * **Result:** It runs 100% in airplane mode with zero internet connection, zero network latency, and zero server hosting costs.
* **As a Browser PWA: The Cache API / Service Worker**
  * Even if you initially distribute via a web link, a **Service Worker** intercepts all network requests and caches the HTML, JS, and model weights into the device’s local sandbox storage.
  * After the first load, the app runs completely offline forever.

---

### 3. What is the modern crossover from Web App to Mobile App?

Over the last 3–4 years, the gap between "web app" and "native app" has shrunk dramatically due to modern W3C browser standards:

| Capability | In Pure Web / PWA (Browser) | In a Native iOS Wrapper (Capacitor / WKWebView) | In Pure Native (Swift / Kotlin) |
| :--- | :--- | :--- | :--- |
| **GPU / AI Inference** | **WebGPU** (direct hardware compute shaders on Apple Silicon M-series/A-series) | WebGPU inside WKWebView or native bridge to Apple Metal / CoreML | Full Metal / CoreML / ExecuTorch |
| **Video & Media Processing** | **WebCodecs API** (hardware-accelerated 60fps encode/decode) | WebCodecs + Native `AVFoundation` | Direct `AVFoundation` / `CameraX` |
| **Local Large Storage** | **OPFS (Origin Private File System)** — multi-gigabyte local binary storage for SLM weights | Direct local filesystem access | Direct filesystem access |
| **Look & Feel** | Full-screen, smooth 60–120Hz CSS transforms, touch gestures | Indistinguishable from native UI | Native UI controls |
| **Hardware Camera Control** | Basic digital zoom & resolution via `MediaStreamTrack` | Full native hardware control via JS $\leftrightarrow$ Swift bridge | Full native hardware control |

---

### Summary: What This Means for GemmaEdge & FrameMind

If you wanted to turn **GemmaEdge** or **FrameMind** into an iOS app tomorrow:
1. **You do NOT need a cloud backend.** The web app assets, the Gemma SLM runtime, and the LoRA weights live inside the phone's local storage.
2. **You do NOT need to rewrite the app in Swift.** A modern hybrid wrapper (like Capacitor or a simple `WKWebView` shell) lets 95% of our codebase remain the exact same JavaScript/WebAssembly feature-bricks we are building today, while bridging only the specific camera zoom or haptic commands to native code when needed.
