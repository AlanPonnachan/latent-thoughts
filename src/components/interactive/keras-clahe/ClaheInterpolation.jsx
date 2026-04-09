import { useState, useRef } from 'react'

export default function ClaheInterpolation() {
  const [pos, setPos] = useState({ x: 75, y: 75 }) 
  const [smooth, setSmooth] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const svgRef = useRef(null)

  const C_TL = 40, C_TR = 200, C_BL = 120, C_BR = 250

  const xNorm = Math.max(0, Math.min(1, (pos.x - 75) / 150))
  const yNorm = Math.max(0, Math.min(1, (pos.y - 75) / 150))
  
  const wTL = (1 - xNorm) * (1 - yNorm)
  const wTR = xNorm * (1 - yNorm)
  const wBL = (1 - xNorm) * yNorm
  const wBR = xNorm * yNorm

  const resultColor = Math.round(wTL * C_TL + wTR * C_TR + wBL * C_BL + wBR * C_BR)

  const updatePosition = (clientX, clientY) => {
    if (!svgRef.current) return
    const rect = svgRef.current.getBoundingClientRect()
    // By multiplying by (300 / rect.width), we ensure the dragging math 
    // stays perfectly accurate even if CSS scales the SVG down!
    const scale = 300 / rect.width
    setPos({
      x: Math.max(0, Math.min(300, (clientX - rect.left) * scale)),
      y: Math.max(0, Math.min(300, (clientY - rect.top) * scale))
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
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', fontFamily: 'var(--font-mono)', background: 'var(--code-bg)', padding: '1.5rem', borderRadius: '8px' }}>
      
      {/* LEFT: Grid Area */}
      <div style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <p style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', margin: 0 }}>Drag the red target pixel to calculate weights.</p>
        
        <svg 
          ref={svgRef} 
          viewBox="0 0 300 300"
          width="100%"
          height="auto"
          onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          style={{ touchAction: 'none', cursor: isDragging ? 'grabbing' : 'crosshair', borderRadius: '4px', overflow: 'hidden', background: '#000', maxHeight: '350px' }}
        >
          <g style={{ filter: smooth ? 'blur(40px)' : 'none', transition: 'filter 1s ease' }}>
            <rect x="0" y="0" width="150" height="150" fill={`rgb(${C_TL},${C_TL},${C_TL})`} />
            <rect x="150" y="0" width="150" height="150" fill={`rgb(${C_TR},${C_TR},${C_TR})`} />
            <rect x="0" y="150" width="150" height="150" fill={`rgb(${C_BL},${C_BL},${C_BL})`} />
            <rect x="150" y="150" width="150" height="150" fill={`rgb(${C_BR},${C_BR},${C_BR})`} />
          </g>

          <circle cx="75" cy="75" r="4" fill="#bf616a" />
          <circle cx="225" cy="75" r="4" fill="#bf616a" />
          <circle cx="75" cy="225" r="4" fill="#bf616a" />
          <circle cx="225" cy="225" r="4" fill="#bf616a" />

          <line x1={pos.x} y1={pos.y} x2="75" y2="75" stroke="#bf616a" strokeWidth={Math.max(0.5, wTL * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="75" stroke="#bf616a" strokeWidth={Math.max(0.5, wTR * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="75" y2="225" stroke="#bf616a" strokeWidth={Math.max(0.5, wBL * 10)} opacity={smooth ? 0 : 0.8} />
          <line x1={pos.x} y1={pos.y} x2="225" y2="225" stroke="#bf616a" strokeWidth={Math.max(0.5, wBR * 10)} opacity={smooth ? 0 : 0.8} />

          <circle cx={pos.x} cy={pos.y} r="10" fill="#bf616a" stroke="#fff" strokeWidth="2" style={{ pointerEvents: 'none' }} />
        </svg>

        <button 
          onClick={() => setSmooth(!smooth)}
          style={{ padding: '0.6rem 1rem', background: smooth ? '#3b3734' : 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem', transition: 'all 0.3s' }}
        >
          {smooth ? 'Show Harsh Tile Borders' : 'Apply Interpolation to All'}
        </button>
      </div>

      {/* RIGHT: Output Panel */}
      <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ background: 'var(--paper)', padding: '1.5rem', borderRadius: '8px', color: 'var(--ink)', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--ink)' }}>Final Pixel Color</h3>
          
          <div style={{ 
              width: '100%', height: '80px', 
              background: `rgb(${resultColor},${resultColor},${resultColor})`,
              borderRadius: '4px', marginBottom: '1.5rem',
              border: '1px solid var(--ink-faint)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.85rem' }}>
              RGB: {resultColor}
            </span>
          </div>
          
          <div style={{ fontSize: '0.8rem', display: 'grid', gridTemplateColumns: '1fr', gap: '0.75rem', color: 'var(--ink-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Top-Left:</span> <strong style={{ color: 'var(--ink)' }}>{(wTL * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Top-Right:</span> <strong style={{ color: 'var(--ink)' }}>{(wTR * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bottom-Left:</span> <strong style={{ color: 'var(--ink)' }}>{(wBL * 100).toFixed(1)}%</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Bottom-Right:</span> <strong style={{ color: 'var(--ink)' }}>{(wBR * 100).toFixed(1)}%</strong>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}