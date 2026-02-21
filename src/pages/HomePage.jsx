import { Link } from 'react-router-dom'
import { SERIES, getSeriesPosts } from '../../content/registry.js'

export default function HomePage() {
  return (
    <div className="container">
      {/* Hero */}
      <section className="home-hero">
        <p className="home-hero__eyebrow">AI / ML Research Notes</p>
        <h1 className="home-hero__title">
          Making hard ideas<br />
          <em>click.</em>
        </h1>
        <p className="home-hero__desc">
          Deep dives into research papers, mathematical concepts, and implementations —
          written for practitioners who want intuition, not just formulas.
        </p>
      </section>

      {/* Series grid */}
      <section>
        <p className="series-section__title">Series</p>
        <div className="series-grid">
          {SERIES.map(series => {
            const posts = getSeriesPosts(series.slug)
            return (
              <Link
                key={series.slug}
                to={`/series/${series.slug}`}
                className="series-card"
              >
                <p className="series-card__tag">Series</p>
                <h2 className="series-card__title">{series.title}</h2>
                <p className="series-card__desc">{series.description}</p>
                <p className="series-card__count">
                  {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
