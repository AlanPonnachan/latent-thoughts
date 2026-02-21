import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="container" style={{ textAlign: 'center', paddingTop: '6rem' }}>
      <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--ink-faint)', letterSpacing: '0.1em', marginBottom: '1rem' }}>
        404
      </p>
      <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 300, fontSize: '2.5rem', letterSpacing: '-0.03em', marginBottom: '1.5rem' }}>
        Page not found.
      </h1>
      <Link to="/" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
        ← Back to home
      </Link>
    </div>
  )
}
