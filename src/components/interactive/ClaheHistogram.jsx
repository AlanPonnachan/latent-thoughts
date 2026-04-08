import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ClaheHistogram() {
  const [step, setStep] = useState(0)
  
  // Data setup
  const W = 500, H = 250
  const CLIP_LIMIT = 80
  const BASE_BINS = [30, 45, 20, 180, 25, 10, 15, 20, 15, 5]
  const EXCESS = BASE_BINS[3] - CLIP_LIMIT // 100
  const DISTRIBUTED = EXCESS / BASE_BINS.length // 10
  
  const barWidth = W / BASE_BINS.length

  const nextStep = () => setStep(s => (s + 1) % 4)

  const stepsInfo = [
    "1. Calculate Histogram",
    "2. Apply Clip Limit",
    "3. Extract Excess",
    "4. Redistribute Evenly"
  ]

  return (
    <div style={{ fontFamily: 'var(--font-mono)', width: '100%', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{stepsInfo[step]}</p>
        <button onClick={nextStep} style={{
          padding: '0.4rem 0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem'
        }}>Next Step</button>
      </div>

      <svg viewBox={`0 0 ${W} ${H}`} style={{ background: 'var(--code-bg)', borderRadius: '8px', width: '100%' }}>
        {/* The Base Bars */}
        {BASE_BINS.map((val, i) => {
          const finalVal = val === 180 ? CLIP_LIMIT + DISTRIBUTED : val + DISTRIBUTED
          const height = step === 3 ? finalVal : (val > CLIP_LIMIT && step > 1 ? CLIP_LIMIT : val)
          
          return (
            <motion.rect
              key={`base-${i}`}
              x={i * barWidth + 2}
              y={H - height}
              width={barWidth - 4}
              height={height}
              fill="#81a1c1"
              animate={{ height, y: H - height }}
              transition={{ duration: 0.6 }}
            />
          )
        })}

        {/* The Clip Limit Line */}
        <motion.line
          x1={0} x2={W}
          y1={H - CLIP_LIMIT} y2={H - CLIP_LIMIT}
          stroke="#bf616a" strokeWidth="2" strokeDasharray="5 5"
          initial={{ opacity: 0 }}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
        />

        {/* The Excess / Redistributed Block */}
        <motion.rect
          fill="#d08770"
          initial={false}
          animate={
            step === 0 || step === 1 ? { 
              x: 3 * barWidth + 2, 
              y: H - BASE_BINS[3], 
              width: barWidth - 4, 
              height: step === 1 ? EXCESS : 0,
              opacity: step === 1 ? 1 : 0
            } : step === 2 ? {
              x: 0, 
              y: 20, 
              width: W, 
              height: DISTRIBUTED,
              opacity: 1
            } : {
              x: 0, 
              y: H - DISTRIBUTED, 
              width: W, 
              height: DISTRIBUTED,
              opacity: 1 // In reality, we merge this down visually
            }
          }
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        
        {/* Distributed Overlay (To show it merging with bottom) */}
        {BASE_BINS.map((_, i) => (
           <motion.rect
             key={`dist-${i}`}
             x={i * barWidth + 2}
             width={barWidth - 4}
             fill="#d08770"
             initial={{ height: 0, y: H, opacity: 0 }}
             animate={{ 
               height: step === 3 ? DISTRIBUTED : 0, 
               y: step === 3 ? H - (i===3 ? CLIP_LIMIT+DISTRIBUTED : BASE_BINS[i]+DISTRIBUTED) : H,
               opacity: step === 3 ? 1 : 0 
             }}
             transition={{ duration: 0.8 }}
           />
        ))}
      </svg>
    </div>
  )
}