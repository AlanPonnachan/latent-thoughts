/**
 * MarkdownRenderer.jsx
 */
import { useMemo, useEffect, useRef, useState, Suspense, lazy, isValidElement } from 'react'
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

// ── Mermaid diagram component ───────────────────────────────────
function MermaidDiagram({ code }) {
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
          securityLevel: 'loose',
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

// ── Code Component (Handles content generation) ────────────────
function CodeBlock({ node, inline, className, children, customComponents, ...props }) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : ''
  const rawCode = getCodeString(children).replace(/\n$/, '')

  // 1. Mermaid
  if (lang === 'mermaid') {
    return <MermaidDiagram code={rawCode} />
  }

  // 2. Interactive Components
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

  // 3. Regular Code
  // Note: We return JUST the <code> tag here. The parent <pre> is handled by PreBlock.
  return (
    <code className={className} {...props}>
      {children}
    </code>
  )
}

// ── Pre Component (Handles the wrapper) ────────────────────────
// This determines if we should render a styled <pre> box or a plain fragment
function PreBlock({ children, ...props }) {
  // Inspect the child <code> element to detect the language
  if (isValidElement(children) && children.type === 'code' || children.props?.className) {
     const className = children.props.className || ''
     const match = /language-(\w+)/.exec(className || '')
     const lang = match ? match[1] : ''

     // If it is a special component, DO NOT render the <pre> wrapper
     // This removes the black background/border
     if (lang === 'mermaid' || lang === 'component') {
       return <>{children}</>
     }
  }

  // Default behavior: render the <pre> (which has the dark theme)
  return <pre {...props}>{children}</pre>
}

// ── Main Renderer ──────────────────────────────────────────────
export default function MarkdownRenderer({ content, customComponents = {} }) {
  // Build lazy map
  const lazyComponents = useMemo(() => {
    const map = {}
    for (const [name, loader] of Object.entries(customComponents)) {
      map[name] = lazy(() => loader().then(mod => ({ default: mod.default ?? mod })))
    }
    return map
  }, [customComponents])

  const components = useMemo(() => ({
    // Override both PRE and CODE to control wrapping
    pre: PreBlock,
    code: (props) => <CodeBlock {...props} customComponents={lazyComponents} />,
    
    // Zoomable Images
    img: ({ src, ...props }) => {
      // Fix relative paths for production (GitHub Pages)
      const fixedSrc = (src && src.startsWith('/') && !src.startsWith('//'))
        ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${src}`
        : src
      return <ZoomableImage src={fixedSrc} {...props} />
    },
    
    // External Links
    a: ({ href, children, ...props }) => {
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