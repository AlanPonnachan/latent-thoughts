import { Link, useParams } from 'react-router-dom'
import { getSeries, getSeriesPosts } from '../../content/registry.js'
import { format } from 'date-fns'

export default function SeriesPage() {
  const { seriesSlug } = useParams()
  const series = getSeries(seriesSlug)
  const posts = getSeriesPosts(seriesSlug)

  if (!series) {
    return (
      <div className="container">
        <div className="state-error">Series not found.</div>
      </div>
    )
  }

  return (
    <div className="container">
      <header className="series-header">
        <Link to="/" className="series-header__back">← All series</Link>
        <p className="series-header__tag">Series</p>
        <h1 className="series-header__title">{series.title}</h1>
        <p className="series-header__desc">{series.description}</p>
      </header>

      {posts.length === 0 ? (
        <p style={{ color: 'var(--ink-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
          No posts yet. Check back soon.
        </p>
      ) : (
        <ol className="post-list">
          {posts.map((post, i) => (
            <li key={post.slug} className="post-list-item">
              <span className="post-list-item__num">{String(i + 1).padStart(2, '0')}</span>
              <div className="post-list-item__content">
                <Link to={`/post/${post.slug}`} className="post-list-item__link">
                  {post.title}
                </Link>
                <div className="post-list-item__meta">
                  {format(new Date(post.date), 'MMMM d, yyyy')}
                  {post.description && ` — ${post.description}`}
                </div>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
