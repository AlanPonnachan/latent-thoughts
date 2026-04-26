import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import SeriesPage from './pages/SeriesPage.jsx'
import PostPage from './pages/PostPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import StudioPage from './pages/StudioPage.jsx'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* === STUDIO ROUTES (No Header/Footer, Full Canvas) === */}
        <Route path="/studio/:componentId" element={<StudioPage />} />

        {/* === MAIN BLOG ROUTES === */}
        <Route path="*" element={
          <Layout>
            <Routes>
              <Route path="/"                    element={<HomePage />} />
              <Route path="/series/:seriesSlug"  element={<SeriesPage />} />
              <Route path="/post/:postSlug"      element={<PostPage />} />
              <Route path="*"                    element={<NotFoundPage />} />
            </Routes>
          </Layout>
        } />
      </Routes>
    </Router>
  )
}