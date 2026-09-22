import type { QuoteEntry } from '../types'
import { QuoteCard } from './QuoteCard'

interface QuoteGridProps {
  entries: QuoteEntry[]
  onCreateCard: (quote: QuoteEntry) => void
}

export function QuoteGrid({ entries, onCreateCard }: QuoteGridProps) {
  return (
    <div id="quotes" className="masonry-grid scroll-mt-32 pb-16">
      {entries.map((entry) => (
        <QuoteCard key={entry.global_id} quote={entry} onCreateCard={onCreateCard} />
      ))}
    </div>
  )
}
