import { useRef, useEffect, useState, useCallback } from 'react';

/**
 * Custom hook to manage the MicroGPT Web Worker.
 */
export function useWorker() {
  const workerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isTraining, setIsTraining] = useState(false);
  const [modelInfo, setModelInfo] = useState(null);
  const [trainingState, setTrainingState] = useState({
    step: 0,
    loss: 0,
    doc: '',
    learningRate: 0,
    paramStats: null,
    attentionWeights: null,
    embedding: null,
  });
  const [lossHistory, setLossHistory] = useState([]);
  const [samples, setSamples] = useState([]);
  const [embeddings, setEmbeddings] = useState([]);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/training.worker.js', import.meta.url),
      { type: 'module' }
    );

    worker.onmessage = (e) => {
      const { type, payload } = e.data;
      switch (type) {
        case 'initialized':
          setModelInfo(payload);
          setIsReady(true);
          break;
        case 'trainStep':
          setTrainingState(payload);
          setLossHistory(prev => [...prev, { step: payload.step, loss: payload.loss }]);
          break;
        case 'trainDone':
          setIsTraining(false);
          break;
        case 'generated':
          setSamples(payload.samples);
          break;
        case 'embeddings':
          setEmbeddings(payload.embeddings);
          break;
        case 'lossHistory':
          setLossHistory(payload.history.map((l, i) => ({ step: i + 1, loss: l })));
          break;
      }
    };

    workerRef.current = worker;
    return () => worker.terminate();
  }, []);

  const init = useCallback((text, options = {}) => {
    setLossHistory([]);
    setSamples([]);
    setIsReady(false);
    workerRef.current?.postMessage({ type: 'init', payload: { text, options } });
  }, []);

  const train = useCallback((steps = 100, reportEvery = 1) => {
    setIsTraining(true);
    workerRef.current?.postMessage({ type: 'train', payload: { steps, reportEvery } });
  }, []);

  const stop = useCallback(() => {
    workerRef.current?.postMessage({ type: 'stop' });
  }, []);

  const generate = useCallback((temperature = 0.5, numSamples = 10) => {
    workerRef.current?.postMessage({ type: 'generate', payload: { temperature, numSamples } });
  }, []);

  const getEmbeddings = useCallback(() => {
    workerRef.current?.postMessage({ type: 'getEmbeddings' });
  }, []);

  return {
    isReady,
    isTraining,
    modelInfo,
    trainingState,
    lossHistory,
    samples,
    embeddings,
    init,
    train,
    stop,
    generate,
    getEmbeddings,
  };
}
