import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export default function ZoomableImage({ src, alt, title, ...props }) {
  const [isOpen, setIsOpen] = useState(false)

  // Determine the caption: use Markdown "Title" first, fallback to "Alt"
  const caption = title || alt

  // Handle Close
  const close = useCallback(() => setIsOpen(false), [])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden' // Lock scroll

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = '' // Unlock scroll
    }
  }, [isOpen, close])

  return (
    <>
      {/* 1. The Inline Thumbnail */}
      <figure className="post-image-wrapper">
        <img
          src={src}
          alt={alt}
          title={title}
          className="post-image-zoomable"
          onClick={() => setIsOpen(true)}
          loading="lazy"
          {...props}
        />
        {title && <figcaption>{title}</figcaption>}
      </figure>

      {/* 2. The Full-Screen Lightbox */}
      {isOpen && createPortal(
        <div className="lightbox-overlay" onClick={close} role="dialog" aria-modal="true">
          
          <button className="lightbox-close" onClick={close} aria-label="Close zoom">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>

          <div className="lightbox-container">
            <img
              src={src}
              alt={alt}
              className="lightbox-content"
              onClick={(e) => e.stopPropagation()} 
            />
            
            {caption && (
              <div 
                className="lightbox-caption"
                onClick={(e) => e.stopPropagation()} 
              >
                {caption}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  )
}