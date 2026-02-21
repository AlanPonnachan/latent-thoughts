/**
 * usePost.js
 *
 * Loads a registered blog post:
 *   1. Finds the post in the registry
 *   2. Dynamically imports its Markdown file (Vite raw import)
 *   3. Strips YAML frontmatter (gray-matter runs client-side)
 *   4. Returns { post, content, frontmatter, loading, error }
 */
import { useState, useEffect } from 'react'
import matter from 'gray-matter'
import { getPost } from '../../content/registry.js'

export function usePost(slug) {
  const [state, setState] = useState({
    post: null,
    content: '',
    frontmatter: {},
    loading: true,
    error: null,
  })

  useEffect(() => {
    if (!slug) return

    const post = getPost(slug)
    if (!post) {
      setState(s => ({ ...s, loading: false, error: 'Post not found.' }))
      return
    }

    let cancelled = false

    post.loader()
      .then(mod => {
        if (cancelled) return
        const raw = typeof mod === 'string' ? mod : mod.default
        // gray-matter parses frontmatter from the raw MD string
        const { data: frontmatter, content } = matter(raw)
        setState({
          post,
          content,
          frontmatter,
          loading: false,
          error: null,
        })
      })
      .catch(err => {
        if (!cancelled) setState(s => ({ ...s, loading: false, error: err.message }))
      })

    return () => { cancelled = true }
  }, [slug])

  return state
}
