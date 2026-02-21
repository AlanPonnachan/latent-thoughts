/**
 * content/registry.js
 *
 * Central registry for all blog series and posts.
 * When you add a new Markdown file, register it here.
 *
 * Each post uses a dynamic import so Vite can code-split the MD files.
 * The `component` field optionally points to a custom React component
 * to render interactive elements inside this post's Markdown.
 */

export const SERIES = [
  {
    slug: 'paper-walkthroughs',
    title: 'Explaining Research Papers',
    description:
      'Accessible deep-dives into influential AI/ML papers — intuition first, math second, code always.',
    tags: ['transformers', 'diffusion', 'rl'],
  },
  {
    slug: 'concepts',
    title: 'Core Concepts',
    description:
      'First-principles explanations of foundational ML concepts with interactive visualizations.',
    tags: ['math', 'probability', 'optimization'],
  },
  {
    slug: 'build-it',
    title: 'Build It From Scratch',
    description:
      'Implementing ML algorithms from scratch in Python/NumPy. No black boxes.',
    tags: ['code', 'numpy', 'pytorch'],
  },
]

/**
 * Post registry.
 * `loader` is a function that returns a dynamic import of the raw Markdown.
 * `components` is an optional map of component names to React components
 *   that can be embedded directly in the Markdown via MDX-like syntax.
 */
export const POSTS = [
  {
    slug: 'attention-is-all-you-need',
    series: 'paper-walkthroughs',
    order: 1,
    title: 'Attention Is All You Need',
    description: 'A complete walkthrough of the original Transformer paper, from scaled dot-product attention to positional encodings.',
    date: '2024-02-01',
    // Vite's dynamic import for raw Markdown
    loader: () => import('./posts/attention-is-all-you-need.md?raw'),
    // Custom interactive components available in this post's MDX
    components: {
      AttentionVisualizer: () => import('../src/components/interactive/AttentionVisualizer.jsx'),
    },
  },
  {
    slug: 'backprop-from-scratch',
    series: 'build-it',
    order: 1,
    title: 'Backpropagation From Scratch',
    description: 'Deriving and implementing backprop in pure NumPy. We build a tiny autograd engine.',
    date: '2024-02-15',
    loader: () => import('./posts/backprop-from-scratch.md?raw'),
    components: {
      GradientSlider: () => import('../src/components/interactive/GradientSlider.jsx'),
    },
  },
]

/** Utility: get a post by slug */
export function getPost(slug) {
  return POSTS.find(p => p.slug === slug)
}

/** Utility: get posts in a series, sorted by order */
export function getSeriesPosts(seriesSlug) {
  return POSTS
    .filter(p => p.series === seriesSlug)
    .sort((a, b) => a.order - b.order)
}

/** Utility: get series metadata */
export function getSeries(slug) {
  return SERIES.find(s => s.slug === slug)
}
