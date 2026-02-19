/**
 * GradientSlider.jsx
 *
 * Interactive demo: visualizes a simple loss landscape with
 * a draggable weight parameter and shows the gradient and update step.
 *
 * Embed in Markdown:
 *
 * ```component
 * GradientSlider
 * ```
 */
import { useState, useCallback } from 'react'

// Simple convex loss: L(w) = (w - 2)^2 + 1
const loss = w => (w - 2) ** 2 + 1
const grad = w => 2 * (w - 2)

const W_MIN = -3
const W_MAX = 7
const SVG_W = 480
const SVG_H = 200
const PAD = { l: 40, r: 20, t: 20, b: 40 }

function toSvgX(w) {
  return PAD.l + ((w - W_MIN) / (W_MAX - W_MIN)) * (SVG_W - PAD.l - PAD.r)
}

function toSvgY(l, lMin = 0, lMax = 30) {
  return PAD.t + (1 - (l - lMin) / (lMax - lMin)) * (SVG_H - PAD.t - PAD.b)
}

export default function GradientSlider() {
  const [w, setW] = useState(5.5)
  const [lr, setLr] = useState(0.3)
  const [history, setHistory] = useState([5.5])

  const step = useCallback(() => {
    setW(prev => {
      const next = Math.max(W_MIN, Math.min(W_MAX, prev - lr * grad(prev)))
      setHistory(h => [...h.slice(-19), next])
      return next
    })
  }, [lr])

  const reset = useCallback(() => {
    setW(5.5)
    setHistory([5.5])
  }, [])

  // Build SVG path for the loss curve
  const steps = 200
  const points = Array.from({ length: steps }, (_, i) => {
    const ww = W_MIN + (i / (steps - 1)) * (W_MAX - W_MIN)
    return `${toSvgX(ww)},${toSvgY(loss(ww))}`
  }).join(' ')

  const currentL = loss(w)
  const currentG = grad(w)
  const nextW = w - lr * currentG
  const cx = toSvgX(w)
  const cy = toSvgY(currentL)

  return (
    <div style={{ fontFamily: 'var(--font-mono)' }}>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9rem', color: 'var(--ink-muted)', marginBottom: '1rem' }}>
        Gradient descent on L(w) = (w − 2)² + 1. Click Step to update.
      </p>

      {/* SVG plot */}
      <svg width="100%" viewBox={`0 0 ${SVG_W} ${SVG_H}`} style={{ background: 'var(--paper-warm)', border: '1px solid var(--ink-faint)', borderRadius: 2 }}>
        {/* Axes */}
        <line x1={PAD.l} y1={SVG_H - PAD.b} x2={SVG_W - PAD.r} y2={SVG_H - PAD.b} stroke="var(--ink-faint)" strokeWidth="1" />
        <line x1={PAD.l} y1={PAD.t} x2={PAD.l} y2={SVG_H - PAD.b} stroke="var(--ink-faint)" strokeWidth="1" />

        {/* Axis labels */}
        <text x={SVG_W / 2} y={SVG_H - 5} textAnchor="middle" fontSize="10" fill="var(--ink-faint)">w</text>
        <text x={12} y={SVG_H / 2} textAnchor="middle" fontSize="10" fill="var(--ink-faint)" transform={`rotate(-90,12,${SVG_H / 2})`}>L(w)</text>

        {/* Loss curve */}
        <polyline points={points} fill="none" stroke="var(--ink-faint)" strokeWidth="1.5" />

        {/* History trail */}
        {history.slice(0, -1).map((hw, i) => (
          <circle key={i} cx={toSvgX(hw)} cy={toSvgY(loss(hw))} r={2.5} fill="var(--accent)" opacity={(i + 1) / history.length * 0.4} />
        ))}

        {/* Gradient tangent line */}
        {(() => {
          const x1 = toSvgX(w - 1.5)
          const x2 = toSvgX(w + 1.5)
          const y1 = toSvgY(currentL - currentG * 1.5)
          const y2 = toSvgY(currentL + currentG * 1.5)
          return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#81a1c1" strokeWidth="1" strokeDasharray="4 3" opacity="0.7" />
        })()}

        {/* Next step arrow */}
        {nextW >= W_MIN && nextW <= W_MAX && (
          <line
            x1={cx} y1={cy}
            x2={toSvgX(nextW)} y2={toSvgY(loss(nextW))}
            stroke="var(--accent)" strokeWidth="1.5" opacity="0.5"
            markerEnd="url(#arrow)"
          />
        )}
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="var(--accent)" opacity="0.5" />
          </marker>
        </defs>

        {/* Current point */}
        <circle cx={cx} cy={cy} r={6} fill="var(--accent)" />
        <text x={cx + 8} y={cy - 6} fontSize="10" fill="var(--accent)">w={w.toFixed(2)}</text>
      </svg>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.5rem', margin: '1rem 0', fontSize: '0.72rem' }}>
        {[
          ['w', w.toFixed(4)],
          ['L(w)', currentL.toFixed(4)],
          ['∂L/∂w', currentG.toFixed(4)],
        ].map(([label, val]) => (
          <div key={label} style={{ background: 'var(--paper-warm)', border: '1px solid var(--ink-faint)', padding: '0.5rem 0.75rem' }}>
            <div style={{ color: 'var(--ink-faint)', marginBottom: 2 }}>{label}</div>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          Learning rate: {lr.toFixed(2)}
          <input
            type="range" min="0.01" max="0.99" step="0.01"
            value={lr}
            onChange={e => setLr(+e.target.value)}
            style={{ width: 100 }}
          />
        </label>

        <button onClick={step} style={btnStyle('#c0392b', '#fff')}>Step</button>
        <button onClick={reset} style={btnStyle('transparent', 'var(--ink-muted)', 'var(--ink-faint)')}>Reset</button>
      </div>
    </div>
  )
}

function btnStyle(bg, color, border = bg) {
  return {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.7rem',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    background: bg,
    border: `1px solid ${border}`,
    padding: '0.4em 1em',
    cursor: 'pointer',
    color,
  }
}
