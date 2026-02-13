# microGPT.js Tweet Thread

## Tweet 1 / Thread Opener (Hook)

I ported @karpathy's microgpt.py to JavaScript and published it as an npm package.

Train a GPT from scratch. In your browser. In 10 lines of code. Zero dependencies.

npm install microgptjs

Thread below

**Image:** Hero banner (microgptjs-hero-banner.png)

---

## Tweet 2 / Hello World

The whole thing fits in your head.

```
import { MicroGPT } from 'microgptjs';

const model = new MicroGPT({ nEmbd: 16, nHead: 4, nLayer: 1 });
model.loadData("alice\nbob\ncharlie\ndavid");
model.initParams();

for (let i = 0; i < 500; i++) model.trainStep();

console.log(model.generate(0.8).text);
```

That's it. Custom autograd, multi-head attention, Adam optimizer, character-level generation. All from `npm install`.

**Image:** npm Package tab screenshot

---

## Tweet 3 / Python vs JS Comparison

Faithful line-by-line translation. Left: @karpathy's Python. Right: JavaScript.

The autograd engine, softmax, RMSNorm, the full transformer forward pass -- it all maps 1:1.

The demo even has a side-by-side code comparison tab so you can see exactly how each piece translates.

**Image:** Screenshot of Code Comparison tab showing Python vs JS side by side

---

## Tweet 4 / The Web Demo

But why stop at a CLI? I built an interactive demo that trains it live in your browser with 3D visualizations:

- Watch the loss curve drop in real time
- Fly through the transformer architecture in 3D
- Inspect attention weight patterns per head
- Explore the token embedding space as a 3D scatter plot

Try it: kylemath.github.io/microgptJS

**Image:** Full demo screenshot (loss chart, 3D architecture, attention weights, embeddings, generated names)

---

## Tweet 5 / Under the Hood

What's inside:

- Value class: scalar autograd with .backward() (same idea as PyTorch)
- Full transformer: token + position embeddings, multi-head self-attention, MLP, RMSNorm
- Adam optimizer with LR decay
- 12.5 kB. Zero deps. Works in Node, Deno, Bun, browsers, Web Workers.

4,192 parameters learning to generate names from scratch.

**Image:** Zoomed training view showing 3D model architecture and attention weights

---

## Tweet 6 / CTA + Credits

It's MIT licensed, on npm, and the demo is live:

npm: npmjs.com/package/microgptjs
Demo: kylemath.github.io/microgptJS
Source: github.com/kylemath/microgptJS

Thank you @karpathy for making the original microgpt.py -- the most educational 150 lines of ML I've ever read. This is my attempt to bring that to the JavaScript world.

**Image:** No image needed, or repeat the hero banner
