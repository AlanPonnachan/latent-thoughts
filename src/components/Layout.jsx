import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-logo">
            gradient<span>.</span>descent
          </Link>
          <nav>
            <ul className="site-nav">
              <li><NavLink to="/">Home</NavLink></li>
              <li><a href="https://github.com/YOUR_USERNAME" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <p>Written with care. No ads. No tracking. Built with React + Vite.</p>
      </footer>
    </div>
  )
}
