export const SERIES = [
  {
    slug: 'patch-notes',
    title: 'Patch Notes',
    description: 'A technical diary of my open-source contributions.',
    tags: ['oss', 'python', 'keras', 'pydantic'],
  }
]

export const POSTS = [
  {
    slug: 'keras-clahe',
    series: 'patch-notes',
    order: 1,
    title: 'Adding a Native CLAHE Preprocessing Layer to Keras 3',
    description: 'How I contributed Contrast Limited Adaptive Histogram Equalization to Keras.',
    date: '2026-04-10',
    loader: () => import('./posts/keras-clahe.md?raw'),
    components: {
      ClaheTileSplit: () => import('../src/components/interactive/keras-clahe/ClaheTileSplit.jsx'),
      ClaheHistogram: () => import('../src/components/interactive/keras-clahe/ClaheHistogram.jsx'),
      ClaheInterpolation: () => import('../src/components/interactive/keras-clahe/ClaheInterpolation.jsx'),
    },
  }
]

export function getPost(slug) { return POSTS.find(p => p.slug === slug) }
export function getSeriesPosts(seriesSlug) { return POSTS.filter(p => p.series === seriesSlug).sort((a, b) => a.order - b.order) }
export function getSeries(slug) { return SERIES.find(s => s.slug === slug) }