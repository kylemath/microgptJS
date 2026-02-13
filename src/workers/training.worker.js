/**
 * Web Worker for running MicroGPT training and inference off the main thread.
 * Communicates with the React app via postMessage.
 */
import { MicroGPT } from 'microgptjs';

let model = null;
let isTraining = false;
let shouldStop = false;

self.onmessage = async function (e) {
  const { type, payload } = e.data;

  switch (type) {
    case 'init': {
      model = new MicroGPT(payload.options || {});
      model.loadData(payload.text);
      const info = model.initParams();
      self.postMessage({ type: 'initialized', payload: info });
      break;
    }

    case 'train': {
      if (!model || isTraining) return;
      isTraining = true;
      shouldStop = false;
      const steps = payload.steps || 100;
      const reportEvery = payload.reportEvery || 1;

      // Extend numSteps so the LR decay spans from current position to the end
      // of this new batch, preventing negative learning rates on subsequent runs
      model.numSteps = model.step + steps;

      for (let i = 0; i < steps; i++) {
        if (shouldStop) break;
        const result = model.trainStep();

        if ((i + 1) % reportEvery === 0 || i === steps - 1) {
          // Only send lightweight viz data to avoid serialization overhead
          self.postMessage({
            type: 'trainStep',
            payload: {
              step: result.step,
              loss: result.loss,
              doc: result.doc,
              learningRate: result.learningRate,
              paramStats: result.paramStats,
              // Send attention weights from last position in sequence
              attentionWeights: result.vizData.length > 0
                ? result.vizData[result.vizData.length - 1].attentionWeights
                : null,
              embedding: result.vizData.length > 0
                ? result.vizData[result.vizData.length - 1].embedding
                : null,
            },
          });
        }

        // Yield to allow message processing
        if (i % 5 === 0) {
          await new Promise(r => setTimeout(r, 0));
        }
      }
      isTraining = false;
      self.postMessage({ type: 'trainDone', payload: { totalSteps: model.step } });
      break;
    }

    case 'stop': {
      shouldStop = true;
      break;
    }

    case 'generate': {
      if (!model) return;
      const temperature = payload.temperature || 0.5;
      const numSamples = payload.numSamples || 10;
      const samples = [];
      for (let i = 0; i < numSamples; i++) {
        const result = model.generate(temperature);
        samples.push(result);
      }
      self.postMessage({ type: 'generated', payload: { samples } });
      break;
    }

    case 'getEmbeddings': {
      if (!model) return;
      const embeddings = model.getEmbeddings();
      self.postMessage({ type: 'embeddings', payload: { embeddings } });
      break;
    }

    case 'getLossHistory': {
      if (!model) return;
      self.postMessage({ type: 'lossHistory', payload: { history: model.getLossHistory() } });
      break;
    }

    case 'getConfig': {
      if (!model) return;
      self.postMessage({ type: 'config', payload: model.getConfig() });
      break;
    }
  }
};
