/**
 * MarkdownRenderer.jsx
 *
 * Core rendering pipeline:
 *   Markdown string
 *   → react-markdown (with remark/rehype plugins)
 *   → custom component map (code blocks, math, mermaid, custom)
 *
 * Supports:
 *   - GFM (tables, strikethrough, task lists)
 *   - Inline and block math via KaTeX
 *   - Code syntax highlighting via Prism (rehype-prism-plus)
 *   - Mermaid diagrams (lazy-loaded)
 *   - Custom interactive React components injected via <Component name="X" />
 */
import { useMemo, useEffect, useRef, useState, Suspense, lazy } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypePrismPlus from 'rehype-prism-plus'

// ── Mermaid diagram component (lazy loads mermaid) ──────────────
function MermaidDiagram({ code }) {
  const ref = useRef(null)
  const [svg, setSvg] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: 'neutral',
          fontFamily: 'Lora, Georgia, serif',
        })
        const id = `mermaid-${Math.random().toString(36).slice(2)}`
        const { svg } = await mermaid.render(id, code)
        if (!cancelled) setSvg(svg)
      } catch (e) {
        if (!cancelled) setError(e.message)
      }
    }
    render()
    return () => { cancelled = true }
  }, [code])

  if (error) return <div className="state-error">Diagram error: {error}</div>
  if (!svg)  return <div className="state-loading">Rendering diagram…</div>

  return (
    <div
      className="mermaid-wrapper"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

// ── Code block component ─────────────────────────────────────────
function CodeBlock({ node, inline, className, children, customComponents, ...props }) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : ''
  const code = String(children).replace(/\n$/, '')

  // Mermaid: render as diagram
  if (lang === 'mermaid') {
    return <MermaidDiagram code={code} />
  }

  // Custom component: e.g. ```component\nAttentionVisualizer\n```
  if (lang === 'component' && customComponents) {
    const name = code.trim()
    const ComponentEntry = customComponents[name]
    if (ComponentEntry) {
      // ComponentEntry is a lazy-loaded component
      return (
        <div className="interactive-wrapper">
          <Suspense fallback={<div className="state-loading">Loading component…</div>}>
            <ComponentEntry />
          </Suspense>
        </div>
      )
    }
    return <div className="state-error">Component "{name}" not found.</div>
  }

  // Regular code block — prism highlighting applied by rehype-prism-plus
  return (
    <pre data-language={lang || undefined} {...props}>
      <code className={className}>{children}</code>
    </pre>
  )
}

// ── Main renderer ────────────────────────────────────────────────
export default function MarkdownRenderer({ content, customComponents = {} }) {
  // Build lazy component map from the loader promises
  const lazyComponents = useMemo(() => {
    const map = {}
    for (const [name, loader] of Object.entries(customComponents)) {
      map[name] = lazy(() => loader().then(mod => ({ default: mod.default ?? mod })))
    }
    return map
  }, [customComponents])

  const components = useMemo(() => ({
    // Route code blocks through our custom handler
    code(props) {
      return <CodeBlock {...props} customComponents={lazyComponents} />
    },
    // Style images with lazy loading
    img({ src, alt, ...props }) {
      return <img src={src} alt={alt} loading="lazy" {...props} />
    },
    // Make sure external links open in new tab
    a({ href, children, ...props }) {
      const isExternal = href?.startsWith('http')
      return (
        <a
          href={href}
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          {...props}
        >
          {children}
        </a>
      )
    },
  }), [lazyComponents])

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[
          rehypeKatex,
          rehypeRaw,         // allows raw HTML in MD (for custom component tags)
          [rehypePrismPlus, { ignoreMissing: true }],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
