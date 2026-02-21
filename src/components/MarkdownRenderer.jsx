import { useMemo, useEffect, useRef, useState, Suspense, lazy } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypePrismPlus from 'rehype-prism-plus'
import ZoomableImage from './ZoomableImage.jsx'

// --- Helper: Extract raw text from React children ---
function getCodeString(children) {
  if (children === undefined || children === null) return ''
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(getCodeString).join('')
  if (typeof children === 'object' && children.props) return getCodeString(children.props.children)
  return ''
}

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
        // Mermaid expects pure text, not "[object Object]"
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
  
  // FIX: Use helper to extract clean text from the React children tree
  const rawCode = getCodeString(children).replace(/\n$/, '')

  // Mermaid: render as diagram
  if (lang === 'mermaid') {
    return <MermaidDiagram code={rawCode} />
  }

  // Custom component: e.g. ```component\nAttentionVisualizer\n```
  if (lang === 'component' && customComponents) {
    const name = rawCode.trim()
    const ComponentEntry = customComponents[name]
    if (ComponentEntry) {
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

  // Regular code block — pass children directly (preserving Prism highlighting nodes)
  // We only used rawCode for logic/mermaid; for display, we want the highlighted children.
  return (
    <pre data-language={lang || undefined} {...props}>
      <code className={className}>{children}</code>
    </pre>
  )
}

// ── Main renderer ────────────────────────────────────────────────
export default function MarkdownRenderer({ content, customComponents = {} }) {
  const lazyComponents = useMemo(() => {
    const map = {}
    for (const [name, loader] of Object.entries(customComponents)) {
      map[name] = lazy(() => loader().then(mod => ({ default: mod.default ?? mod })))
    }
    return map
  }, [customComponents])

  const components = useMemo(() => ({
    code(props) {
      return <CodeBlock {...props} customComponents={lazyComponents} />
    },
    img(props) {
      return <ZoomableImage {...props} />
    },
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
          rehypeRaw,
          [rehypePrismPlus, { ignoreMissing: true }],
        ]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}