import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ClaheHistogram() {
  const [step, setStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  // Sequence Timer Logic
  useEffect(() => {
    if (!isPlaying || step === 7) {
      if (step === 7) setIsPlaying(false)
      return
    }
    const timers = {
      0: 1000, 1: 1200, 2: 1000, 3: 1500, 
      4: 1500, 5: 1500, 6: 2000,
    }
    const t = setTimeout(() => setStep(s => s + 1), timers[step])
    return () => clearTimeout(t)
  }, [step, isPlaying])

  const handleNext = () => { setIsPlaying(false); setStep(s => Math.min(7, s + 1)) }
  const handlePrev = () => { setIsPlaying(false); setStep(s => Math.max(0, s - 1)) }
  const togglePlay = () => {
    if (step === 7) setStep(0)
    setIsPlaying(!isPlaying)
  }

  // Chart Data Setup
  const W = 600, H = 250
  const NUM_BINS = 24
  const CLIP_LIMIT = 80 
  const SPIKE_INDEX = 11

  // Generate bins
  const BASE_BINS = Array.from({ length: NUM_BINS }, (_, i) => {
    if (i >= SPIKE_INDEX - 1 && i <= SPIKE_INDEX + 1) return 180 - Math.abs(SPIKE_INDEX - i) * 10
    return 15 + Math.random() * 20
  })

  const totalExcess = BASE_BINS.reduce((acc, val) => acc + Math.max(0, val - CLIP_LIMIT), 0)
  const distributedHeight = totalExcess / NUM_BINS
  const barWidth = W / NUM_BINS

  const labels = [
    "Ready", "1. Dropping the Clip Limit", "2. Highlighting the Excess",
    "3. The Cut and Lift", "4. The Melt", "5. The Redistribution", 
    "6. Calculating the CDF Curve", "Animation Complete"
  ]

  // Standardized button style
  const btnStyle = { padding: '0.4rem 0.8rem', background: 'var(--code-border)', color: 'var(--ink-faint)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', transition: 'background 0.2s' }

  return (
    <div style={{ padding: '1.5rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: 'var(--accent)', fontSize: '0.85rem', fontWeight: 'bold' }}>{labels[step]}</div>
        
        {/* Controls */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={handlePrev} disabled={step === 0} style={{ ...btnStyle, opacity: step === 0 ? 0.5 : 1 }}>
            &larr; Prev
          </button>
          <button onClick={handleNext} disabled={step === 7} style={{ ...btnStyle, opacity: step === 7 ? 0.5 : 1 }}>
            Next &rarr;
          </button>
          <button onClick={togglePlay} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff', marginLeft: '0.5rem' }}>
            {isPlaying ? "Pause" : (step === 7 ? "Restart" : "Play Animation")}
          </button>
        </div>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible', background: '#1a1816', borderRadius: '4px' }}>
        {/* Base Bars */}
        {BASE_BINS.map((val, i) => {
          const isSpike = val > CLIP_LIMIT
          let currentHeight = val
          if (step >= 3 && isSpike) currentHeight = CLIP_LIMIT
          if (step >= 5) currentHeight += distributedHeight

          return (
            <motion.rect
              key={`base-${i}`}
              x={i * barWidth + 1} width={barWidth - 2} fill="#5e81ac"
              initial={false}
              animate={{ height: currentHeight, y: H - currentHeight }}
              transition={{ duration: 0.6 }}
            />
          )
        })}

        {/* Clip Limit Line */}
        <motion.line
          x1={0} x2={W} stroke="#bf616a" strokeWidth="2" strokeDasharray="6 4"
          initial={false}
          animate={{ y1: step >= 1 ? H - CLIP_LIMIT : 10, y2: step >= 1 ? H - CLIP_LIMIT : 10, opacity: step >= 1 ? 1 : 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Excess Blocks */}
        {BASE_BINS.map((val, i) => {
          if (val <= CLIP_LIMIT) return null
          const excess = val - CLIP_LIMIT

          let animState = { x: i * barWidth + 1, y: H - val, width: barWidth - 2, height: excess, fill: "#5e81ac", opacity: 1 }
          if (step === 2) animState = { ...animState, fill: "#d08770" }
          if (step === 3) animState = { ...animState, y: H - val - 40, fill: "#d08770" }
          if (step === 4) animState = { x: 0, width: W, y: H - CLIP_LIMIT - distributedHeight - 10, height: distributedHeight, fill: "#d08770", opacity: 1 }
          if (step >= 5) animState = { x: 0, width: W, y: H - distributedHeight, height: distributedHeight, fill: "#88c0d0", opacity: 0 }

          return (
            <motion.rect
              key={`excess-${i}`}
              initial={false} animate={animState} transition={{ duration: 0.6 }}
            />
          )
        })}

        {/* CDF Curve */}
        <motion.path
          d={`M 0 ${H} Q ${W/2} ${H - CLIP_LIMIT} ${W} 10`}
          fill="none" stroke="#a3be8c" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: step >= 6 ? 1 : 0, opacity: step >= 6 ? 1 : 0 }}
          transition={{ duration: 1 }}
        />
      </svg>
    </div>
  )
}