import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MagCacheFlowchart() {
  const [isPlaying, setIsPlaying] = useState(false)
  const[simState, setSimState] = useState({
    step: 0,
    accumulatedError: 0.0,
    consecutiveSkips: 0,
    currentNode: 'START', // 'START', 'COND1', 'COND2', 'REUSE', 'COMPUTE'
  })

  const THRESHOLD = 0.06
  const MAX_SKIPS = 3

  useEffect(() => {
    if (!isPlaying || simState.step >= 50) {
      if (simState.step >= 50) setIsPlaying(false)
      return
    }

    const tick = () => {
      setSimState(prev => {
        const { step, accumulatedError, consecutiveSkips, currentNode } = prev

        switch(currentNode) {
          case 'START':
            // Add a realistic error. Once we cross step 40 (80%), error spikes
            const addedError = step > 40 ? 0.04 : 0.015
            return { ...prev, accumulatedError: accumulatedError + addedError, currentNode: 'COND1' }
          
          case 'COND1':
            if (accumulatedError <= THRESHOLD) {
              return { ...prev, currentNode: 'COND2' }
            } else {
              return { ...prev, currentNode: 'COMPUTE' }
            }
            
          case 'COND2':
            if (consecutiveSkips < MAX_SKIPS) {
              return { ...prev, currentNode: 'REUSE' }
            } else {
              return { ...prev, currentNode: 'COMPUTE' }
            }
            
          case 'REUSE':
            return { ...prev, step: step + 1, consecutiveSkips: consecutiveSkips + 1, currentNode: 'START' }
            
          case 'COMPUTE':
            return { ...prev, step: step + 1, accumulatedError: 0, consecutiveSkips: 0, currentNode: 'START' }
            
          default:
            return prev
        }
      })
    }

    // Adjust timing so users can watch the decisions happen
    const timer = setTimeout(tick, 800)
    return () => clearTimeout(timer)
  },[isPlaying, simState])

  const reset = () => {
    setIsPlaying(false)
    setSimState({ step: 0, accumulatedError: 0.0, consecutiveSkips: 0, currentNode: 'START' })
  }

  // Visual Node Component
  const Node = ({ id, label, bg = "var(--paper-warm)", color = "var(--ink)", style = {} }) => {
    const isActive = simState.currentNode === id
    return (
      <motion.div
        initial={false}
        animate={{ scale: isActive ? 1.05 : 1, opacity: isActive ? 1 : 0.35 }}
        transition={{ duration: 0.2 }}
        style={{
          padding: '1rem', background: bg, color, borderRadius: '6px', 
          textAlign: 'center', border: '1px solid var(--ink-faint)', 
          boxShadow: isActive ? '0 0 0 2px var(--accent), 0 4px 12px rgba(0,0,0,0.2)' : 'none',
          fontWeight: isActive ? 'bold' : 'normal',
          ...style
        }}
      >
        {label}
      </motion.div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <span><strong>Timestep:</strong> {simState.step}/50</span>
          <span><strong>Error Accumulator:</strong> {simState.accumulatedError.toFixed(3)}</span>
          <span><strong>Consecutive Skips:</strong> {simState.consecutiveSkips}/{MAX_SKIPS}</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '0.5rem 1rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isPlaying ? "Pause" : "Play Sequence"}
          </button>
          <button onClick={reset} style={{ padding: '0.5rem 1rem', background: 'var(--code-border)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Grid Layout representing the flow */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '0.5rem 1rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--ink-muted)' }}>
        
        {/* ROW 1: Start */}
        <div style={{ gridColumn: '1 / 2' }}>
          <Node id="START" label={`[New Timestep ${simState.step}] + Add Error`} />
        </div>

        {/* ROW 2: Arrow Down */}
        <div style={{ gridColumn: '1 / 2', textAlign: 'center' }}>↓</div>

        {/* ROW 3: Condition 1 (And start COMPUTE spanning the right side) */}
        <div style={{ gridColumn: '1 / 2' }}>
          <Node id="COND1" label={`Cond 1: Error (${simState.accumulatedError.toFixed(3)}) < ${THRESHOLD}?`} />
        </div>
        <div style={{ gridColumn: '2 / 3', textAlign: 'center', fontWeight: 'bold' }}>→ No →</div>
        <div style={{ gridColumn: '3 / 4', gridRow: '3 / 8' }}>
          <Node 
            id="COMPUTE" 
            label="COMPUTE NEW CACHE" 
            bg="#bf616a" color="#fff" 
            style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }} 
          />
        </div>

        {/* ROW 4: Arrow Down */}
        <div style={{ gridColumn: '1 / 2', textAlign: 'center', fontWeight: 'bold' }}>↓ Yes</div>

        {/* ROW 5: Condition 2 */}
        <div style={{ gridColumn: '1 / 2' }}>
          <Node id="COND2" label={`Cond 2: Skips (${simState.consecutiveSkips}) < ${MAX_SKIPS}?`} />
        </div>
        <div style={{ gridColumn: '2 / 3', textAlign: 'center', fontWeight: 'bold' }}>→ No →</div>

        {/* ROW 6: Arrow Down */}
        <div style={{ gridColumn: '1 / 2', textAlign: 'center', fontWeight: 'bold' }}>↓ Yes</div>

        {/* ROW 7: Reuse */}
        <div style={{ gridColumn: '1 / 2' }}>
          <Node id="REUSE" label="REUSE OLD CACHE" bg="#a3be8c" color="#1a1a1a" />
        </div>

      </div>
    </div>
  )
}