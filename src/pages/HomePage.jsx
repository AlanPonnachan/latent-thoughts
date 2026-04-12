import { Link } from 'react-router-dom'
import { SERIES, getSeriesPosts } from '../../content/registry.js'

export default function HomePage() {
  return (
    <div className="container">
      {/* Hero */}
       <section className="home-hero">
        <p className="home-hero__eyebrow">Machine Learning & Engineering</p>
        <h1 className="home-hero__title">
          To truly understand it, we must <em>build it.</em>
        </h1>
        <p className="home-hero__desc">
          A technical diary documenting the journey from theory to implementation. 
          Exploring ML research, writing algorithms from scratch, and contributing to open source.
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
