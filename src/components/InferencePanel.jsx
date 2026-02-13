import { useState } from 'react';
import '../styles/InferencePanel.css';

/**
 * Inference controls and generated sample display.
 */
export default function InferencePanel({ isReady, samples, onGenerate }) {
  const [temperature, setTemperature] = useState(0.5);
  const [numSamples, setNumSamples] = useState(10);

  return (
    <div className="inference-panel">
      <h2>Inference</h2>
      <p className="inference-panel__subtitle">
        Generate new names from the trained model
      </p>

      <div className="inference-panel__controls">
        <label>
          <span>Temperature</span>
          <div className="slider-row">
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(+e.target.value)}
            />
            <span className="slider-value">{temperature.toFixed(1)}</span>
          </div>
          <span className="slider-hint">Low = conservative, High = creative</span>
        </label>
        <label>
          <span>Num samples</span>
          <input
            type="number"
            value={numSamples}
            onChange={(e) => setNumSamples(+e.target.value)}
            min={1}
            max={50}
          />
        </label>
        <button
          className="btn btn--primary"
          onClick={() => onGenerate(temperature, numSamples)}
          disabled={!isReady}
        >
          Generate
        </button>
      </div>

      {samples.length > 0 && (
        <div className="inference-panel__samples">
          <h3>Generated Names</h3>
          <div className="samples-grid">
            {samples.map((sample, i) => (
              <div key={i} className="sample-card">
                <span className="sample-index">{i + 1}</span>
                <span className="sample-text">{sample.text || '(empty)'}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
