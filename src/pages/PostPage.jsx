import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { format } from 'date-fns'
import { usePost } from '../hooks/usePost.js'
import { getSeries } from '../../content/registry.js'
import MarkdownRenderer from '../components/MarkdownRenderer.jsx'

// Helper to extract markdown headings
function extractHeadings(markdown) {
  const headings =[]
  const regex = /^(#{2,3})\s+(.*)$/gm 
  let match
  while ((match = regex.exec(markdown)) !== null) {
    headings.push({
      level: match[1].length,
      text: match[2].trim(),
      id: match[2].trim().toLowerCase().replace(/[^\w]+/g, '-').replace(/^-+|-+$/g, '')
    })
  }
  return headings
}

export default function PostPage() {
  const { postSlug } = useParams()
  const { post, content, frontmatter, loading, error } = usePost(postSlug)

  const toc = useMemo(() => extractHeadings(content), [content])

  // Custom scroll handler to prevent 404s with HashRouter
  const scrollToHeading = (e, id) => {
    e.preventDefault()
    const element = document.getElementById(id)
    if (element) {
      // Calculates position and offsets for the fixed header
      const y = element.getBoundingClientRect().top + window.scrollY - 100
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  if (loading) return <div className="container"><div className="state-loading">Loading post...</div></div>
  if (error || !post) return <div className="container"><div className="state-error">{error || 'Post not found'}</div></div>

  const series = getSeries(post.series)

  return (
    <div className="container container--wide post-layout">
      
      {/* LEFT COLUMN: Sticky Table of Contents */}
      {toc.length > 0 && (
        <aside className="post-sidebar">
          <div className="post-sidebar__sticky">
            <p className="post-sidebar__title">Contents</p>
            <ul className="post-sidebar__list">
              {toc.map((heading, i) => (
                <li key={i} className={`post-sidebar__item level-${heading.level}`}>
                  <button onClick={(e) => scrollToHeading(e, heading.id)}>
                    {heading.text}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {/* RIGHT COLUMN: The Actual Post Content */}
      <article className="post-content">
        <header className="post-header">
          {series && (
            <div className="post-header__breadcrumb">
              <Link to={`/series/${series.slug}`}>← {series.title}</Link>
            </div>
          )}
          <h1 className="post-header__title">{frontmatter.title}</h1>
          <p className="post-header__desc">{frontmatter.description}</p>
          <div className="post-header__meta">
            <span>{format(new Date(frontmatter.date), 'MMMM d, yyyy')}</span>
            {frontmatter.readingTime && <span>• {frontmatter.readingTime} min read</span>}
          </div>
        </header>

        {/* Markdown Renderer */}
        <MarkdownRenderer 
          content={content} 
          customComponents={post.components} 
        />
      </article>

    </div>
  )
}