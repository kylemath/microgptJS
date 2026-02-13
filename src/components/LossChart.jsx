import { useRef, useEffect } from 'react';
import '../styles/LossChart.css';

/**
 * Canvas-based loss curve visualization.
 * Draws the training loss over time on a 2D canvas.
 */
export default function LossChart({ lossHistory }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || lossHistory.length === 0) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const pad = { top: 20, right: 20, bottom: 40, left: 60 };
    const plotW = w - pad.left - pad.right;
    const plotH = h - pad.top - pad.bottom;

    // Clear
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, w, h);

    if (lossHistory.length < 2) return;

    // Filter out NaN/Infinity values for robust plotting
    const validHistory = lossHistory.filter((d) => Number.isFinite(d.loss));
    if (validHistory.length < 2) return;

    const losses = validHistory.map((d) => d.loss);
    const maxLoss = Math.max(...losses);
    const minLoss = Math.min(...losses);
    const lossRange = maxLoss - minLoss || 1;

    // Grid lines
    ctx.strokeStyle = '#2a2a4a';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (plotH * i) / 4;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(pad.left + plotW, y);
      ctx.stroke();

      // Y labels
      const val = maxLoss - (lossRange * i) / 4;
      ctx.fillStyle = '#8888aa';
      ctx.font = '11px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(val.toFixed(2), pad.left - 8, y + 4);
    }

    // X labels
    ctx.textAlign = 'center';
    const stepMax = validHistory[validHistory.length - 1].step;
    for (let i = 0; i <= 4; i++) {
      const x = pad.left + (plotW * i) / 4;
      const stepVal = Math.round((stepMax * i) / 4);
      ctx.fillText(stepVal.toString(), x, h - pad.bottom + 20);
    }

    // Axis labels
    ctx.fillStyle = '#aaaacc';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Training Step', pad.left + plotW / 2, h - 5);

    ctx.save();
    ctx.translate(15, pad.top + plotH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Loss', 0, 0);
    ctx.restore();

    // Loss curve
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < validHistory.length; i++) {
      const x = pad.left + (i / (validHistory.length - 1)) * plotW;
      const y = pad.top + ((maxLoss - validHistory[i].loss) / lossRange) * plotH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Moving average (smoothed)
    if (validHistory.length > 20) {
      const windowSize = Math.max(5, Math.floor(validHistory.length / 20));
      ctx.strokeStyle = '#ff6b6b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      let started = false;
      for (let i = windowSize; i < validHistory.length; i++) {
        let avg = 0;
        for (let j = i - windowSize; j < i; j++) avg += losses[j];
        avg /= windowSize;
        const x = pad.left + (i / (validHistory.length - 1)) * plotW;
        const y = pad.top + ((maxLoss - avg) / lossRange) * plotH;
        if (!started) { ctx.moveTo(x, y); started = true; }
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    // Legend
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(pad.left + plotW - 120, pad.top + 5, 12, 3);
    ctx.fillStyle = '#8888aa';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Raw', pad.left + plotW - 104, pad.top + 10);

    if (validHistory.length > 20) {
      ctx.fillStyle = '#ff6b6b';
      ctx.fillRect(pad.left + plotW - 120, pad.top + 20, 12, 3);
      ctx.fillStyle = '#8888aa';
      ctx.fillText('Smoothed', pad.left + plotW - 104, pad.top + 25);
    }
  }, [lossHistory]);

  return (
    <div className="loss-chart">
      <h3>Training Loss</h3>
      <canvas ref={canvasRef} className="loss-chart__canvas" />
    </div>
  );
}
