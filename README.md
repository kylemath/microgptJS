<div align="center">

# microGPT.js

### Train a GPT — entirely in your browser.

A pure-JavaScript GPT implementation with live training, inference, and stunning 3D visualizations.  
No Python. No backend. No ML frameworks. Just your browser.

[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Deploy to Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=flat-square&logo=netlify&logoColor=white)](#deploy-to-netlify)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-222222?style=flat-square&logo=github&logoColor=white)](#deploy-to-github-pages)

---

> **Inspired by [Andrej Karpathy's microgpt.py](https://gist.github.com/kylemath/58607dbafcf2315f9c958e1753f70fa9)** — ported to JavaScript with a custom autograd engine, full transformer pipeline, and interactive visualizations.

</div>

---

## What is this?

**microGPT.js** is an educational, fully client-side GPT that trains on character-level data (names) right in your browser tab. It includes:

- A **custom autograd engine** written from scratch in JavaScript
- A complete **transformer architecture** — embeddings, multi-head attention, MLP, RMSNorm
- **Web Worker parallelism** so the UI stays responsive during training
- Beautiful **Three.js 3D visualizations** of the network, attention weights, and embeddings

---

## Features

| | Feature | Description |
|---|---|---|
| **Train** | Live Training | Watch the loss curve drop in real time as the model learns |
| **Tune** | Hyperparameters | Configure embedding dim, heads, layers, block size, learning rate, and steps |
| **Generate** | Inference | Sample new names with adjustable temperature and count |
| **See** | 3D Architecture | Fly through the transformer: Embedding → RMSNorm → Attention → MLP → Logits |
| **Inspect** | Attention Weights | 3D bar charts of per-head, per-position attention patterns |
| **Explore** | Embedding Space | 3D scatter plot of token embeddings colored by character type |
| **Compare** | Code Side-by-Side | Python vs JavaScript with syntax highlighting and section tabs |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | **React 19** |
| Build | **Vite 7** |
| 3D | **Three.js** via `@react-three/fiber` + `@react-three/drei` |
| Code Display | `react-syntax-highlighter` (Prism + One Dark) |
| ML | Custom autograd, attention, Adam optimizer — **zero external ML deps** |
| Parallelism | **Web Workers** for off-thread training |

---

## Quick Start

```bash
# Clone the repo
git clone https://github.com/<your-username>/microgptJS.git
cd microgptJS

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Open **http://localhost:5173** and start training!

### Other Commands

```bash
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # Run ESLint
```

---

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                          App.jsx                             │
│            Tabs: Train & Visualize │ Code Comparison          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐   ┌──────────────────────────────────┐ │
│  │  Sidebar         │   │  Visualizations                  │ │
│  │  TrainingPanel   │   │  LossChart · NetworkViz          │ │
│  │  InferencePanel  │   │  AttentionViz · EmbeddingViz     │ │
│  └────────┬─────────┘   └──────────────────────────────────┘ │
│           │                          ▲                       │
│           └──── useWorker() ─────────┘                       │
│                      │                                       │
│                      ▼                                       │
│            training.worker.js                                │
│            └── lib/microgpt.js  (autograd + transformer)     │
└──────────────────────────────────────────────────────────────┘
```

**Data flow:** `useWorker` spawns a Web Worker that imports the full GPT implementation. The worker handles init, training steps, inference, and embedding extraction — posting results back to React state, which drives all charts and 3D scenes.

---

## Project Structure

```
microgptJS/
├── index.html              # Entry HTML
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies & scripts
├── netlify.toml            # Netlify deployment config
├── public/
│   ├── vite.svg
│   └── _redirects          # Netlify SPA fallback
└── src/
    ├── main.jsx            # React entry point
    ├── components/
    │   ├── App.jsx         # Root app with tab navigation
    │   ├── TrainingPanel   # Hyperparameter controls & training
    │   ├── InferencePanel  # Text generation UI
    │   ├── LossChart       # Canvas-based loss curve
    │   ├── NetworkViz      # 3D transformer architecture
    │   ├── AttentionViz    # 3D attention weight bars
    │   ├── EmbeddingViz    # 3D token embedding scatter
    │   └── CodeComparison  # Python ↔ JS side-by-side
    ├── lib/
    │   └── microgpt.js     # Core GPT: autograd, layers, optimizer
    ├── workers/
    │   └── training.worker.js  # Off-thread training loop
    ├── hooks/
    │   └── useWorker.js    # React ↔ Worker bridge
    ├── data/
    │   ├── microgpt.py     # Original Python reference
    │   └── pythonSource.js # Annotated sections for comparison
    └── styles/             # Component CSS files
```

---

## How It Works

1. **Autograd Engine** — Every tensor operation is tracked in a computation graph. Calling `.backward()` propagates gradients through the entire network.

2. **Transformer Forward Pass** — Input tokens → embeddings → repeated blocks of (RMSNorm → Multi-Head Attention → RMSNorm → MLP) → final logits.

3. **Training** — The Adam optimizer updates all parameters to minimize cross-entropy loss on the character-level names dataset.

4. **Inference** — Autoregressive generation: feed a start token, sample from the output distribution (with temperature), append, repeat.

5. **Visualization** — Three.js scenes render the architecture, attention matrices, and embedding space in real time as training progresses.

---

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feat/amazing-feature`)
5. Open a Pull Request

---

## License

MIT — do whatever you want with it.

---

<div align="center">

**[Live Demo](#)** · **[Report Bug](../../issues)** · **[Request Feature](../../issues)**

Built with curiosity and JavaScript.

</div>
