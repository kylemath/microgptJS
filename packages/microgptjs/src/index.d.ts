/**
 * microgptjs — TypeScript type definitions
 */

/**
 * Seeded pseudo-random number generator (Mulberry32).
 * Replaces Python's `random` module for reproducible results.
 */
export declare class SeededRandom {
  seed: number;
  state: number;
  constructor(seed?: number);
  /** Returns a random float in [0, 1). */
  random(): number;
  /** Returns a Gaussian-distributed random number. */
  gauss(mu?: number, sigma?: number): number;
  /** Shuffles an array in-place using Fisher-Yates. */
  shuffle<T>(arr: T[]): T[];
  /** Selects one item from `population` according to `weights`. */
  weightedChoice<T>(population: T[], weights: number[]): T;
}

/**
 * A scalar value in a computation graph with automatic differentiation.
 * This is the autograd engine — the heart of backpropagation.
 */
export declare class Value {
  data: number;
  grad: number;
  constructor(data: number, children?: Value[], localGrads?: number[]);
  add(other: Value | number): Value;
  mul(other: Value | number): Value;
  pow(other: number): Value;
  log(): Value;
  exp(): Value;
  relu(): Value;
  neg(): Value;
  sub(other: Value | number): Value;
  div(other: Value | number): Value;
  /** Backpropagates gradients through the computation graph. */
  backward(): void;
}

/** Configuration for a MicroGPT model. */
export interface MicroGPTConfig {
  nEmbd: number;
  nHead: number;
  nLayer: number;
  blockSize: number;
  headDim: number;
}

/** Options passed to the MicroGPT constructor. */
export interface MicroGPTOptions {
  seed?: number;
  nEmbd?: number;
  nHead?: number;
  nLayer?: number;
  blockSize?: number;
  learningRate?: number;
  numSteps?: number;
}

/** Info returned after model initialization. */
export interface InitInfo {
  numParams: number;
  vocabSize: number;
  numDocs: number;
}

/** Visualization data collected during a forward pass. */
export interface VizData {
  embedding: number[];
  attentionWeights: number[][][];
  mlpActivations: number[][];
}

/** Result of a single training step. */
export interface TrainStepResult {
  step: number;
  loss: number;
  doc: string;
  tokens: number[];
  learningRate: number;
  paramStats: { mean: number; std: number };
  vizData: VizData[];
}

/** Result of text generation. */
export interface GenerateResult {
  text: string;
  tokens: number[];
  vizData: Array<VizData & { probs: number[] }>;
}

/** Token embedding data for visualization. */
export interface EmbeddingData {
  tokenId: number;
  char: string;
  embedding: number[];
}

/**
 * MicroGPT — A complete GPT implementation for training and inference.
 *
 * Zero dependencies. Pure JavaScript. Educational focus.
 *
 * @example
 * ```js
 * import { MicroGPT } from 'microgptjs';
 *
 * const model = new MicroGPT({ nEmbd: 16, nHead: 4, nLayer: 1 });
 * model.loadData("hello\nworld\nfoo\nbar");
 * model.initParams();
 *
 * for (let i = 0; i < 100; i++) {
 *   const result = model.trainStep();
 *   console.log(`Step ${result.step}: loss=${result.loss.toFixed(4)}`);
 * }
 *
 * const sample = model.generate(0.5);
 * console.log(`Generated: ${sample.text}`);
 * ```
 */
export declare class MicroGPT {
  config: MicroGPTConfig;
  step: number;
  initialized: boolean;

  constructor(options?: MicroGPTOptions);

  /** Load a newline-separated text dataset and build the character vocabulary. */
  loadData(text: string): void;

  /** Initialize all model parameters. Must be called after `loadData()`. */
  initParams(): InitInfo;

  /** Run a single training step (forward + backward + Adam update). */
  trainStep(): TrainStepResult;

  /** Generate text autoregressively. */
  generate(temperature?: number): GenerateResult;

  /** Get the full training loss history. */
  getLossHistory(): number[];

  /** Get token embeddings for visualization. */
  getEmbeddings(): EmbeddingData[];

  /** Get the current model configuration. */
  getConfig(): MicroGPTConfig & { vocabSize: number; numDocs: number };
}

/**
 * Matrix-vector multiplication: y = W @ x
 * @param x - Input vector of Values
 * @param w - Weight matrix (array of arrays of Values)
 */
export declare function linear(x: Value[], w: Value[][]): Value[];

/**
 * Softmax with numerical stability.
 * @param logits - Array of Values
 */
export declare function softmax(logits: Value[]): Value[];

/**
 * RMS normalization.
 * @param x - Array of Values
 */
export declare function rmsnorm(x: Value[]): Value[];
