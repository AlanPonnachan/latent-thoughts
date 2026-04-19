import { useState, useRef } from 'react'

export default function MagCacheCompare() {
  const [sliderVal, setSliderVal] = useState(50)
  const containerRef = useRef(null)

  // NOTE: You should slice your provided grid into these two specific 1:1 aspect ratio images
  const baseImg = "/images/diffusers-magcache/panda_baseline.jpg"
  const magImg = "/images/diffusers-magcache/panda_magcache.jpg"

  // Fallbacks if images are missing, rendering colored blocks
  return (
    <div style={{ margin: '2rem auto', maxWidth: '600px', fontFamily: 'var(--font-mono)' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#2e2b28', borderRadius: '8px', overflow: 'hidden' }} ref={containerRef}>
        
        {/* Underneath Image (Baseline) */}
        <img 
          src={baseImg} 
          alt="Baseline Generation" 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.target.style.display='none'; }}
        />
        <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}>
          Original (187.2s)
        </div>

        {/* Top Image (MagCache) dynamically clipped */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', clipPath: `inset(0 ${100 - sliderVal}% 0 0)` }}>
          <img 
            src={magImg} 
            alt="MagCache Generation" 
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => { e.target.style.display='none'; }}
          />
          <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', background: 'var(--accent)', color: '#fff', padding: '0.2rem 0.5rem', fontSize: '0.75rem', borderRadius: '4px' }}>
            MagCache (69.7s)
          </div>
        </div>

        {/* Custom Slider Thumb / Line */}
        <div style={{ position: 'absolute', top: 0, bottom: 0, left: `${sliderVal}%`, width: '2px', background: '#fff', transform: 'translateX(-50%)', pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '32px', height: '32px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </div>
        </div>

        {/* Invisible Range Input spanning the container */}
        <input 
          type="range" min="0" max="100" value={sliderVal} 
          onChange={(e) => setSliderVal(Number(e.target.value))}
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'ew-resize', margin: 0 }}
        />
      </div>
      <p style={{ textAlign: 'center', color: 'var(--ink-faint)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
        Drag to compare visual fidelity
      </p>
    </div>
  )
}