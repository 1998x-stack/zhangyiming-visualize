import type { QuoteEntry } from '../types'
import { QuoteCard } from './QuoteCard'

interface QuoteGridProps {
  entries: QuoteEntry[]
  onCreateCard: (quote: QuoteEntry) => void
}

export function QuoteGrid({ entries, onCreateCard }: QuoteGridProps) {
  return (
    <div className="masonry-grid pb-16">
      {entries.map((entry, i) => (
        <div key={entry.global_id} className="masonry-item" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
          <QuoteCard quote={entry} onCreateCard={onCreateCard} />
        </div>
      ))}
    </div>
  )
}
