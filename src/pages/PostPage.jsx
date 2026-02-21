import { useParams, Link } from 'react-router-dom'
import { usePost } from '../hooks/usePost.js'
import { getSeries, getSeriesPosts } from '../../content/registry.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'
import { format } from 'date-fns'
import { useMemo } from 'react'

export default function PostPage() {
  const { postSlug } = useParams()
  const { post, content, frontmatter, loading, error } = usePost(postSlug)

  // Determine prev/next within the series
  const { prev, next } = useMemo(() => {
    if (!post) return { prev: null, next: null }
    const seriesPosts = getSeriesPosts(post.series)
    const idx = seriesPosts.findIndex(p => p.slug === post.slug)
    return {
      prev: idx > 0 ? seriesPosts[idx - 1] : null,
      next: idx < seriesPosts.length - 1 ? seriesPosts[idx + 1] : null,
    }
  }, [post])

  const series = post ? getSeries(post.series) : null

  if (loading) {
    return (
      <div className="container">
        <div className="state-loading">Loading post…</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container">
        <div className="state-error">{error}</div>
      </div>
    )
  }

  const title = frontmatter.title || post.title
  const description = frontmatter.description || post.description
  const date = frontmatter.date || post.date

  return (
    <div className="container">
      {/* Breadcrumb + header */}
      <header className="post-header">
        <div className="post-header__breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {series && <Link to={`/series/${post.series}`}>{series.title}</Link>}
          {series && <span>/</span>}
          <span>{title}</span>
        </div>

        {series && <p className="post-header__series">{series.title}</p>}
        <h1 className="post-header__title">{title}</h1>
        {description && <p className="post-header__desc">{description}</p>}

        <div className="post-header__meta">
          <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
          {frontmatter.readingTime && <span>{frontmatter.readingTime} min read</span>}
        </div>
      </header>

      {/* Rendered Markdown */}
      <MarkdownRenderer
        content={content}
        customComponents={post.components || {}}
      />

      {/* Prev / Next navigation */}
      {(prev || next) && (
        <nav className="post-nav" aria-label="Post navigation">
          {prev ? (
            <Link to={`/post/${prev.slug}`} className="post-nav__item post-nav__item--prev">
              <span className="post-nav__label">← Previous</span>
              <span className="post-nav__title">{prev.title}</span>
            </Link>
          ) : <div />}

          {next ? (
            <Link to={`/post/${next.slug}`} className="post-nav__item post-nav__item--next">
              <span className="post-nav__label">Next →</span>
              <span className="post-nav__title">{next.title}</span>
            </Link>
          ) : <div />}
        </nav>
      )}
    </div>
  )
}
