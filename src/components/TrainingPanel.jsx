import { useState } from 'react';
import '../styles/TrainingPanel.css';

/**
 * Training controls and live status display.
 */
export default function TrainingPanel({
  isReady,
  isTraining,
  modelInfo,
  trainingState,
  onInit,
  onTrain,
  onStop,
}) {
  const [numSteps, setNumSteps] = useState(100);
  const [nEmbd, setNEmbd] = useState(16);
  const [nHead, setNHead] = useState(4);
  const [nLayer, setNLayer] = useState(1);
  const [blockSize, setBlockSize] = useState(16);
  const [learningRate, setLearningRate] = useState(0.01);
  const [dataStatus, setDataStatus] = useState('idle'); // idle, loading, loaded, error

  const handleLoadData = async () => {
    setDataStatus('loading');
    try {
      const resp = await fetch(
        'https://raw.githubusercontent.com/karpathy/makemore/refs/heads/master/names.txt'
      );
      const text = await resp.text();
      onInit(text, { nEmbd, nHead, nLayer, blockSize, learningRate, numSteps });
      setDataStatus('loaded');
    } catch (err) {
      console.error('Failed to load data:', err);
      setDataStatus('error');
    }
  };

  return (
    <div className="training-panel">
      <h2>Training Controls</h2>

      {/* Model Configuration */}
      <div className="training-panel__config">
        <h3>Model Configuration</h3>
        <div className="config-grid">
          <label>
            <span>Embedding dim</span>
            <input type="number" value={nEmbd} onChange={(e) => setNEmbd(+e.target.value)} min={4} max={64} step={4} disabled={isReady} />
          </label>
          <label>
            <span>Attention heads</span>
            <input type="number" value={nHead} onChange={(e) => setNHead(+e.target.value)} min={1} max={8} disabled={isReady} />
          </label>
          <label>
            <span>Layers</span>
            <input type="number" value={nLayer} onChange={(e) => setNLayer(+e.target.value)} min={1} max={4} disabled={isReady} />
          </label>
          <label>
            <span>Block size</span>
            <input type="number" value={blockSize} onChange={(e) => setBlockSize(+e.target.value)} min={4} max={32} disabled={isReady} />
          </label>
          <label>
            <span>Learning rate</span>
            <input type="number" value={learningRate} onChange={(e) => setLearningRate(+e.target.value)} min={0.001} max={0.1} step={0.001} disabled={isReady} />
          </label>
          <label>
            <span>Training steps</span>
            <input type="number" value={numSteps} onChange={(e) => setNumSteps(+e.target.value)} min={10} max={5000} step={10} />
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="training-panel__actions">
        {!isReady ? (
          <button
            className="btn btn--primary"
            onClick={handleLoadData}
            disabled={dataStatus === 'loading'}
          >
            {dataStatus === 'loading' ? 'Loading names dataset...' : 'Initialize Model'}
          </button>
        ) : (
          <>
            <button
              className="btn btn--primary"
              onClick={() => onTrain(numSteps)}
              disabled={isTraining}
            >
              {isTraining ? 'Training...' : `Train ${numSteps} steps`}
            </button>
            <button
              className="btn btn--danger"
              onClick={onStop}
              disabled={!isTraining}
            >
              Stop
            </button>
          </>
        )}
      </div>

      {/* Model Info */}
      {modelInfo && (
        <div className="training-panel__info">
          <h3>Model Info</h3>
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Parameters</span>
              <span className="info-value">{modelInfo.numParams.toLocaleString()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Vocab Size</span>
              <span className="info-value">{modelInfo.vocabSize}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Documents</span>
              <span className="info-value">{modelInfo.numDocs.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {/* Live Training Status */}
      {trainingState.step > 0 && (
        <div className="training-panel__status">
          <h3>Training Progress</h3>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Step</span>
              <span className="status-value">{trainingState.step}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Loss</span>
              <span className="status-value">{trainingState.loss?.toFixed(4)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">LR</span>
              <span className="status-value">{trainingState.learningRate?.toFixed(6)}</span>
            </div>
            <div className="status-item">
              <span className="status-label">Current Doc</span>
              <span className="status-value status-value--doc">{trainingState.doc}</span>
            </div>
          </div>
          {/* Progress bar */}
          <div className="progress-bar">
            <div
              className="progress-bar__fill"
              style={{ width: `${Math.min(100, (trainingState.step / numSteps) * 100)}%` }}
            />
            <span className="progress-bar__text">
              {Math.min(100, ((trainingState.step / numSteps) * 100).toFixed(1))}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
