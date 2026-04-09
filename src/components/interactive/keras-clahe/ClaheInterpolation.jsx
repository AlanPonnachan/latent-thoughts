import { useState, useRef, useEffect } from 'react'

export default function ClaheInterpolation() {
  // Target dot position
  const [pos, setPos] = useState({ x: 75, y: 75 }) // Starts top-left center
  const [smooth, setSmooth] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef(null)

  // Tile Base Colors (Grayscale): TL (Dark), TR (Light), BL (Medium), BR (White)
  const C_TL = 40
  const C_TR = 200
  const C_BL = 120
  const C_BR = 250

  // Math: Calculate distances and weights
  // Centers are at (75,75), (225,75), (75,225), (225,225)
  const xNorm = Math.max(0, Math.min(1, (pos.x - 75) / 150))
  const yNorm = Math.max(0, Math.min(1, (pos.y - 75) / 150))
  
  const wTL = (1 - xNorm) * (1 - yNorm)
  const wTR = xNorm * (1 - yNorm)
  const wBL = (1 - xNorm) * yNorm
  const wBR = xNorm * yNorm

  const resultColor = Math.round(
    wTL * C_TL + wTR * C_TR + wBL * C_BL + wBR * C_BR
  )

  const updatePosition = (clientX, clientY) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    setPos({
      x: Math.max(0, Math.min(300, clientX - rect.left)),
      y: Math.max(0, Math.min(300, clientY - rect.top))
    })
  }

  const onPointerDown = (e) => {
    setIsDragging(true)
    e.target.setPointerCapture(e.pointerId)
    updatePosition(e.clientX, e.clientY)
  }

  const onPointerMove = (e) => {
    if (isDragging) updatePosition(e.clientX, e.clientY)
  }

  const onPointerUp = (e) => {
    setIsDragging(false)
    e.target.releasePointerCapture(e.pointerId)
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'flex-start', fontFamily: 'var(--font-mono)', background: 'var(--code-bg)', padding: '2rem', borderRadius: '8px' }}>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1, minWidth: '300px' }}>
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', margin: 0 }}>Drag the red target pixel to see weights change.</p>
        
        <svg 
          ref={svgRef} 
          width="100%" viewBox="0 0 300 300"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'grab', borderRadius: '4px', overflow: 'hidden' }}
        >
          <g style={{ filter: smooth ? 'blur(40px)' : 'none', transition: 'filter 1s ease' }}>
            <rect x="0" y="0" width="150" height="150" fill={`rgb(${C_TL},${C_TL},${C_TL})`} />
            <rect x="150" y="0" width="150" height="150" fill={`rgb(${C_TR},${C_TR},${C_TR})`} />
            <rect x="0" y="150" width="150" height="150" fill={`rgb(${C_BL},${C_BL},${C_BL})`} />
            <rect x="150" y="150" width="150" height="150" fill={`rgb(${C_BR},${C_BR},${C_BR})`} />
          </g>

          {/* Center markers */}
          <circle cx="75" cy="75" r="4" fill="#bf616a" />
          <circle cx="225" cy="75" r="4" fill="#bf616a" />
          <circle cx="75" cy="225" r="4" fill="#bf616a" />
          <circle cx="225" cy="225" r="4" fill="#bf616a" />

          {/* Connecting Lines (Thickness based on weight) */}
          <line x1={pos.x} y1={pos.y} x2="75" y2="75" stroke="#bf616a" strokeWidth={Math.max(0.5, wTL * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="75" stroke="#bf616a" strokeWidth={Math.max(0.5, wTR * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="75" y2="225" stroke="#bf616a" strokeWidth={Math.max(0.5, wBL * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="225" stroke="#bf616a" strokeWidth={Math.max(0.5, wBR * 10)} opacity={smooth ? 0 : 0.8} />

          {/* Draggable Target Pixel */}
          <circle cx={pos.x} cy={pos.y} r="10" fill="#bf616a" stroke="#fff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
        </svg>

        <button 
          onClick={() => setSmooth(!smooth)}
          style={{ padding: '0.6rem 1rem', background: smooth ? 'var(--paper)' : 'var(--accent)', color: smooth ? 'var(--ink)' : '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s' }}
        >
          {smooth ? 'Show Harsh Tile Borders' : 'Apply Interpolation to All'}
        </button>
      </div>

      {/* Output Panel */}
      <div style={{ flex: 1, minWidth: '240px', background: 'var(--paper)', padding: '1.5rem', borderRadius: '8px', color: 'var(--ink)' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--ink)' }}>Final Interpolated Pixel Color</h3>
        
        <div style={{ 
            width: '100%', height: '100px', 
            background: `rgb(${resultColor},${resultColor},${resultColor})`,
            borderRadius: '4px',
            marginBottom: '1rem',
            border: '1px solid var(--ink-faint)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
            RGB: {resultColor}
          </span>
        </div>
        
        <div style={{ fontSize: '0.75rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.5rem', color: 'var(--ink-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Top-Left (Weight):</span> <strong>{(wTL * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Top-Right (Weight):</span> <strong>{(wTR * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bottom-Left (Weight):</span> <strong>{(wBL * 100).toFixed(1)}%</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Bottom-Right (Weight):</span> <strong>{(wBR * 100).toFixed(1)}%</strong>
          </div>
        </div>
      </div>

    </div>
  )
}