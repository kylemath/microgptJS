# microgptjs

The most atomic way to train and inference a GPT in pure, dependency-free JavaScript.

A faithful translation of [Karpathy's microgpt.py](https://gist.github.com/kylemath/58607dbafcf2315f9c958e1753f70fa9) — a complete transformer implementation with a custom autograd engine, all in a single file.

## Features

- **Zero dependencies** — no TensorFlow, no PyTorch, no ONNX. Just JavaScript.
- **Complete autograd engine** — scalar-level automatic differentiation with backpropagation
- **Full transformer** — token/position embeddings, multi-head attention, MLP blocks, RMS normalization
- **Adam optimizer** — with learning rate decay
- **Character-level language model** — trains on any newline-separated text
- **Visualization-ready** — collects attention weights, embeddings, and activations during forward passes
- **Works everywhere** — browser, Node.js, Web Workers, Deno, Bun

## Install

```bash
npm install microgptjs
```

## Quick Start

```js
import { MicroGPT } from 'microgptjs';

// 1. Create a model
const model = new MicroGPT({
  nEmbd: 16,      // embedding dimension
  nHead: 4,       // number of attention heads
  nLayer: 1,      // number of transformer layers
  blockSize: 16,  // context window size
  learningRate: 0.01,
  numSteps: 500,
});

// 2. Load training data (newline-separated strings)
model.loadData(`alice
bob
charlie
david
emma
frank`);

// 3. Initialize parameters
const info = model.initParams();
console.log(`Model has ${info.numParams} parameters`);

// 4. Train
for (let i = 0; i < 500; i++) {
  const result = model.trainStep();
  if (i % 50 === 0) {
    console.log(`Step ${result.step}: loss=${result.loss.toFixed(4)}`);
  }
}

// 5. Generate
const sample = model.generate(0.5);
console.log(`Generated: ${sample.text}`);
```

## API Reference

### `new MicroGPT(options?)`

Create a new model instance.

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `seed` | `number` | `42` | Random seed for reproducibility |
| `nEmbd` | `number` | `16` | Embedding dimension |
| `nHead` | `number` | `4` | Number of attention heads |
| `nLayer` | `number` | `1` | Number of transformer layers |
| `blockSize` | `number` | `16` | Maximum context length |
| `learningRate` | `number` | `0.01` | Initial learning rate |
| `numSteps` | `number` | `1000` | Total steps (for LR decay schedule) |

### `model.loadData(text)`

Load training data as a newline-separated string. Each line becomes one training document.

### `model.initParams()`

Initialize all model parameters. Returns `{ numParams, vocabSize, numDocs }`.

### `model.trainStep()`

Run one training step (forward pass, loss, backward pass, Adam update). Returns:

```js
{
  step: number,
  loss: number,
  doc: string,           // training document used
  tokens: number[],      // tokenized document
  learningRate: number,  // current LR after decay
  paramStats: { mean, std },
  vizData: [...]         // per-position visualization data
}
```

### `model.generate(temperature?)`

Generate text autoregressively. Returns `{ text, tokens, vizData }`.

- `temperature` (default `0.5`) — higher = more random, lower = more deterministic

### `model.getLossHistory()`

Returns an array of loss values from all training steps.

### `model.getEmbeddings()`

Returns token embedding vectors for visualization.

### `model.getConfig()`

Returns the current model configuration.

### Low-level exports

For advanced use, the building blocks are also exported:

```js
import { Value, linear, softmax, rmsnorm, SeededRandom } from 'microgptjs';

// Value — autograd scalar
const a = new Value(2.0);
const b = new Value(3.0);
const c = a.mul(b).add(a);  // c = 2*3 + 2 = 8
c.backward();
console.log(a.grad); // dc/da = b + 1 = 4

// SeededRandom — reproducible PRNG
const rng = new SeededRandom(42);
console.log(rng.random());      // deterministic float
console.log(rng.gauss(0, 1));   // gaussian sample

// linear, softmax, rmsnorm — model building blocks
```

## Use with Web Workers

```js
// worker.js
import { MicroGPT } from 'microgptjs';

let model = null;

self.onmessage = (e) => {
  if (e.data.type === 'init') {
    model = new MicroGPT(e.data.options);
    model.loadData(e.data.text);
    model.initParams();
    self.postMessage({ type: 'ready' });
  }

  if (e.data.type === 'train') {
    const result = model.trainStep();
    self.postMessage({ type: 'step', result });
  }
};
```

## Use with Node.js

```js
import { MicroGPT } from 'microgptjs';
import { readFileSync } from 'fs';

const text = readFileSync('names.txt', 'utf8');
const model = new MicroGPT({ nEmbd: 32, nHead: 4, nLayer: 2 });
model.loadData(text);
model.initParams();

for (let i = 0; i < 1000; i++) {
  const { step, loss } = model.trainStep();
  if (step % 100 === 0) console.log(`Step ${step}: loss=${loss.toFixed(4)}`);
}

for (let i = 0; i < 10; i++) {
  console.log(model.generate(0.8).text);
}
```

## How It Works

This is a character-level GPT that learns to generate text one character at a time:

1. **Autograd Engine** (`Value` class) — Every number is wrapped in a `Value` that tracks the computation graph. Calling `.backward()` propagates gradients through the entire graph via reverse-mode autodiff.

2. **Transformer Architecture** — Standard GPT: token embeddings + positional embeddings → N layers of (multi-head self-attention + MLP) → output logits.

3. **Training** — Cross-entropy loss on next-character prediction, optimized with Adam.

4. **Generation** — Autoregressive sampling with temperature-scaled softmax.

## License

MIT
