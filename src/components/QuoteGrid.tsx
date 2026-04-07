import { QuoteEntry } from '../types'
import { QuoteCard } from './QuoteCard'

interface QuoteGridProps {
  entries: QuoteEntry[]
}

export function QuoteGrid({ entries }: QuoteGridProps) {
  return (
    <div className="masonry-grid pb-16">
      {entries.map((entry, i) => (
        <div key={entry.global_id} className="masonry-item" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
          <QuoteCard quote={entry} />
        </div>
      ))}
    </div>
  )
}
