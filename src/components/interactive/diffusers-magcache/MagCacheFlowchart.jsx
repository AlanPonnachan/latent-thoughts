import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

// --- Visual Sub-Components ---
const ArrowRight = ({ active }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.15, transition: 'opacity 0.2s', color: 'var(--ink)' }}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="12" x2="20" y2="12"></line>
      <polyline points="14 5 21 12 14 19"></polyline>
    </svg>
  </div>
)

const ArrowDown = ({ active }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: active ? 1 : 0.15, transition: 'opacity 0.2s', color: '#bf616a', height: '100%' }}>
    <span style={{ fontSize: '0.6rem', fontWeight: 'bold', marginBottom: '2px', textTransform: 'uppercase' }}>No</span>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="20"></line>
      <polyline points="5 14 12 21 19 14"></polyline>
    </svg>
  </div>
)

const NodeBase = ({ active, label, bg, color, children, isWarning }) => (
  <motion.div
    animate={{ 
      scale: active ? 1.05 : 1, 
      opacity: active ? 1 : 0.4, 
      y: active ? -4 : 0,
      backgroundColor: isWarning ? '#d08770' : bg
    }}
    transition={{ type: "spring", stiffness: 400, damping: 20 }}
    style={{
      padding: '0.75rem 0.5rem', color: color, borderRadius: '6px',
      textAlign: 'center', border: '1px solid rgba(0,0,0,0.1)',
      boxShadow: active ? `0 8px 16px rgba(0,0,0,0.15)` : 'none',
      position: 'relative', display: 'flex', flexDirection: 'column',
      justifyContent: 'center', minHeight: '80px', zIndex: 2
    }}
  >
    <strong style={{ fontSize: '0.75rem', letterSpacing: '0.02em', lineHeight: 1.2 }}>{label}</strong>
    {children}
  </motion.div>
)

export default function MagCacheFlowchart() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [simState, setSimState] = useState({
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


    let delay = 1200
    if (simState.currentNode === 'START') delay = 800
    if (simState.currentNode === 'REUSE') delay = 1000
    if (simState.currentNode === 'COMPUTE') delay = 1800

    const timer = setTimeout(() => {
      setSimState(prev => {
        const { step, accumulatedError, consecutiveSkips, currentNode } = prev

        switch(currentNode) {
          case 'START':
            const addedError = step > 40 ? 0.045 : 0.015
            return { ...prev, accumulatedError: accumulatedError + addedError, currentNode: 'COND1' }
          case 'COND1':
            return { ...prev, currentNode: accumulatedError <= THRESHOLD ? 'COND2' : 'COMPUTE' }
          case 'COND2':
            return { ...prev, currentNode: consecutiveSkips < MAX_SKIPS ? 'REUSE' : 'COMPUTE' }
          case 'REUSE':
            return { ...prev, step: step + 1, consecutiveSkips: consecutiveSkips + 1, currentNode: 'START' }
          case 'COMPUTE':
            return { ...prev, step: step + 1, accumulatedError: 0, consecutiveSkips: 0, currentNode: 'START' }
          default:
            return prev
        }
      })
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, simState])

  const reset = () => {
    setIsPlaying(false)
    setSimState({ step: 0, accumulatedError: 0.0, consecutiveSkips: 0, currentNode: 'START' })
  }

  const failedFromCond1 = simState.currentNode === 'COMPUTE' && simState.accumulatedError > THRESHOLD
  const failedFromCond2 = simState.currentNode === 'COMPUTE' && simState.accumulatedError <= THRESHOLD

  return (
    <div style={{ padding: '1.25rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)', width: '100%', boxSizing: 'border-box' }}>
      
      {/* Embedded CSS handles Desktop Grid vs Mobile Wrap gracefully */}
      <style>{`
        .mc-grid {
          display: grid;
          grid-template-columns: 1fr 20px 1.2fr 20px 1.2fr 20px 1fr;
          grid-template-rows: auto 40px auto;
          gap: 6px;
          align-items: center;
          width: 100%;
        }
        .mc-col-start { grid-column: 1 / 2; grid-row: 1 / 2; }
        .mc-arr-1 { grid-column: 2 / 3; grid-row: 1 / 2; }
        .mc-col-c1 { grid-column: 3 / 4; grid-row: 1 / 2; }
        .mc-arr-2 { grid-column: 4 / 5; grid-row: 1 / 2; }
        .mc-col-c2 { grid-column: 5 / 6; grid-row: 1 / 2; }
        .mc-arr-3 { grid-column: 6 / 7; grid-row: 1 / 2; }
        .mc-col-reuse { grid-column: 7 / 8; grid-row: 1 / 2; }
        
        .mc-fail-1 { grid-column: 3 / 4; grid-row: 2 / 3; }
        .mc-fail-2 { grid-column: 5 / 6; grid-row: 2 / 3; }
        
        .mc-col-compute { grid-column: 3 / 6; grid-row: 3 / 4; }

        @media (max-width: 640px) {
          .mc-grid { display: flex; flex-direction: column; gap: 12px; }
          .mc-arr-1, .mc-arr-2, .mc-arr-3 { transform: rotate(90deg); height: 20px; margin: 0 auto; }
          .mc-fail-1, .mc-fail-2 { display: none; }
          .mc-col-start, .mc-col-c1, .mc-col-c2, .mc-col-reuse, .mc-col-compute { width: 100%; }
          .mc-col-compute { order: 10; margin-top: 1rem; }
        }
      `}</style>
      
      {/* Header Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
          State Machine Simulation (Step {simState.step}/50)
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>
            {isPlaying ? "Pause" : (simState.step >= 50 ? "Restart" : "Play Sequence")}
          </button>
          <button onClick={reset} style={{ padding: '0.4rem 0.8rem', background: 'var(--code-border)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
            Reset
          </button>
        </div>
      </div>

      <div className="mc-grid">
        
        {/* ROW 1: The Fast Path (Skip) */}
        <div className="mc-col-start">
          <NodeBase active={simState.currentNode === 'START'} label={`Timestep ${simState.step}`} bg="#5e81ac" color="#fff">
            <div style={{ fontSize: '0.65rem', marginTop: '0.5rem', opacity: 0.8 }}>+ Inject Error</div>
          </NodeBase>
        </div>

        <div className="mc-arr-1"><ArrowRight active={simState.currentNode === 'COND1'} /></div>

        <div className="mc-col-c1">
          <NodeBase active={simState.currentNode === 'COND1'} isWarning={simState.currentNode === 'COND1' && simState.accumulatedError > THRESHOLD} label={`Cond 1: Error < ${THRESHOLD}?`} bg="var(--paper-warm)" color="var(--ink)">
            <div style={{ marginTop: '0.5rem', background: 'rgba(0,0,0,0.15)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
              <motion.div
                animate={{ 
                  width: `${Math.min(100, (simState.accumulatedError / THRESHOLD) * 100)}%`, 
                  backgroundColor: simState.accumulatedError > THRESHOLD ? '#bf616a' : '#a3be8c' 
                }}
                transition={{ duration: 0.3 }}
                style={{ height: '100%' }}
              />
            </div>
            <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', color: 'var(--ink-muted)' }}>
              Total: {simState.accumulatedError.toFixed(3)}
            </div>
          </NodeBase>
        </div>

        <div className="mc-arr-2"><ArrowRight active={simState.currentNode === 'COND2'} /></div>

        <div className="mc-col-c2">
          <NodeBase active={simState.currentNode === 'COND2'} isWarning={simState.currentNode === 'COND2' && simState.consecutiveSkips >= MAX_SKIPS} label={`Cond 2: Skips < ${MAX_SKIPS}?`} bg="var(--paper-warm)" color="var(--ink)">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '0.5rem' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ 
                  width: '10px', height: '10px', borderRadius: '50%', 
                  background: simState.consecutiveSkips > i ? '#a3be8c' : 'rgba(0,0,0,0.08)', 
                  border: simState.consecutiveSkips > i ? 'none' : '1px solid rgba(0,0,0,0.15)' 
                }} />
              ))}
            </div>
            <div style={{ fontSize: '0.65rem', marginTop: '0.3rem', color: 'var(--ink-muted)' }}>
              Tokens: {simState.consecutiveSkips}
            </div>
          </NodeBase>
        </div>

        <div className="mc-arr-3"><ArrowRight active={simState.currentNode === 'REUSE'} /></div>

        <div className="mc-col-reuse">
          <NodeBase active={simState.currentNode === 'REUSE'} label="REUSE CACHE" bg="#a3be8c" color="#1a1a1a">
             <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', opacity: 0.8 }}>(Bypass)</div>
          </NodeBase>
        </div>

        {/* ROW 2: Failure Arrows pointing downward */}
        <div className="mc-fail-1"><ArrowDown active={failedFromCond1} /></div>
        <div className="mc-fail-2"><ArrowDown active={failedFromCond2} /></div>

        {/* ROW 3: The Heavy Compute Path */}
        <div className="mc-col-compute">
          <NodeBase active={simState.currentNode === 'COMPUTE'} label="COMPUTE NEW CACHE" bg="#bf616a" color="#fff">
            <div style={{ fontSize: '0.65rem', marginTop: '0.4rem', opacity: 0.9 }}>
              (Resets Error & Skips to 0)
            </div>
          </NodeBase>
        </div>

      </div>
    </div>
  )
}