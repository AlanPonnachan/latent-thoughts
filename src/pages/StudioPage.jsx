import { useParams } from 'react-router-dom'

// Import all interactive components
import MagCacheChart from '../components/interactive/diffusers-magcache/MagCacheChart.jsx'
import MagCacheFlowchart from '../components/interactive/diffusers-magcache/MagCacheFlowchart.jsx'
import MagCacheProgressBar from '../components/interactive/diffusers-magcache/MagCacheProgressBar.jsx'
import ClaheTileSplit from '../components/interactive/keras-clahe/ClaheTileSplit.jsx'
import ClaheHistogram from '../components/interactive/keras-clahe/ClaheHistogram.jsx'
import ClaheInterpolation from '../components/interactive/keras-clahe/ClaheInterpolation.jsx'

const COMPONENTS = {
  'magcache-chart': MagCacheChart,
  'magcache-flowchart': MagCacheFlowchart,
  'magcache-progress': MagCacheProgressBar,
  'clahe-split': ClaheTileSplit,
  'clahe-histogram': ClaheHistogram,
  'clahe-interp': ClaheInterpolation,
}

export default function StudioPage() {
  const { componentId } = useParams()
  const Component = COMPONENTS[componentId]

  if (!Component) {
    return <div style={{ color: 'white', padding: '2rem', fontFamily: 'var(--font-mono)' }}>Component not found in Studio.</div>
  }

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        radial-gradient(circle at center, transparent 0%, #0a0a0a 100%),
        radial-gradient(circle, rgba(255, 255, 255, 0.25) 1.5px, transparent 1.5px)
      `,
      backgroundSize: '100% 100%, 24px 24px',
      backgroundPosition: 'center center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '900px',
        borderRadius: '8px',
        boxShadow: '0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), 0 0 120px rgba(255,255,255,0.03)'
      }}>
        <Component />
      </div>
    </div>
  )
}