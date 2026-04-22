import { useState } from 'react'

export default function MagCacheChart() {
  const [step, setStep] = useState(0)
  const TOTAL_STEPS = 50

  // Generate synthetic mock data matching the paper's curve
  const points = Array.from({ length: TOTAL_STEPS + 1 }, (_, i) => {
    if (i < 5) return 1.0
    if (i <= 40) return 0.98 - (i * 0.0005) // Slow decay
    return 0.96 - ((i - 40) * 0.03) // Sharp drop
  })

  // Chart dimensions
  const W = 600, H = 250, PAD = 20
  
  // Coordinate mappers
  const getX = (val) => PAD + (val / TOTAL_STEPS) * (W - PAD * 2)
  const getY = (val) => H - PAD - ((val - 0.6) / 0.45) * (H - PAD * 2) // Domain 0.6 to 1.05

  // Generate SVG Path
  const pathD = points.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(val)}`).join(' ')

  let message = ""
  let messageColor = "var(--ink-faint)"
  
  if (step < 10) {
    message = "Initial steps (Retention Phase). Skipping disabled to form base composition."
    messageColor = "#81a1c1" // Blue
  } else if (step <= 40) {
    message = "Ratio is highly stable ≈ 0.98. Redundancy is high. Safe to cache & skip."
    messageColor = "#a3be8c" // Green
  } else {
    message = "Ratio dropping rapidly. Major detail changes occurring. Must compute."
    messageColor = "#bf616a" // Red
  }

  return (
    <div style={{ padding: '1.5rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      <div style={{ marginBottom: '1rem', color: messageColor, fontSize: '0.85rem', fontWeight: 'bold', minHeight: '2.5em' }}>
        {message}
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#1a1816', borderRadius: '4px', overflow: 'visible' }}>
        {/* Grid lines */}
        {[0.7, 0.8, 0.9, 1.0].map(val => (
          <g key={val}>
            <line x1={PAD} x2={W - PAD} y1={getY(val)} y2={getY(val)} stroke="#333" strokeWidth="1" />
            <text x={0} y={getY(val) + 4} fill="#666" fontSize="10">{val}</text>
          </g>
        ))}

        {/* The Curve */}
        <path d={pathD} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        
        {/* The Scrubber Line */}
        <line x1={getX(step)} x2={getX(step)} y1={PAD} y2={H - PAD} stroke="#fff" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx={getX(step)} cy={getY(points[step])} r="6" fill="#fff" />
      </svg>

      <div style={{ marginTop: '1.5rem' }}>
        <input 
          type="range" min="0" max={TOTAL_STEPS} value={step} 
          onChange={(e) => setStep(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--ink-faint)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
          <span>Step 0 (100% Noise)</span>
          <span>Step {step}</span>
          <span>Step 50 (0% Noise)</span>
        </div>
      </div>
    </div>
  )
}