import { useState } from 'react'

const IMAGE_URL = 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg'

export default function ClaheTileSplit() {
  const [isSplit, setIsSplit] = useState(false)
  const tiles = Array.from({ length: 64 }) // 8x8 grid

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', fontFamily: 'var(--font-mono)' }}>
      <button 
        onClick={() => setIsSplit(!isSplit)}
        style={{
          padding: '0.5rem 1rem', background: 'var(--ink)', color: 'var(--paper)', border: 'none',
          borderRadius: '4px', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: '0.8rem'
        }}
      >
        {isSplit ? 'Merge Image' : 'Split into Tiles'}
      </button>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(8, 1fr)',
        gap: isSplit ? '4px' : '0px',
        transition: 'gap 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        maxWidth: '400px',
        aspectRatio: '1/1',
        background: 'var(--paper-warm)',
        padding: isSplit ? '4px' : '0px',
        borderRadius: '8px'
      }}>
        {tiles.map((_, i) => {
          const x = i % 8
          const y = Math.floor(i / 8)
          return (
            <div 
              key={i}
              style={{
                width: '100%',
                height: '100%',
                backgroundImage: `url(${IMAGE_URL})`,
                backgroundSize: '800% 800%',
                backgroundPosition: `${x * (100 / 7)}% ${y * (100 / 7)}%`,
                borderRadius: isSplit ? '2px' : '0px',
                transform: isSplit ? 'scale(0.92)' : 'scale(1)',
                boxShadow: isSplit ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                transition: 'transform 0.5s ease, border-radius 0.5s ease, box-shadow 0.5s ease',
                transitionDelay: isSplit ? `${(x + y) * 20}ms` : '0ms'
              }}
            />
          )
        })}
      </div>
    </div>
  )
}