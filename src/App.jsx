/**
 * App.jsx
 *
 * GitHub Pages project pages don't support server-side routing,
 * so we use HashRouter (URL: username.github.io/repo/#/path).
 *
 * Alternative: BrowserRouter + a 404.html redirect trick (included
 * in public/404.html) for cleaner URLs. Both approaches shown.
 */
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import SeriesPage from './pages/SeriesPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/series/:seriesSlug"  element={<SeriesPage />} />
          <Route path="/post/:postSlug"      element={<PostPage />} />
          <Route path="*"                    element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </Router>
  )
}
