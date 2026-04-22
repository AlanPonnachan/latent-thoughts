import { useState, useEffect } from 'react'

export default function MagCacheProgressBar() {
  const[isPlaying, setIsPlaying] = useState(false)
  const [baseProg, setBaseProg] = useState(0)
  const [magProg, setMagProg] = useState(0)
  const [magState, setMagState] = useState("Computing")

  useEffect(() => {
    if (!isPlaying) return
    
    // Baseline logic (Linear constant compute)
    let b = 0
    const bTimer = setInterval(() => {
      b += 2
      setBaseProg(Math.min(100, b))
      if (b >= 100) clearInterval(bTimer)
    }, 100) // 5 seconds total

    // MagCache logic (Computes some, skips fast)
    let m = 0
    const advanceMag = () => {
      if (m >= 100) return
      
      // Retention phase (first 20%) or late phase (> 80%)
      const mustCompute = m < 20 || m > 80 || m % 8 === 0 // pseudo-random compute
      
      setMagState(mustCompute ? "Computing Block" : "Cache Hit! (Skipping)")
      m += 2
      setMagProg(Math.min(100, m))
      
      // Delay: Compute takes 100ms, Skip takes 10ms
      setTimeout(advanceMag, mustCompute ? 100 : 10)
    }
    advanceMag()

    return () => clearInterval(bTimer)
  }, [isPlaying])

  const reset = () => { setIsPlaying(false); setBaseProg(0); setMagProg(0); setMagState("Waiting...") }

  const Bar = ({ title, progress, color, status }) => (
    <div style={{ marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--ink-faint)', marginBottom: '0.5rem' }}>
        <span>{title}</span>
        <span>{status}</span>
      </div>
      <div style={{ width: '100%', height: '24px', background: 'var(--code-border)', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ width: `${progress}%`, height: '100%', background: color, transition: 'width 0.1s linear' }} />
      </div>
    </div>
  )

  return (
    <div style={{ padding: '1.5rem', background: 'var(--code-bg)', borderRadius: '8px', fontFamily: 'var(--font-mono)' }}>
      <Bar title="Standard Pipeline" progress={baseProg} color="#5e81ac" status={`${baseProg}%`} />
      <Bar title="MagCache Pipeline" progress={magProg} color="var(--accent)" status={`${magProg}% - ${magProg === 100 ? "Finished" : magState}`} />
      
      <button onClick={() => { reset(); setTimeout(() => setIsPlaying(true), 50) }} style={{ padding: '0.4rem 0.8rem', background: 'var(--paper)', color: 'var(--ink)', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}>
        Start Benchmark Race
      </button>
    </div>
  )
}