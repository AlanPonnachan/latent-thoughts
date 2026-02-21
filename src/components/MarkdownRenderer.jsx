/**
 * src/components/MarkdownRenderer.jsx
 */
import { useMemo, useEffect, useRef, useState, Suspense, lazy, isValidElement } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkMath from 'remark-math'
import remarkGfm from 'remark-gfm'
import rehypeKatex from 'rehype-katex'
import rehypeRaw from 'rehype-raw'
import rehypePrismPlus from 'rehype-prism-plus'
import ZoomableImage from './ZoomableImage.jsx'

// --- Helper: Extract text from React children ---
function getCodeString(children) {
  if (children === undefined || children === null) return ''
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(getCodeString).join('')
  if (typeof children === 'object' && children.props) return getCodeString(children.props.children)
  return ''
}

// ── Mermaid Diagram (No changes) ──────────────────────────────
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

  return <div className="mermaid-wrapper" dangerouslySetInnerHTML={{ __html: svg }} />
}

// ── Code Content Handler ──────────────────────────────────────
// This handles the inner content. If it's mermaid/component, it renders them.
function CodeBlockContent({ className, children, customComponents, ...props }) {
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : ''
  const rawCode = getCodeString(children).replace(/\n$/, '')

  if (lang === 'mermaid') return <MermaidDiagram code={rawCode} />

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

  // Regular code: Return children as-is so Prism styles apply
  return <code className={className} {...props}>{children}</code>
}

// ── The UI Wrapper (Header + Copy Button) ─────────────────────
function PreBlock({ children, customComponents, ...props }) {
  // 1. Detect Language
  let lang = ''
  if (isValidElement(children) && (children.type === 'code' || children.props?.className)) {
     const match = /language-(\w+)/.exec(children.props.className || '')
     lang = match ? match[1] : ''
  }

  // 2. Special cases (Mermaid/Interactive) -> No UI Wrapper, just render
  if (lang === 'mermaid' || lang === 'component') {
    return <CodeBlockContent className={`language-${lang}`} customComponents={customComponents}>{children.props.children}</CodeBlockContent>
  }

  // 3. Regular Code -> Render "Terminal" UI
  const [copied, setCopied] = useState(false)
  const rawText = getCodeString(children)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(rawText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy', err)
    }
  }

  return (
    <div className="code-block-container">
      <div className="code-block-header">
        <span className="code-lang">{lang || 'text'}</span>
        <button 
          className={`code-copy-btn ${copied ? 'copied' : ''}`} 
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? (
            // Checkmark Icon
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
          ) : (
            // Copy Icon
            <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          )}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre {...props}>{children}</pre>
    </div>
  )
}

// ── Main Renderer ──────────────────────────────────────────────
export default function MarkdownRenderer({ content, customComponents = {} }) {
  const lazyComponents = useMemo(() => {
    const map = {}
    for (const [name, loader] of Object.entries(customComponents)) {
      map[name] = lazy(() => loader().then(mod => ({ default: mod.default ?? mod })))
    }
    return map
  }, [customComponents])

  const components = useMemo(() => ({
    // Pass customComponents down to PreBlock
    pre: (props) => <PreBlock {...props} customComponents={lazyComponents} />,
    // CodeBlockContent is handled inside PreBlock now for special cases, 
    // but ReactMarkdown still calls 'code' for inline code or inside pre.
    code: (props) => {
      // If we are inside a PRE, the PRE component handles the rendering. 
      // This mainly handles inline code.
      return <code className={props.className}>{props.children}</code>
    },
    img: ({ src, ...props }) => {
      const fixedSrc = (src && src.startsWith('/') && !src.startsWith('//'))
        ? `${import.meta.env.BASE_URL.replace(/\/$/, '')}${src}`
        : src
      return <ZoomableImage src={fixedSrc} {...props} />
    },
    a: ({ href, children, ...props }) => {
      const isExternal = href?.startsWith('http')
      return (
        <a href={href} {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}{...props}>
          {children}
        </a>
      )
    },
  }), [lazyComponents])

  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw, [rehypePrismPlus, { ignoreMissing: true }]]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}