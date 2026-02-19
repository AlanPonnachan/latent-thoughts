/**
 * AttentionVisualizer.jsx
 *
 * Example interactive React component embedded inside a Markdown post.
 *
 * Renders a heatmap of attention weights between tokens.
 * The weights are randomly initialized but users can click to randomize.
 *
 * Embed in Markdown with a fenced code block:
 *
 * ```component
 * AttentionVisualizer
 * ```
 */
import { useState, useCallback } from 'react'

const TOKENS = ['The', 'cat', 'sat', 'on', 'the', 'mat']

function randomWeights(n) {
  const raw = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => Math.random())
  )
  // Softmax each row
  return raw.map(row => {
    const exp = row.map(v => Math.exp(v * 3))
    const sum = exp.reduce((a, b) => a + b, 0)
    return exp.map(v => v / sum)
  })
}

function lerp(a, b, t) { return a + (b - a) * t }

function weightToColor(w) {
  // 0 = cream, 1 = deep vermilion
  const r = Math.round(lerp(247, 192, w))
  const g = Math.round(lerp(244, 57,  w))
  const b = Math.round(lerp(239, 43,  w))
  return `rgb(${r},${g},${b})`
}

export default function AttentionVisualizer() {
  const [weights, setWeights] = useState(() => randomWeights(TOKENS.length))
  const [hoveredCell, setHoveredCell] = useState(null)

  const randomize = useCallback(() => {
    setWeights(randomWeights(TOKENS.length))
    setHoveredCell(null)
  }, [])

  const n = TOKENS.length
  const cellSize = 48

  return (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '1rem',
      }}>
        <p style={{ color: 'var(--ink-muted)', fontFamily: 'var(--font-body)', fontSize: '0.9rem' }}>
          Attention weight heatmap — each row sums to 1 (softmax).
        </p>
        <button
          onClick={randomize}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.7rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            background: 'transparent',
            border: '1px solid var(--ink-faint)',
            padding: '0.3em 0.8em',
            cursor: 'pointer',
            color: 'var(--ink-muted)',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.target.style.borderColor = 'var(--accent)'
            e.target.style.color = 'var(--accent)'
          }}
          onMouseLeave={e => {
            e.target.style.borderColor = 'var(--ink-faint)'
            e.target.style.color = 'var(--ink-muted)'
          }}
        >
          Randomize
        </button>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <svg
          width={cellSize * (n + 1) + 4}
          height={cellSize * (n + 1) + 4}
          role="img"
          aria-label="Attention weight heatmap"
        >
          {/* Column headers (key tokens) */}
          {TOKENS.map((tok, j) => (
            <text
              key={`col-${j}`}
              x={cellSize * (j + 1) + cellSize / 2}
              y={cellSize - 8}
              textAnchor="middle"
              fontSize="11"
              fill="var(--ink-muted)"
            >
              {tok}
            </text>
          ))}

          {/* Row headers (query tokens) + cells */}
          {TOKENS.map((rowTok, i) => (
            <g key={`row-${i}`}>
              {/* Row label */}
              <text
                x={cellSize - 6}
                y={cellSize * (i + 1) + cellSize / 2 + 4}
                textAnchor="end"
                fontSize="11"
                fill="var(--ink-muted)"
              >
                {rowTok}
              </text>

              {/* Weight cells */}
              {weights[i].map((w, j) => {
                const cx = cellSize * (j + 1)
                const cy = cellSize * (i + 1)
                const isHovered = hoveredCell?.i === i && hoveredCell?.j === j

                return (
                  <g key={`cell-${i}-${j}`}>
                    <rect
                      x={cx + 2}
                      y={cy + 2}
                      width={cellSize - 4}
                      height={cellSize - 4}
                      fill={weightToColor(w)}
                      rx={2}
                      style={{ cursor: 'default', transition: 'fill 0.4s' }}
                      onMouseEnter={() => setHoveredCell({ i, j, w })}
                      onMouseLeave={() => setHoveredCell(null)}
                    />
                    <text
                      x={cx + cellSize / 2}
                      y={cy + cellSize / 2 + 4}
                      textAnchor="middle"
                      fontSize="10"
                      fill={w > 0.4 ? '#fff' : 'var(--ink-muted)'}
                      style={{ pointerEvents: 'none', transition: 'opacity 0.4s' }}
                    >
                      {w.toFixed(2)}
                    </text>
                  </g>
                )
              })}
            </g>
          ))}
        </svg>
      </div>

      {/* Tooltip / legend */}
      <div style={{
        marginTop: '0.75rem',
        fontSize: '0.7rem',
        color: 'var(--ink-faint)',
        display: 'flex',
        gap: '1.5rem',
        flexWrap: 'wrap',
      }}>
        <span>Rows = query tokens</span>
        <span>Cols = key tokens</span>
        {hoveredCell && (
          <span style={{ color: 'var(--accent)' }}>
            {TOKENS[hoveredCell.i]} → {TOKENS[hoveredCell.j]}: {hoveredCell.w.toFixed(4)}
          </span>
        )}
      </div>
    </div>
  )
}
