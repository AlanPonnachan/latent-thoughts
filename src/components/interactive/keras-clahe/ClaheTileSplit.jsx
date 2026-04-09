import { useState, useEffect } from 'react'

const IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg'

export default function ClaheTileSplit() {
  const [step, setStep] = useState(0)

  // Auto-play the sequence when started
  useEffect(() => {
    if (step === 0 || step === 5) return
    const timers = {
      1: 1500, // Show grid lines -> Move to split
      2: 1500, // Split -> Move to emphasis
      3: 1000, // Emphasis -> Move to highlight
      4: 3000, // Highlight -> End
    }
    const t = setTimeout(() => setStep(s => s + 1), timers[step])
    return () => clearTimeout(t)
  }, [step])

  const tiles = Array.from({ length: 16 }) // 4x4 grid
  
  // State booleans for rendering logic
  const showLines = step >= 1 && step < 2
  const isSplit = step >= 2
  const isEmphasis = step >= 3
  const isHighlight = step >= 4

  return (
    <div style={{ padding: '2rem 1rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
          {step === 0 && "Ready"}
          {step === 1 && "1. Grid Reveal"}
          {step === 2 && "2. The Split"}
          {step === 3 && "3. Tile Emphasis"}
          {step === 4 && "4. Local Focus"}
          {step === 5 && "Animation Complete"}
        </div>
        <button 
          onClick={() => setStep(step === 0 || step === 5 ? 1 : 0)}
          style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          {step > 0 && step < 5 ? "Reset" : "Play Animation Sequence"}
        </button>
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: '340px', margin: '0 auto', aspectRatio: '1/1' }}>
        
        {/* The Grid lines Overlay (Step 1) */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 10, pointerEvents: 'none',
          opacity: showLines ? 1 : 0, transition: 'opacity 0.5s ease',
          backgroundImage: 'linear-gradient(to right, transparent 24.5%, red 24.5%, red 25.5%, transparent 25.5%, transparent 49.5%, red 49.5%, red 50.5%, transparent 50.5%, transparent 74.5%, red 74.5%, red 75.5%, transparent 75.5%), linear-gradient(to bottom, transparent 24.5%, red 24.5%, red 25.5%, transparent 25.5%, transparent 49.5%, red 49.5%, red 50.5%, transparent 50.5%, transparent 74.5%, red 74.5%, red 75.5%, transparent 75.5%)'
        }} />

        {/* The 4x4 Tiles */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          width: '100%', height: '100%',
          gap: isSplit ? '8px' : '0px',
          transition: 'gap 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {tiles.map((_, i) => {
            const row = Math.floor(i / 4)
            const col = i % 4
            const isTarget = row === 1 && col === 1 // Row 2, Col 2 (0-indexed)

            // Dynamic styles based on state sequence
            let transform = 'scale(1)'
            let opacity = 1
            let zIndex = 1
            let boxShadow = 'none'

            if (isHighlight) {
              if (isTarget) {
                transform = 'scale(1.15)'
                zIndex = 20
                boxShadow = '0 0 0 2px var(--accent), 0 8px 24px rgba(0,0,0,0.5)'
              } else {
                opacity = 0.3
              }
            }

            return (
              <div 
                key={i}
                style={{
                  width: '100%', height: '100%',
                  backgroundImage: `url(${IMAGE_URL})`,
                  backgroundSize: '400% 400%',
                  backgroundPosition: `${col * (100 / 3)}% ${row * (100 / 3)}%`,
                  borderRadius: isEmphasis ? '4px' : '0px',
                  boxShadow: isEmphasis && !isHighlight ? '0 4px 12px rgba(0,0,0,0.4)' : boxShadow,
                  transform, opacity, zIndex,
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative'
                }}
              >
                {/* Highlight Label */}
                {isTarget && isHighlight && (
                  <div style={{
                    position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--accent)', color: '#fff', padding: '0.3rem 0.6rem',
                    borderRadius: '4px', fontSize: '0.65rem', whiteSpace: 'nowrap',
                    opacity: isHighlight ? 1 : 0, transition: 'opacity 0.4s 0.3s'
                  }}>
                    Histogram calculated locally
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}