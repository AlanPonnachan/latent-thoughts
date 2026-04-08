export const SERIES = [
  {
    slug: 'upstream-dynamics',
    title: 'Upstream Dynamics',
    description: 'A technical diary of my open-source contributions to major machine learning frameworks.',
    tags: ['oss', 'keras', 'tensorflow', 'pytorch'],
  }
]

export const POSTS = [
  {
    slug: 'keras-clahe',
    series: 'upstream-dynamics',
    order: 1,
    title: 'Adding a Native CLAHE Preprocessing Layer to Keras 3',
    description: 'How to implement Contrast Limited Adaptive Histogram Equalization using pure tensor operations.',
    date: '2024-04-10', // Update to current date
    loader: () => import('./posts/keras-clahe.md?raw'),
    components: {
      ClaheTileSplit: () => import('../src/components/interactive/ClaheTileSplit.jsx'),
      ClaheHistogram: () => import('../src/components/interactive/ClaheHistogram.jsx'),
      ClaheInterpolation: () => import('../src/components/interactive/ClaheInterpolation.jsx'),
    },
  }
]

export function getPost(slug) { return POSTS.find(p => p.slug === slug) }
export function getSeriesPosts(seriesSlug) { return POSTS.filter(p => p.series === seriesSlug).sort((a, b) => a.order - b.order) }
export function getSeries(slug) { return SERIES.find(s => s.slug === slug) }