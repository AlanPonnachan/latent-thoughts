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
              <li><a href="https://alanponnachan.github.io/#/contact" target="_blank" rel="noopener noreferrer">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      <footer className="site-footer">
        <p>Latent Thoughts &copy; {new Date().getFullYear()}.</p>
      </footer>
    </div>
  )
}