import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { pythonSections } from '../data/pythonSource';
import '../styles/CodeComparison.css';

/**
 * Side-by-side Python vs JavaScript code comparison panel.
 * Shows annotated sections of the original microgpt.py alongside the JS translation.
 */
export default function CodeComparison() {
  const [activeSection, setActiveSection] = useState(pythonSections[0].id);
  const [showAll, setShowAll] = useState(false);

  const sections = showAll ? pythonSections : pythonSections.filter(s => s.id === activeSection);

  return (
    <div className="code-comparison">
      <div className="code-comparison__header">
        <h2>Code Comparison: Python vs JavaScript</h2>
        <p className="code-comparison__subtitle">
          Faithful translation of{' '}
          <a href="https://gist.github.com/kylemath/58607dbafcf2315f9c958e1753f70fa9" target="_blank" rel="noreferrer">
            @karpathy's microgpt.py
          </a>
        </p>
        <div className="code-comparison__controls">
          <div className="section-tabs">
            {pythonSections.map((section) => (
              <button
                key={section.id}
                className={`tab ${activeSection === section.id && !showAll ? 'tab--active' : ''}`}
                onClick={() => { setActiveSection(section.id); setShowAll(false); }}
              >
                {section.title}
              </button>
            ))}
          </div>
          <button
            className={`tab tab--show-all ${showAll ? 'tab--active' : ''}`}
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show One' : 'Show All'}
          </button>
        </div>
      </div>

      <div className="code-comparison__sections">
        {sections.map((section) => (
          <div key={section.id} className="code-section">
            <div className="code-section__title">
              <h3>{section.title}</h3>
              <span className="code-section__lines">
                Python lines {section.pyLines} → JS: {section.jsLines}
              </span>
            </div>
            <p className="code-section__description">{section.description}</p>
            <div className="code-section__panels">
              <div className="code-panel">
                <div className="code-panel__label">
                  <span className="lang-badge lang-badge--python">Python</span>
                  microgpt.py
                </div>
                <SyntaxHighlighter
                  language="python"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                  showLineNumbers
                >
                  {section.python}
                </SyntaxHighlighter>
              </div>
              <div className="code-panel">
                <div className="code-panel__label">
                  <span className="lang-badge lang-badge--javascript">JavaScript</span>
                  microgpt.js
                </div>
                <SyntaxHighlighter
                  language="javascript"
                  style={oneDark}
                  customStyle={{
                    margin: 0,
                    borderRadius: '0 0 8px 8px',
                    fontSize: '13px',
                    lineHeight: '1.5',
                  }}
                  showLineNumbers
                >
                  {section.javascript}
                </SyntaxHighlighter>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
