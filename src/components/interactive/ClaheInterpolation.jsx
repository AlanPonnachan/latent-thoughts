import { useState, useRef, useEffect } from 'react'

export default function ClaheInterpolation() {
  const [pos, setPos] = useState({ x: 150, y: 150 })
  const [smooth, setSmooth] = useState(false)
  const svgRef = useRef(null)

  // Top-Left (Dark), Top-Right (Light), Bottom-Left (Medium-Light), Bottom-Right (Medium-Dark)
  const COLORS = [40, 220, 180, 80]
  
  // Calculate Bilinear Weights
  // Centers are at (75,75), (225,75), (75,225), (225,225)
  // Normalize pos relative to the grid of centers (width 150)
  const xNorm = Math.max(0, Math.min(1, (pos.x - 75) / 150))
  const yNorm = Math.max(0, Math.min(1, (pos.y - 75) / 150))
  
  const wTL = (1 - xNorm) * (1 - yNorm)
  const wTR = xNorm * (1 - yNorm)
  const wBL = (1 - xNorm) * yNorm
  const wBR = xNorm * yNorm

  const resultColor = Math.round(
    wTL * COLORS[0] + wTR * COLORS[1] + wBL * COLORS[2] + wBR * COLORS[3]
  )

  const handlePointerMove = (e) => {
    if (e.buttons !== 1) return
    const rect = svgRef.current.getBoundingClientRect()
    // Constrain to grid boundaries
    const x = Math.max(0, Math.min(300, e.clientX - rect.left))
    const y = Math.max(0, Math.min(300, e.clientY - rect.top))
    setPos({ x, y })
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        
        <svg 
          ref={svgRef} 
          width="300" height="300" 
          onPointerDown={handlePointerMove}
          onPointerMove={handlePointerMove}
          style={{ touchAction: 'none', cursor: 'crosshair', borderRadius: '4px', overflow: 'hidden' }}
        >
          {/* Base Grid */}
          <rect x="0" y="0" width="150" height="150" fill={`rgb(${COLORS[0]},${COLORS[0]},${COLORS[0]})`} />
          <rect x="150" y="0" width="150" height="150" fill={`rgb(${COLORS[1]},${COLORS[1]},${COLORS[1]})`} />
          <rect x="0" y="150" width="150" height="150" fill={`rgb(${COLORS[2]},${COLORS[2]},${COLORS[2]})`} />
          <rect x="150" y="150" width="150" height="150" fill={`rgb(${COLORS[3]},${COLORS[3]},${COLORS[3]})`} />

          {/* Smooth Blur Overlay */}
          {smooth && (
            <foreignObject x="0" y="0" width="300" height="300">
              <div style={{ width: '100%', height: '100%', backdropFilter: 'blur(40px)' }} />
            </foreignObject>
          )}

          {/* Lines to centers */}
          <line x1={pos.x} y1={pos.y} x2="75" y2="75" stroke="#e74c3c" strokeWidth={wTL * 8} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="75" stroke="#e74c3c" strokeWidth={wTR * 8} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="75" y2="225" stroke="#e74c3c" strokeWidth={wBL * 8} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="225" stroke="#e74c3c" strokeWidth={wBR * 8} opacity={smooth ? 0 : 0.8} />

          {/* Target Dot */}
          <circle cx={pos.x} cy={pos.y} r="8" fill="#e74c3c" stroke="#fff" strokeWidth="2" />
        </svg>

        <label style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input type="checkbox" checked={smooth} onChange={e => setSmooth(e.target.checked)} />
          Smooth Image (Apply Blur Filter)
        </label>
      </div>

      <div style={{ background: 'var(--paper-warm)', padding: '1.5rem', borderRadius: '8px', minWidth: '240px' }}>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>Result Pixel</p>
        <div style={{ 
            width: '100%', height: '80px', 
            background: `rgb(${resultColor},${resultColor},${resultColor})`,
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid var(--ink-faint)'
        }} />
        
        <div style={{ fontSize: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>TL Weight: {(wTL * 100).toFixed(1)}%</div>
          <div>TR Weight: {(wTR * 100).toFixed(1)}%</div>
          <div>BL Weight: {(wBL * 100).toFixed(1)}%</div>
          <div>BR Weight: {(wBR * 100).toFixed(1)}%</div>
        </div>
      </div>
    </div>
  )
}