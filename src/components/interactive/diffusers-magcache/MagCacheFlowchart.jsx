 import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function MagCacheFlowchart() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [step, setStep] = useState(0)
  const [error, setError] = useState(0)
  const [skips, setSkips] = useState(0)
  const[activeNode, setActiveNode] = useState('START') // START, COND1, COND2, REUSE, COMPUTE

  const THRESHOLD = 0.06
  const MAX_SKIPS = 3

  useEffect(() => {
    if (!isPlaying || step > 45) {
      if (step > 45) setIsPlaying(false)
      return
    }

    let nextNode = ''
    let t = 800

    if (activeNode === 'START') {
      nextNode = 'COND1'
      t = 400
    } else if (activeNode === 'COND1') {
      // Past 80% mark (step 40), error spikes
      const currentError = step > 40 ? error + 0.05 : error + 0.015
      setError(currentError)
      nextNode = currentError < THRESHOLD ? 'COND2' : 'COMPUTE'
    } else if (activeNode === 'COND2') {
      nextNode = skips < MAX_SKIPS ? 'REUSE' : 'COMPUTE'
    } else {
      // Reached an end action, reset and go to START
      if (activeNode === 'COMPUTE') {
        setError(0)
        setSkips(0)
      } else {
        setSkips(s => s + 1)
      }
      setStep(s => s + 1)
      nextNode = 'START'
      t = 400
    }

    const timer = setTimeout(() => setActiveNode(nextNode), t)
    return () => clearTimeout(timer)
  }, [isPlaying, activeNode, step, error, skips])

  const reset = () => { setIsPlaying(false); setStep(0); setError(0); setSkips(0); setActiveNode('START') }

  const Node = ({ id, label, bg = "var(--paper-warm)", color = "var(--ink)" }) => {
    const isActive = activeNode === id
    return (
      <motion.div
        animate={{ scale: isActive ? 1.05 : 1, opacity: isActive ? 1 : 0.4 }}
        style={{ padding: '1rem', background: bg, color, borderRadius: '6px', textAlign: 'center', border: '1px solid var(--ink-faint)', flex: 1, zIndex: 2, boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.15)' : 'none' }}
      >
        <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{label}</span>
      </motion.div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div style={{ color: 'var(--ink-faint)', fontSize: '0.85rem' }}>
          <strong>State:</strong> Timestep {step} | Error: {error.toFixed(3)} | Skips: {skips}/{MAX_SKIPS}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => setIsPlaying(!isPlaying)} style={{ padding: '0.4rem 0.8rem', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            {isPlaying ? "Pause" : "Run Pipeline"}
          </button>
          <button onClick={reset} style={{ padding: '0.4rem 0.8rem', background: 'var(--code-border)', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '500px', margin: '0 auto', position: 'relative' }}>
        <Node id="START" label={`Timestep ${step}`} />
        <Node id="COND1" label={`Condition 1: Error < ${THRESHOLD}?`} />
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Node id="COMPUTE" label="COMPUTE NEW CACHE" bg="#bf616a" color="#fff" />
          <Node id="COND2" label={`Condition 2: Skips < ${MAX_SKIPS}?`} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{ width: 'calc(50% - 0.5rem)' }}>
            <Node id="REUSE" label="REUSE OLD CACHE" bg="#a3be8c" color="#1a1a1a" />
          </div>
        </div>
      </div>
    </div>
  )
}