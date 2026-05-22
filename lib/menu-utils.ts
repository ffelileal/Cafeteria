export interface PopularityBadge {
  label: string
  emoji: string
  className: string
}

export function getPopularityBadge(popularity?: number): PopularityBadge | null {
  if (popularity == null) return null
  if (popularity >= 90) return {
    label: 'Más Pedido',
    emoji: '🔥',
    className: 'bg-orange-500/10 text-orange-400 border border-orange-500/20',
  }
  if (popularity >= 75) return {
    label: 'Popular',
    emoji: '⭐',
    className: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
  }
  if (popularity >= 60) return {
    label: 'Recomendado',
    emoji: '✨',
    className: 'bg-primary/10 text-primary border border-primary/20',
  }
  return null
}
