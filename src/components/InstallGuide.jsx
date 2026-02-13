import { useState } from 'react';
import '../styles/InstallGuide.css';

/**
 * Install guide tab — shows how to install and use the microgptjs npm package.
 */

const CODE_SNIPPETS = {
  install: `npm install microgptjs`,
  helloWorld: `import { MicroGPT } from 'microgptjs';

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
model.loadData(\`alice
bob
charlie
david
emma
frank\`);

// 3. Initialize parameters
const info = model.initParams();
console.log(\`Model: \${info.numParams} params, vocab: \${info.vocabSize}\`);

// 4. Train
for (let i = 0; i < 500; i++) {
  const { step, loss } = model.trainStep();
  if (step % 100 === 0) console.log(\`Step \${step}: loss=\${loss.toFixed(4)}\`);
}

// 5. Generate
console.log(model.generate(0.8).text);  // → a new name!`,
  autograd: `import { Value } from 'microgptjs';

// Build a tiny computation graph
const a = new Value(2.0);
const b = new Value(3.0);
const c = a.mul(b).add(a);  // c = 2*3 + 2 = 8

// Backpropagate
c.backward();

console.log(c.data);   // 8
console.log(a.grad);   // dc/da = b + 1 = 4
console.log(b.grad);   // dc/db = a = 2`,
  nodeJs: `import { MicroGPT } from 'microgptjs';
import { readFileSync } from 'fs';

const text = readFileSync('names.txt', 'utf8');
const model = new MicroGPT({ nEmbd: 32, nHead: 4, nLayer: 2 });
model.loadData(text);
model.initParams();

for (let i = 0; i < 1000; i++) {
  const { step, loss } = model.trainStep();
  if (step % 100 === 0) console.log(\`Step \${step}: loss=\${loss.toFixed(4)}\`);
}

for (let i = 0; i < 10; i++) {
  console.log(model.generate(0.8).text);
}`,
  webWorker: `// worker.js
import { MicroGPT } from 'microgptjs';

let model = null;

self.onmessage = (e) => {
  const { type, payload } = e.data;

  if (type === 'init') {
    model = new MicroGPT(payload.options);
    model.loadData(payload.text);
    const info = model.initParams();
    self.postMessage({ type: 'ready', info });
  }

  if (type === 'train') {
    const result = model.trainStep();
    self.postMessage({ type: 'step', result });
  }

  if (type === 'generate') {
    const sample = model.generate(payload.temperature);
    self.postMessage({ type: 'generated', sample });
  }
};`,
  browser: `<script type="module">
  import { MicroGPT } from 'https://esm.sh/microgptjs';

  const model = new MicroGPT({ nEmbd: 16, nHead: 4, nLayer: 1 });
  model.loadData('hello\\nworld\\nfoo\\nbar');
  model.initParams();

  for (let i = 0; i < 200; i++) model.trainStep();

  document.body.textContent = model.generate(0.8).text;
</script>`,
};

const SECTIONS = [
  {
    id: 'quickstart',
    title: 'Quick Start',
    icon: '>>',
  },
  {
    id: 'autograd',
    title: 'Autograd Engine',
    icon: 'dx',
  },
  {
    id: 'environments',
    title: 'Environments',
    icon: '{}',
  },
  {
    id: 'api',
    title: 'API Reference',
    icon: 'fn',
  },
];

export default function InstallGuide() {
  const [activeSection, setActiveSection] = useState('quickstart');

  return (
    <div className="install-guide">
      <div className="install-guide__header">
        <h2>
          <span className="install-guide__pkg-name">microgptjs</span> npm Package
        </h2>
        <p className="install-guide__tagline">
          The most atomic way to train and inference a GPT in pure, dependency-free JavaScript.
        </p>

        <div className="install-guide__badges">
          <span className="badge badge--npm">npm</span>
          <span className="badge badge--size">12.5 kB</span>
          <span className="badge badge--deps">0 deps</span>
          <span className="badge badge--types">TypeScript</span>
        </div>
      </div>

      {/* Install command */}
      <div className="install-guide__install-box">
        <div className="install-box__label">Install</div>
        <div className="install-box__command">
          <code>npm install microgptjs</code>
          <button
            className="install-box__copy"
            onClick={() => navigator.clipboard?.writeText('npm install microgptjs')}
            title="Copy to clipboard"
          >
            copy
          </button>
        </div>
      </div>

      {/* Section navigation */}
      <nav className="install-guide__nav">
        {SECTIONS.map((section) => (
          <button
            key={section.id}
            className={`install-nav-tab ${activeSection === section.id ? 'install-nav-tab--active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="install-nav-tab__icon">{section.icon}</span>
            {section.title}
          </button>
        ))}
      </nav>

      {/* Content sections */}
      <div className="install-guide__content">
        {activeSection === 'quickstart' && (
          <div className="install-section">
            <h3>Hello World</h3>
            <p className="install-section__desc">
              Create a model, load data, train, and generate — all in a few lines.
              Save this as <code>hello.mjs</code> and run with <code>node hello.mjs</code>.
            </p>
            <CodeBlock code={CODE_SNIPPETS.helloWorld} language="javascript" />

            <h3>What it does</h3>
            <div className="install-section__steps">
              <div className="step-card">
                <div className="step-card__number">1</div>
                <div className="step-card__content">
                  <strong>Create</strong> — Configure embedding size, attention heads, layers, and learning rate
                </div>
              </div>
              <div className="step-card">
                <div className="step-card__number">2</div>
                <div className="step-card__content">
                  <strong>Load</strong> — Feed in newline-separated text. Each line is a training document
                </div>
              </div>
              <div className="step-card">
                <div className="step-card__number">3</div>
                <div className="step-card__content">
                  <strong>Init</strong> — Randomly initialize all parameters (returns param count and vocab size)
                </div>
              </div>
              <div className="step-card">
                <div className="step-card__number">4</div>
                <div className="step-card__content">
                  <strong>Train</strong> — Each <code>trainStep()</code> does a full forward + backward + Adam update
                </div>
              </div>
              <div className="step-card">
                <div className="step-card__number">5</div>
                <div className="step-card__content">
                  <strong>Generate</strong> — Autoregressive sampling with temperature control
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'autograd' && (
          <div className="install-section">
            <h3>The Value Class</h3>
            <p className="install-section__desc">
              Every number in the model is a <code>Value</code> — a scalar that tracks the computation
              graph. Calling <code>.backward()</code> propagates gradients through the entire graph
              via reverse-mode automatic differentiation. This is the same idea behind PyTorch's autograd.
            </p>
            <CodeBlock code={CODE_SNIPPETS.autograd} language="javascript" />

            <h3>Supported Operations</h3>
            <div className="install-section__grid">
              <div className="op-card">
                <code>.add(other)</code>
                <span>Addition</span>
              </div>
              <div className="op-card">
                <code>.mul(other)</code>
                <span>Multiplication</span>
              </div>
              <div className="op-card">
                <code>.sub(other)</code>
                <span>Subtraction</span>
              </div>
              <div className="op-card">
                <code>.div(other)</code>
                <span>Division</span>
              </div>
              <div className="op-card">
                <code>.pow(n)</code>
                <span>Exponentiation</span>
              </div>
              <div className="op-card">
                <code>.log()</code>
                <span>Natural log</span>
              </div>
              <div className="op-card">
                <code>.exp()</code>
                <span>Exponential</span>
              </div>
              <div className="op-card">
                <code>.relu()</code>
                <span>ReLU activation</span>
              </div>
              <div className="op-card">
                <code>.neg()</code>
                <span>Negation</span>
              </div>
              <div className="op-card">
                <code>.backward()</code>
                <span>Backpropagate</span>
              </div>
            </div>

            <h3>Model Building Blocks</h3>
            <p className="install-section__desc">
              On top of <code>Value</code>, the package exports the neural network primitives used to build the transformer:
            </p>
            <div className="install-section__grid install-section__grid--wide">
              <div className="op-card op-card--wide">
                <code>linear(x, W)</code>
                <span>Matrix-vector multiply: y = Wx</span>
              </div>
              <div className="op-card op-card--wide">
                <code>softmax(logits)</code>
                <span>Numerically stable softmax over an array of Values</span>
              </div>
              <div className="op-card op-card--wide">
                <code>rmsnorm(x)</code>
                <span>RMS normalization (used instead of LayerNorm)</span>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'environments' && (
          <div className="install-section">
            <h3>Node.js</h3>
            <p className="install-section__desc">
              Train on your own text files from the command line.
            </p>
            <CodeBlock code={CODE_SNIPPETS.nodeJs} language="javascript" />

            <h3>Web Workers</h3>
            <p className="install-section__desc">
              Run training off the main thread so the UI stays responsive.
              This is exactly how the demo app on this page works.
            </p>
            <CodeBlock code={CODE_SNIPPETS.webWorker} language="javascript" />

            <h3>Browser (via CDN)</h3>
            <p className="install-section__desc">
              No bundler needed — import directly from a CDN like esm.sh.
            </p>
            <CodeBlock code={CODE_SNIPPETS.browser} language="html" />

            <div className="install-section__compat">
              <h4>Compatibility</h4>
              <div className="compat-grid">
                <div className="compat-item compat-item--yes">Node.js 18+</div>
                <div className="compat-item compat-item--yes">Deno</div>
                <div className="compat-item compat-item--yes">Bun</div>
                <div className="compat-item compat-item--yes">Chrome / Edge</div>
                <div className="compat-item compat-item--yes">Firefox</div>
                <div className="compat-item compat-item--yes">Safari 15+</div>
                <div className="compat-item compat-item--yes">Web Workers</div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'api' && (
          <div className="install-section">
            <h3>MicroGPT Constructor Options</h3>
            <div className="api-table-wrap">
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Option</th>
                    <th>Type</th>
                    <th>Default</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>seed</code></td><td>number</td><td>42</td><td>Random seed for reproducibility</td></tr>
                  <tr><td><code>nEmbd</code></td><td>number</td><td>16</td><td>Embedding dimension</td></tr>
                  <tr><td><code>nHead</code></td><td>number</td><td>4</td><td>Number of attention heads</td></tr>
                  <tr><td><code>nLayer</code></td><td>number</td><td>1</td><td>Number of transformer layers</td></tr>
                  <tr><td><code>blockSize</code></td><td>number</td><td>16</td><td>Maximum context length</td></tr>
                  <tr><td><code>learningRate</code></td><td>number</td><td>0.01</td><td>Initial learning rate</td></tr>
                  <tr><td><code>numSteps</code></td><td>number</td><td>1000</td><td>Total steps (for LR decay schedule)</td></tr>
                </tbody>
              </table>
            </div>

            <h3>Instance Methods</h3>
            <div className="api-methods">
              <div className="api-method">
                <div className="api-method__sig"><code>model.loadData(text: string)</code></div>
                <p>Load training data as a newline-separated string. Each line becomes one training document. Builds the character vocabulary automatically.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.initParams()</code></div>
                <p>Initialize all model parameters randomly. Returns <code>{'{ numParams, vocabSize, numDocs }'}</code>. Must be called after <code>loadData()</code>.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.trainStep()</code></div>
                <p>Run one full training step: forward pass, cross-entropy loss, backward pass, Adam optimizer update. Returns step number, loss, the training document used, current learning rate, parameter statistics, and per-position visualization data.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.generate(temperature?: number)</code></div>
                <p>Generate text autoregressively. Temperature controls randomness (lower = more deterministic, higher = more creative). Returns the generated text, token IDs, and visualization data.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.getLossHistory()</code></div>
                <p>Returns an array of loss values from all training steps so far.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.getEmbeddings()</code></div>
                <p>Returns token embedding vectors — useful for visualization (e.g. scatter plots of the embedding space).</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>model.getConfig()</code></div>
                <p>Returns the current model configuration including vocabSize and numDocs.</p>
              </div>
            </div>

            <h3>Exports</h3>
            <div className="api-methods">
              <div className="api-method">
                <div className="api-method__sig"><code>MicroGPT</code></div>
                <p>The main class — training, inference, embeddings, loss history.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>Value</code></div>
                <p>Autograd scalar with computation graph and <code>.backward()</code> for reverse-mode autodiff.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>linear(x, W)</code></div>
                <p>Matrix-vector multiplication over arrays of Values.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>softmax(logits)</code></div>
                <p>Numerically stable softmax over an array of Values.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>rmsnorm(x)</code></div>
                <p>Root-mean-square normalization.</p>
              </div>
              <div className="api-method">
                <div className="api-method__sig"><code>SeededRandom</code></div>
                <p>Deterministic PRNG (Mulberry32) with <code>.random()</code>, <code>.gauss()</code>, <code>.shuffle()</code>, <code>.weightedChoice()</code>.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Links */}
      <div className="install-guide__links">
        <a
          href="https://www.npmjs.com/package/microgptjs"
          target="_blank"
          rel="noreferrer"
          className="install-link"
        >
          npm registry
        </a>
        <a
          href="https://github.com/kylemath/microgptJS/tree/main/packages/microgptjs"
          target="_blank"
          rel="noreferrer"
          className="install-link"
        >
          Source on GitHub
        </a>
        <a
          href="https://github.com/kylemath/microgptJS/tree/main/packages/microgptjs/README.md"
          target="_blank"
          rel="noreferrer"
          className="install-link"
        >
          Full Package Docs
        </a>
      </div>
    </div>
  );
}

/**
 * Simple code block with copy button. Uses a <pre> with manual styling
 * to avoid pulling in a syntax highlighter just for this tab.
 */
function CodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="code-block">
      <div className="code-block__header">
        <span className="code-block__lang">{language}</span>
        <button className="code-block__copy" onClick={handleCopy}>
          {copied ? 'copied!' : 'copy'}
        </button>
      </div>
      <pre className="code-block__pre">
        <code>{code}</code>
      </pre>
    </div>
  );
}
