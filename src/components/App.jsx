import { useState } from 'react';
import { useWorker } from '../hooks/useWorker';
import TrainingPanel from './TrainingPanel';
import InferencePanel from './InferencePanel';
import CodeComparison from './CodeComparison';
import InstallGuide from './InstallGuide';
import LossChart from './LossChart';
import NetworkViz from './NetworkViz';
import AttentionViz from './AttentionViz';
import EmbeddingViz from './EmbeddingViz';
import '../styles/App.css';

/**
 * Main application component.
 * Orchestrates the training worker, visualization panels, and code comparison.
 */
export default function App() {
  const {
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
  } = useWorker();

  const [activeTab, setActiveTab] = useState('train');

  const tabs = [
    { id: 'train', label: 'Train & Visualize' },
    { id: 'install', label: 'npm Package' },
    { id: 'code', label: 'Code Comparison' },
  ];

  return (
    <div className="app">
      {/* Header */}
      <header className="app__header">
        <div className="app__header-content">
          <h1 className="app__title">
            <span className="app__title-micro">micro</span>
            <span className="app__title-gpt">GPT</span>
            <span className="app__title-js">.js</span>
          </h1>
          <p className="app__subtitle">
            The most atomic GPT — trained live in your browser.
            <br />
            <span className="app__credit">
              Based on{' '}
              <a href="https://gist.github.com/kylemath/58607dbafcf2315f9c958e1753f70fa9" target="_blank" rel="noreferrer">
                @karpathy's microgpt.py
              </a>
              , faithfully translated to JavaScript with Three.js visualizations.
            </span>
          </p>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="app__nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`app__nav-tab ${activeTab === tab.id ? 'app__nav-tab--active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {/* Main Content */}
      <main className="app__main">
        {activeTab === 'train' && (
          <div className="app__train-layout">
            {/* Left sidebar: controls */}
            <aside className="app__sidebar">
              <TrainingPanel
                isReady={isReady}
                isTraining={isTraining}
                modelInfo={modelInfo}
                trainingState={trainingState}
                onInit={init}
                onTrain={train}
                onStop={stop}
              />
              <InferencePanel
                isReady={isReady && !isTraining}
                samples={samples}
                onGenerate={generate}
              />
            </aside>

            {/* Right: visualizations */}
            <section className="app__visualizations">
              <div className="viz-grid">
                <div className="viz-grid__item viz-grid__item--wide">
                  <LossChart lossHistory={lossHistory} />
                </div>
                <div className="viz-grid__item">
                  <NetworkViz trainingState={trainingState} />
                </div>
                <div className="viz-grid__item">
                  <AttentionViz trainingState={trainingState} />
                </div>
                <div className="viz-grid__item viz-grid__item--wide">
                  <EmbeddingViz
                    embeddings={embeddings}
                    onRefresh={getEmbeddings}
                    isReady={isReady}
                  />
                </div>
              </div>
            </section>
          </div>
        )}
        {activeTab === 'install' && <InstallGuide />}
        {activeTab === 'code' && <CodeComparison />}
      </main>

      {/* Footer */}
      <footer className="app__footer">
        <p>
          microGPT.js — Pure JavaScript GPT implementation with autograd, no ML frameworks required.
          <br />
          Training runs in a Web Worker so the UI stays responsive.
        </p>
      </footer>
    </div>
  );
}
