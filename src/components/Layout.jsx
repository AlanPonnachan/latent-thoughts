import { Link, NavLink } from 'react-router-dom'

export default function Layout({ children }) {
  return (
    <div className="layout">
      <header className="site-header">
        <div className="site-header__inner">
          <Link to="/" className="site-logo">
            latent<span>.</span>thoughts
          </Link>
          <nav>
            <ul className="site-nav">
              <li><NavLink to="/">Home</NavLink></li>
              <li><a href="https://github.com/AlanPonnachan" target="_blank" rel="noopener noreferrer">GitHub</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <p>Written with care. No ads. Built with React + Vite.</p>
      </footer>
    </div>
  )
}