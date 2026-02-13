/**
 * The original Python source code, broken into annotated sections for
 * side-by-side comparison with the JavaScript translation.
 */
export const pythonSections = [
  {
    id: 'imports',
    title: 'Imports & Setup',
    python: `import os
import math
import random
random.seed(42)`,
    javascript: `// SeededRandom class (replaces Python random)
class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed;
    this.state = seed;
  }
  random() { /* mulberry32 PRNG */ }
  gauss(mu, sigma) { /* Box-Muller */ }
  shuffle(arr) { /* Fisher-Yates */ }
  weightedChoice(pop, weights) { ... }
}`,
    description: 'JavaScript has no built-in seeded random, so we implement a mulberry32 PRNG with Box-Muller transform for Gaussian sampling.',
    pyLines: '1-4',
    jsLines: 'SeededRandom class',
  },
  {
    id: 'data',
    title: 'Data Loading & Tokenizer',
    python: `# Load dataset
docs = [l.strip() for l in open('input.txt')
        .read().strip().split('\\n') if l.strip()]
random.shuffle(docs)

# Tokenizer
uchars = sorted(set(''.join(docs)))
BOS = len(uchars)
vocab_size = len(uchars) + 1`,
    javascript: `// MicroGPT.loadData(text)
loadData(text) {
  this.docs = text.split('\\n')
    .map(l => l.trim()).filter(l => l.length > 0);
  this.rng.shuffle(this.docs);

  const charSet = new Set(this.docs.join(''));
  this.uchars = [...charSet].sort();
  this.BOS = this.uchars.length;
  this.vocabSize = this.uchars.length + 1;
}`,
    description: 'The character-level tokenizer works identically: extract unique characters, sort them, add BOS token. In JS we fetch the dataset via HTTP and pass it as a string.',
    pyLines: '14-20',
    jsLines: 'MicroGPT.loadData()',
  },
  {
    id: 'autograd',
    title: 'Autograd Engine (Value Class)',
    python: `class Value:
    __slots__ = ('data', 'grad',
                 '_children', '_local_grads')

    def __init__(self, data, children=(),
                 local_grads=()):
        self.data = data
        self.grad = 0
        self._children = children
        self._local_grads = local_grads

    def __add__(self, other):
        other = other if isinstance(other, Value)
               else Value(other)
        return Value(self.data + other.data,
                    (self, other), (1, 1))

    def __mul__(self, other): ...
    def __pow__(self, other): ...
    def log(self): ...
    def exp(self): ...
    def relu(self): ...

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._children:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1
        for v in reversed(topo):
            for child, lg in zip(
                v._children, v._local_grads):
                child.grad += lg * v.grad`,
    javascript: `class Value {
  constructor(data, children = [],
              localGrads = []) {
    this.data = data;
    this.grad = 0;
    this._children = children;
    this._localGrads = localGrads;
  }

  add(other) {
    if (!(other instanceof Value))
      other = new Value(other);
    return new Value(
      this.data + other.data,
      [this, other], [1, 1]);
  }

  mul(other) { ... }
  pow(other) { ... }
  log() { ... }
  exp() { ... }
  relu() { ... }

  backward() {
    const topo = [];
    const visited = new Set();
    const buildTopo = (v) => {
      if (!visited.has(v)) {
        visited.add(v);
        for (const child of v._children)
          buildTopo(child);
        topo.push(v);
      }
    };
    buildTopo(this);
    this.grad = 1;
    for (const v of topo.reverse()) {
      for (let i = 0; i < v._children.length; i++)
        v._children[i].grad +=
          v._localGrads[i] * v.grad;
    }
  }
}`,
    description: 'The Value class is nearly identical. Python uses operator overloading (__add__, __mul__); JS uses named methods (add, mul). The backward pass with topological sort is the same algorithm.',
    pyLines: '23-56',
    jsLines: 'Value class',
  },
  {
    id: 'params',
    title: 'Parameter Initialization',
    python: `n_embd = 16
n_head = 4
n_layer = 1
block_size = 16
head_dim = n_embd // n_head

matrix = lambda nout, nin, std=0.08: [
  [Value(random.gauss(0, std))
   for _ in range(nin)]
  for _ in range(nout)]

state_dict = {
  'wte': matrix(vocab_size, n_embd),
  'wpe': matrix(block_size, n_embd),
  'lm_head': matrix(vocab_size, n_embd),
}
for i in range(n_layer):
  state_dict[f'layer{i}.attn_wq'] = ...
  state_dict[f'layer{i}.attn_wk'] = ...
  # ... etc`,
    javascript: `this.config = {
  nEmbd: 16, nHead: 4,
  nLayer: 1, blockSize: 16,
};
this.config.headDim =
  this.config.nEmbd / this.config.nHead;

_matrix(nout, nin, std = 0.08) {
  return Array.from({length: nout}, () =>
    Array.from({length: nin}, () =>
      new Value(this.rng.gauss(0, std))));
}

this.stateDict = {
  wte: this._matrix(vocabSize, nEmbd),
  wpe: this._matrix(blockSize, nEmbd),
  lm_head: this._matrix(vocabSize, nEmbd),
};
for (let i = 0; i < nLayer; i++) {
  this.stateDict[\`layer\${i}.attn_wq\`] = ...
  this.stateDict[\`layer\${i}.attn_wk\`] = ...
  // ... etc
}`,
    description: 'Parameter matrices are 2D arrays of Value objects, initialized with Gaussian random weights. The state_dict structure mirrors the Python version exactly.',
    pyLines: '58-73',
    jsLines: 'MicroGPT.initParams()',
  },
  {
    id: 'model',
    title: 'Model Architecture (GPT)',
    python: `def linear(x, w):
    return [sum(wi * xi
      for wi, xi in zip(wo, x))
      for wo in w]

def softmax(logits):
    max_val = max(val.data for val in logits)
    exps = [(val - max_val).exp()
            for val in logits]
    total = sum(exps)
    return [e / total for e in exps]

def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]

def gpt(token_id, pos_id, keys, values):
    tok_emb = state_dict['wte'][token_id]
    pos_emb = state_dict['wpe'][pos_id]
    x = [t + p for t, p in
         zip(tok_emb, pos_emb)]
    x = rmsnorm(x)
    # ... attention + MLP blocks ...
    logits = linear(x, state_dict['lm_head'])
    return logits`,
    javascript: `function linear(x, w) {
  return w.map(wo =>
    sumValues(wo.map((wi, i) =>
      wi.mul(x[i]))));
}

function softmax(logits) {
  const maxVal = Math.max(
    ...logits.map(v => v.data));
  const exps = logits.map(val =>
    val.sub(new Value(maxVal)).exp());
  const total = sumValues(exps);
  return exps.map(e => e.div(total));
}

function rmsnorm(x) {
  const ms = sumValues(
    x.map(xi => xi.mul(xi)))
    .div(new Value(x.length));
  const scale = ms.add(new Value(1e-5))
    .pow(-0.5);
  return x.map(xi => xi.mul(scale));
}

function gpt(tokenId, posId,
             keys, vals, stateDict, config) {
  let tokEmb = stateDict.wte[tokenId];
  let posEmb = stateDict.wpe[posId];
  let x = tokEmb.map((t, i) =>
    t.add(posEmb[i]));
  x = rmsnorm(x);
  // ... attention + MLP blocks ...
  const logits = linear(x, stateDict.lm_head);
  return { logits, vizData };
}`,
    description: 'The core model functions translate directly. Python list comprehensions become JS map/reduce. The JS version also collects visualization data (attention weights, activations) during the forward pass.',
    pyLines: '76-117',
    jsLines: 'linear(), softmax(), rmsnorm(), gpt()',
  },
  {
    id: 'training',
    title: 'Training Loop (Adam)',
    python: `learning_rate = 0.01
beta1, beta2, eps = 0.85, 0.99, 1e-8
m = [0.0] * len(params)
v = [0.0] * len(params)

for step in range(num_steps):
    doc = docs[step % len(docs)]
    tokens = [BOS] + [uchars.index(ch)
              for ch in doc] + [BOS]
    n = min(block_size, len(tokens) - 1)

    keys, vals = [...], [...]
    losses = []
    for pos_id in range(n):
        logits = gpt(tokens[pos_id], pos_id,
                     keys, vals)
        probs = softmax(logits)
        loss_t = -probs[tokens[pos_id+1]].log()
        losses.append(loss_t)
    loss = (1/n) * sum(losses)

    loss.backward()

    lr_t = learning_rate * (1 - step/num_steps)
    for i, p in enumerate(params):
        m[i] = beta1*m[i] + (1-beta1)*p.grad
        v[i] = beta2*v[i] + (1-beta2)*p.grad**2
        m_hat = m[i] / (1 - beta1**(step+1))
        v_hat = v[i] / (1 - beta2**(step+1))
        p.data -= lr_t * m_hat /
                  (v_hat**0.5 + eps)
        p.grad = 0`,
    javascript: `trainStep() {
  const doc = this.docs[
    this.step % this.docs.length];
  const tokens = [this.BOS,
    ...doc.split('').map(ch =>
      this.uchars.indexOf(ch)),
    this.BOS];
  const n = Math.min(blockSize,
    tokens.length - 1);

  const keys = [...]; const vals = [...];
  const losses = [];
  for (let posId = 0; posId < n; posId++) {
    const { logits, vizData } = gpt(
      tokens[posId], posId, keys, vals,
      this.stateDict, this.config);
    const probs = softmax(logits);
    const lossT = probs[tokens[posId+1]]
      .log().neg();
    losses.append(lossT);
  }
  const loss = sumValues(losses)
    .mul(new Value(1 / n));

  loss.backward();

  const lrT = this.learningRate *
    (1 - this.step / this.numSteps);
  for (let i = 0; i < this.params.length; i++){
    const p = this.params[i];
    this.m[i] = beta1*this.m[i] +
      (1-beta1)*p.grad;
    this.v[i] = beta2*this.v[i] +
      (1-beta2)*p.grad**2;
    // ... bias correction + update ...
    p.grad = 0;
  }
}`,
    description: 'Each training step: tokenize a document, forward pass through GPT to get loss, backward pass for gradients, Adam optimizer update. The JS version is wrapped as a class method and runs in a Web Worker.',
    pyLines: '119-147',
    jsLines: 'MicroGPT.trainStep()',
  },
  {
    id: 'inference',
    title: 'Inference (Generation)',
    python: `temperature = 0.5
for sample_idx in range(20):
    keys, vals = [...], [...]
    token_id = BOS
    sample = []
    for pos_id in range(block_size):
        logits = gpt(token_id, pos_id,
                     keys, vals)
        probs = softmax(
            [l / temperature for l in logits])
        token_id = random.choices(
            range(vocab_size),
            weights=[p.data for p in probs])[0]
        if token_id == BOS:
            break
        sample.append(uchars[token_id])
    print(''.join(sample))`,
    javascript: `generate(temperature = 0.5) {
  const keys = [...]; const vals = [...];
  let tokenId = this.BOS;
  const sample = [];
  for (let posId = 0;
       posId < blockSize; posId++) {
    const { logits, vizData } = gpt(
      tokenId, posId, keys, vals,
      this.stateDict, this.config);
    const scaledLogits = logits.map(l =>
      l.div(new Value(temperature)));
    const probs = softmax(scaledLogits);
    const weights = probs.map(p => p.data);
    tokenId = this.rng.weightedChoice(
      Array.from({length: vocabSize},
        (_, i) => i), weights);
    if (tokenId === this.BOS) break;
    sample.push(this.uchars[tokenId]);
  }
  return { text: sample.join(''), ... };
}`,
    description: 'Autoregressive generation: start with BOS, sample next token from temperature-scaled probabilities, repeat until BOS or max length. The JS version collects probability distributions for visualization.',
    pyLines: '149-163',
    jsLines: 'MicroGPT.generate()',
  },
];

export const fullPythonSource = `"""
The most atomic way to train and inference a GPT in pure, dependency-free Python.
This file is the complete algorithm.
Everything else is just efficiency.

@karpathy
"""

import os # os.path.exists
import math # math.log, math.exp
import random # random.seed, random.choices, random.gauss, random.shuffle
random.seed(42) # Let there be order among chaos

# Let there be an input dataset \`docs\`: list[str] of documents (e.g. a dataset of names)
if not os.path.exists('input.txt'):
    import urllib.request
    names_url = 'https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt'
    urllib.request.urlretrieve(names_url, 'input.txt')
docs = [l.strip() for l in open('input.txt').read().strip().split('\\n') if l.strip()] # list[str] of documents
random.shuffle(docs)
print(f"num docs: {len(docs)}")

# Let there be a Tokenizer to translate strings to discrete symbols and back
uchars = sorted(set(''.join(docs))) # unique characters in the dataset become token ids 0..n-1
BOS = len(uchars) # token id for the special Beginning of Sequence (BOS) token
vocab_size = len(uchars) + 1 # total number of unique tokens, +1 is for BOS
print(f"vocab size: {vocab_size}")

# Let there be Autograd, to recursively apply the chain rule through a computation graph
class Value:
    __slots__ = ('data', 'grad', '_children', '_local_grads') # Python optimization for memory usage

    def __init__(self, data, children=(), local_grads=()):
        self.data = data # scalar value of this node calculated during forward pass
        self.grad = 0 # derivative of the loss w.r.t. this node, calculated in backward pass
        self._children = children # children of this node in the computation graph
        self._local_grads = local_grads # local derivative of this node w.r.t. its children

    def __add__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data + other.data, (self, other), (1, 1))

    def __mul__(self, other):
        other = other if isinstance(other, Value) else Value(other)
        return Value(self.data * other.data, (self, other), (other.data, self.data))

    def __pow__(self, other): return Value(self.data**other, (self,), (other * self.data**(other-1),))
    def log(self): return Value(math.log(self.data), (self,), (1/self.data,))
    def exp(self): return Value(math.exp(self.data), (self,), (math.exp(self.data),))
    def relu(self): return Value(max(0, self.data), (self,), (float(self.data > 0),))
    def __neg__(self): return self * -1
    def __radd__(self, other): return self + other
    def __sub__(self, other): return self + (-other)
    def __rsub__(self, other): return other + (-self)
    def __rmul__(self, other): return self * other
    def __truediv__(self, other): return self * other**-1
    def __rtruediv__(self, other): return other * self**-1

    def backward(self):
        topo = []
        visited = set()
        def build_topo(v):
            if v not in visited:
                visited.add(v)
                for child in v._children:
                    build_topo(child)
                topo.append(v)
        build_topo(self)
        self.grad = 1
        for v in reversed(topo):
            for child, local_grad in zip(v._children, v._local_grads):
                child.grad += local_grad * v.grad

# Initialize the parameters, to store the knowledge of the model.
n_embd = 16 # embedding dimension
n_head = 4 # number of attention heads
n_layer = 1 # number of layers
block_size = 16 # maximum sequence length
head_dim = n_embd // n_head # dimension of each head
matrix = lambda nout, nin, std=0.08: [[Value(random.gauss(0, std)) for _ in range(nin)] for _ in range(nout)]
state_dict = {'wte': matrix(vocab_size, n_embd), 'wpe': matrix(block_size, n_embd), 'lm_head': matrix(vocab_size, n_embd)}
for i in range(n_layer):
    state_dict[f'layer{i}.attn_wq'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wk'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wv'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.attn_wo'] = matrix(n_embd, n_embd)
    state_dict[f'layer{i}.mlp_fc1'] = matrix(4 * n_embd, n_embd)
    state_dict[f'layer{i}.mlp_fc2'] = matrix(n_embd, 4 * n_embd)
params = [p for mat in state_dict.values() for row in mat for p in row] # flatten params into a single list[Value]
print(f"num params: {len(params)}")

# Define the model architecture: a stateless function mapping token sequence and parameters to logits over what comes next.
# Follow GPT-2, blessed among the GPTs, with minor differences: layernorm -> rmsnorm, no biases, GeLU -> ReLU
def linear(x, w):
    return [sum(wi * xi for wi, xi in zip(wo, x)) for wo in w]

def softmax(logits):
    max_val = max(val.data for val in logits)
    exps = [(val - max_val).exp() for val in logits]
    total = sum(exps)
    return [e / total for e in exps]

def rmsnorm(x):
    ms = sum(xi * xi for xi in x) / len(x)
    scale = (ms + 1e-5) ** -0.5
    return [xi * scale for xi in x]

def gpt(token_id, pos_id, keys, values):
    tok_emb = state_dict['wte'][token_id] # token embedding
    pos_emb = state_dict['wpe'][pos_id] # position embedding
    x = [t + p for t, p in zip(tok_emb, pos_emb)] # joint token and position embedding
    x = rmsnorm(x)

    for li in range(n_layer):
        # 1) Multi-head attention block
        x_residual = x
        x = rmsnorm(x)
        q = linear(x, state_dict[f'layer{li}.attn_wq'])
        k = linear(x, state_dict[f'layer{li}.attn_wk'])
        v = linear(x, state_dict[f'layer{li}.attn_wv'])
        keys[li].append(k)
        values[li].append(v)
        x_attn = []
        for h in range(n_head):
            hs = h * head_dim
            q_h = q[hs:hs+head_dim]
            k_h = [ki[hs:hs+head_dim] for ki in keys[li]]
            v_h = [vi[hs:hs+head_dim] for vi in values[li]]
            attn_logits = [sum(q_h[j] * k_h[t][j] for j in range(head_dim)) / head_dim**0.5 for t in range(len(k_h))]
            attn_weights = softmax(attn_logits)
            head_out = [sum(attn_weights[t] * v_h[t][j] for t in range(len(v_h))) for j in range(head_dim)]
            x_attn.extend(head_out)
        x = linear(x_attn, state_dict[f'layer{li}.attn_wo'])
        x = [a + b for a, b in zip(x, x_residual)]
        # 2) MLP block
        x_residual = x
        x = rmsnorm(x)
        x = linear(x, state_dict[f'layer{li}.mlp_fc1'])
        x = [xi.relu() for xi in x]
        x = linear(x, state_dict[f'layer{li}.mlp_fc2'])
        x = [a + b for a, b in zip(x, x_residual)]

    logits = linear(x, state_dict['lm_head'])
    return logits

# Let there be Adam, the blessed optimizer and its buffers
learning_rate, beta1, beta2, eps_adam = 0.01, 0.85, 0.99, 1e-8
m = [0.0] * len(params) # first moment buffer
v = [0.0] * len(params) # second moment buffer

# Repeat in sequence
num_steps = 1000 # number of training steps
for step in range(num_steps):

    # Take single document, tokenize it, surround it with BOS special token on both sides
    doc = docs[step % len(docs)]
    tokens = [BOS] + [uchars.index(ch) for ch in doc] + [BOS]
    n = min(block_size, len(tokens) - 1)

    # Forward the token sequence through the model, building up the computation graph all the way to the loss.
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
    losses = []
    for pos_id in range(n):
        token_id, target_id = tokens[pos_id], tokens[pos_id + 1]
        logits = gpt(token_id, pos_id, keys, values)
        probs = softmax(logits)
        loss_t = -probs[target_id].log()
        losses.append(loss_t)
    loss = (1 / n) * sum(losses) # final average loss over the document sequence. May yours be low.

    # Backward the loss, calculating the gradients with respect to all model parameters.
    loss.backward()

    # Adam optimizer update: update the model parameters based on the corresponding gradients.
    lr_t = learning_rate * (1 - step / num_steps) # linear learning rate decay
    for i, p in enumerate(params):
        m[i] = beta1 * m[i] + (1 - beta1) * p.grad
        v[i] = beta2 * v[i] + (1 - beta2) * p.grad ** 2
        m_hat = m[i] / (1 - beta1 ** (step + 1))
        v_hat = v[i] / (1 - beta2 ** (step + 1))
        p.data -= lr_t * m_hat / (v_hat ** 0.5 + eps_adam)
        p.grad = 0

    print(f"step {step+1:4d} / {num_steps:4d} | loss {loss.data:.4f}")

# Inference: may the model babble back to us
temperature = 0.5 # in (0, 1], control the "creativity" of generated text, low to high
print("\\n--- inference (new, hallucinated names) ---")
for sample_idx in range(20):
    keys, values = [[] for _ in range(n_layer)], [[] for _ in range(n_layer)]
    token_id = BOS
    sample = []
    for pos_id in range(block_size):
        logits = gpt(token_id, pos_id, keys, values)
        probs = softmax([l / temperature for l in logits])
        token_id = random.choices(range(vocab_size), weights=[p.data for p in probs])[0]
        if token_id == BOS:
            break
        sample.append(uchars[token_id])
    print(f"sample {sample_idx+1:2d}: {''.join(sample)}")`;
