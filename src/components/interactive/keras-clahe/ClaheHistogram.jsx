import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ClaheHistogram() {
  const [step, setStep] = useState(0)

  // Sequence Timer Logic
  useEffect(() => {
    if (step === 0 || step === 7) return
    const timers = {
      1: 1200, // Drop limit
      2: 1000, // Highlight excess
      3: 1500, // Cut and lift
      4: 1500, // Melt
      5: 1500, // Redistribute
      6: 2000, // CDF Curve
    }
    const t = setTimeout(() => setStep(s => s + 1), timers[step])
    return () => clearTimeout(t)
  }, [step])

  // Chart Data Setup
  const W = 600, H = 250
  const NUM_BINS = 24
  const CLIP_LIMIT = 80 // Y threshold from bottom
  const SPIKE_INDEX = 11

  // Generate bins: mostly low, massive spike in the middle
  const BASE_BINS = Array.from({ length: NUM_BINS }, (_, i) => {
    if (i >= SPIKE_INDEX - 1 && i <= SPIKE_INDEX + 1) return 180 - Math.abs(SPIKE_INDEX - i) * 10
    return 15 + Math.random() * 20
  })

  // Math
  const totalExcess = BASE_BINS.reduce((acc, val) => acc + Math.max(0, val - CLIP_LIMIT), 0)
  const distributedHeight = totalExcess / NUM_BINS
  const barWidth = W / NUM_BINS

  const labels = [
    "Ready", "1. Dropping the Clip Limit", "2. Highlighting the Excess",
    "3. The Cut and Lift", "4. The Melt", "5. The Redistribution", 
    "6. Calculating the CDF Curve", "Animation Complete"
  ]

  return (
    <div style={{ padding: '2rem 1rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>{labels[step]}</div>
        <button 
          onClick={() => setStep(step === 0 || step === 7 ? 1 : 0)}
          style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
        >
          {step > 0 && step < 7 ? "Reset" : "Play Sequence"}
        </button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', overflow: 'visible' }}>
        {/* Base Bars */}
        {BASE_BINS.map((val, i) => {
          const isSpike = val > CLIP_LIMIT
          // After step 4, the base limits to CLIP_LIMIT. After step 5, it gains distributed height.
          let currentHeight = val
          if (step >= 3 && isSpike) currentHeight = CLIP_LIMIT
          if (step >= 5) currentHeight += distributedHeight

          return (
            <motion.rect
              key={`base-${i}`}
              x={i * barWidth + 1}
              width={barWidth - 2}
              fill="#5e81ac"
              initial={{ height: val, y: H - val }}
              animate={{ height: currentHeight, y: H - currentHeight }}
              transition={{ duration: 0.8 }}
            />
          )
        })}

        {/* Clip Limit Dashed Line */}
        <motion.line
          x1={0} x2={W} stroke="#bf616a" strokeWidth="2" strokeDasharray="6 4"
          initial={{ y1: 10, y2: 10, opacity: 0 }}
          animate={{
            y1: step >= 1 ? H - CLIP_LIMIT : 10,
            y2: step >= 1 ? H - CLIP_LIMIT : 10,
            opacity: step >= 1 ? 1 : 0
          }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />

        {/* The Excess Blocks (The top of the spikes) */}
        {BASE_BINS.map((val, i) => {
          if (val <= CLIP_LIMIT) return null
          const excess = val - CLIP_LIMIT

          // Morphing logic
          let animState = {}
          if (step === 2) animState = { fill: "#d08770" } // Highlight
          if (step === 3) animState = { y: H - val - 40, fill: "#d08770" } // Lift up
          if (step === 4) animState = { // Melt into a long bar
            x: 0, width: W, y: H - CLIP_LIMIT - distributedHeight - 10, height: distributedHeight, fill: "#d08770" 
          }
          if (step >= 5) animState = { // Drop to floor
            x: 0, width: W, y: H - distributedHeight, height: distributedHeight, fill: "#88c0d0", opacity: 0 
          } // Merges via opacity to base bars

          return (
            <motion.rect
              key={`excess-${i}`}
              initial={{ x: i * barWidth + 1, y: H - val, width: barWidth - 2, height: excess, fill: "#5e81ac" }}
              animate={animState}
              transition={{ duration: 0.8, ease: "easeInOut" }}
            />
          )
        })}

        {/* Step 2 Label */}
        <motion.text
          x={W / 2} y={30} fill="#d08770" fontSize="14" textAnchor="middle"
          initial={{ opacity: 0 }}
          animate={{ opacity: step === 2 || step === 3 ? 1 : 0 }}
        >
          Excess Pixels
        </motion.text>

        {/* CDF Curve Overlay (Step 6) */}
        <motion.path
          d={`M 0 ${H} Q ${W/2} ${H - CLIP_LIMIT} ${W} 10`}
          fill="none" stroke="#a3be8c" strokeWidth="4" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: step >= 6 ? 1 : 0, opacity: step >= 6 ? 1 : 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />
      </svg>
    </div>
  )
}