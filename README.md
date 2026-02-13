<div align="center">

# microGPT.js

### The most atomic way to train and inference a GPT in pure, dependency-free JavaScript.

A complete transformer implementation — custom autograd engine, multi-head attention, Adam optimizer — all in a single file with zero ML dependencies. Faithful translation of [Karpathy's microgpt.py](https://gist.github.com/kylemath/58607dbafcf2315f9c958e1753f70fa9).

[![npm](https://img.shields.io/npm/v/microgptjs?style=flat-square&color=CB3837&logo=npm&logoColor=white)](https://www.npmjs.com/package/microgptjs)
[![Bundle Size](https://img.shields.io/badge/bundle-12.5kB-brightgreen?style=flat-square)](packages/microgptjs)
[![Zero Dependencies](https://img.shields.io/badge/dependencies-0-blue?style=flat-square)](packages/microgptjs/package.json)
[![Built with React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vite.dev)
[![Three.js](https://img.shields.io/badge/Three.js-3D-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)
[![Deploy to Netlify](https://img.shields.io/badge/Netlify-Ready-00C7B7?style=flat-square&logo=netlify&logoColor=white)](#deploy-to-netlify)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Ready-222222?style=flat-square&logo=github&logoColor=white)](#deploy-to-github-pages)

</div>

---

## Install the Toolbox

```bash
npm install microgptjs
```

That's it. Zero dependencies. Works in the browser, Node.js, Deno, Bun, and Web Workers.

---

## Hello World

```js
import { MicroGPT } from 'microgptjs';

// 1. Create a model
const model = new MicroGPT({
  nEmbd: 16,      // embedding dimension
  nHead: 4,       // attention heads
  nLayer: 1,      // transformer layers
  blockSize: 16,  // context window
  learningRate: 0.01,
  numSteps: 500,
});

// 2. Load training data (one example per line)
model.loadData(`alice
bob
charlie
david
emma
frank`);

// 3. Initialize parameters
const info = model.initParams();
console.log(`Model: ${info.numParams} params, vocab: ${info.vocabSize}`);

// 4. Train
for (let i = 0; i < 500; i++) {
  const { step, loss } = model.trainStep();
  if (step % 100 === 0) console.log(`Step ${step}: loss=${loss.toFixed(4)}`);
}

// 5. Generate
console.log(model.generate(0.8).text);  // → a new name!
```

Save as `hello.mjs` and run:

```bash
node hello.mjs
```

### What's in the box?

| Export | What it is |
|--------|-----------|
| `MicroGPT` | Full GPT — training, inference, embeddings, loss history |
| `Value` | Autograd scalar with computation graph and `.backward()` |
| `linear` | Matrix-vector multiply (`y = Wx`) |
| `softmax` | Numerically stable softmax |
| `rmsnorm` | RMS normalization |
| `SeededRandom` | Deterministic PRNG (Mulberry32) |

For full API docs, see the [package README](packages/microgptjs/README.md).

---

<div align="center">

## Interactive Demo

### Train a GPT — entirely in your browser.

Live training, inference, and stunning 3D visualizations.
No Python. No backend. No ML frameworks. Just your browser.

> **[Launch the demo](https://kylemath.github.io/microgptJS)**

</div>

---

## What is this?

This repo contains two things:

1. **`microgptjs`** — an [installable npm package](packages/microgptjs) with the pure-JS GPT toolbox
2. **The interactive demo** — a React app with 3D visualizations that uses the toolbox

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
git clone https://github.com/kylemath/microgptJS.git
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

## Deployment

The production build is a static site in `dist/`. Deploy it anywhere that serves static files.

### Deploy to Netlify

The repo includes a `netlify.toml` — just connect your repo and it works automatically.

**One-click:**

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/kylemath/microgptJS)

**Or manually:**

1. Push this repo to GitHub
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Select your repo — build settings are auto-detected from `netlify.toml`
4. Click **Deploy site**

### Deploy to GitHub Pages

1. Install the deploy dependency:

   ```bash
   npm install --save-dev gh-pages
   ```

2. Add a deploy script to `package.json`:

   ```json
   "scripts": {
     "deploy": "npm run build && gh-pages -d dist"
   }
   ```

3. Set the correct base path in `vite.config.js`:

   ```js
   export default defineConfig({
     base: '/<repo-name>/',   // e.g. '/microgptJS/'
     plugins: [react()],
   })
   ```

4. Deploy:

   ```bash
   npm run deploy
   ```

> **Tip:** If you're deploying to `<username>.github.io` (root), set `base: '/'` instead.

---

## Project Structure

```
microgptJS/
├── packages/
│   └── microgptjs/             # ← The npm package (installable toolbox)
│       ├── src/
│       │   ├── microgpt.js     # Core GPT: autograd, transformer, optimizer
│       │   ├── index.js        # Package entry point
│       │   └── index.d.ts      # TypeScript type definitions
│       ├── package.json        # npm package config
│       ├── vite.config.js      # Library build (ESM + CJS)
│       └── README.md           # Package documentation
├── src/                        # ← The interactive demo app
│   ├── main.jsx                # React entry point
│   ├── components/
│   │   ├── App.jsx             # Root app with tab navigation
│   │   ├── TrainingPanel       # Hyperparameter controls & training
│   │   ├── InferencePanel      # Text generation UI
│   │   ├── LossChart           # Canvas-based loss curve
│   │   ├── NetworkViz          # 3D transformer architecture
│   │   ├── AttentionViz        # 3D attention weight bars
│   │   ├── EmbeddingViz        # 3D token embedding scatter
│   │   ├── CodeComparison      # Python ↔ JS side-by-side
│   │   └── InstallGuide        # npm package install & usage guide
│   ├── lib/
│   │   └── microgpt.js         # (legacy — demo now imports from package)
│   ├── workers/
│   │   └── training.worker.js  # Off-thread training loop
│   ├── hooks/
│   │   └── useWorker.js        # React ↔ Worker bridge
│   ├── data/
│   │   ├── microgpt.py         # Original Python reference
│   │   └── pythonSource.js     # Annotated sections for comparison
│   └── styles/                 # Component CSS files
├── index.html                  # Entry HTML
├── vite.config.js              # Demo app Vite config
├── package.json                # Workspace root (npm workspaces)
└── netlify.toml                # Netlify deployment config
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

**[Live Demo](https://kylemath.github.io/microgptJS)** · **[Report Bug](https://github.com/kylemath/microgptJS/issues)** · **[Request Feature](https://github.com/kylemath/microgptJS/issues)**

Built with curiosity and JavaScript.

</div>
