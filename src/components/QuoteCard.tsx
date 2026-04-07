import { useState, useCallback } from 'react'
import { Copy, Check } from 'lucide-react'
import { QuoteEntry } from '../types'

interface QuoteCardProps {
  quote: QuoteEntry
}

function getSectionClass(section: string): string {
  const map: Record<string, string> = {
    '关于成长': 'section-growth',
    '关于管理': 'section-management',
    '关于商业': 'section-business',
  }
  return map[section] ?? ''
}

function getPillClasses(section: string): string {
  const map: Record<string, string> = {
    '关于成长': 'bg-section-growth dark:bg-section-growth-dark',
    '关于管理': 'bg-section-management dark:bg-section-management-dark',
    '关于商业': 'bg-section-business dark:bg-section-business-dark',
  }
  return map[section] ?? 'bg-zinc-600 dark:bg-zinc-400'
}

export function QuoteCard({ quote }: QuoteCardProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(quote.content)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = quote.content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }, [quote.content])

  const sectionClass = getSectionClass(quote.section)
  const pillClass = getPillClasses(quote.section)

  const numberStr = `#${String(quote.id).padStart(3, '0')}`

  return (
    <div
      className={`masonry-item group relative quote-card ${sectionClass} animate-slide-up`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-[11px] font-light text-text-muted-light dark:text-text-muted-dark tabular-nums">
          {numberStr}
        </span>
        <button
          onClick={handleCopy}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-all duration-200 cursor-pointer rounded-sm hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="复制语录"
        >
          {copied ? (
            <Check className="w-4 h-4 text-section-growth dark:text-section-growth-dark" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      <p className="text-[15px] leading-[1.8] text-text-primary-light dark:text-text-primary-dark">
        {quote.content}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-1.5">
        <span className={`inline-block px-2 py-0.5 text-[11px] font-medium text-white ${pillClass} rounded-sm tracking-wider`}>
          {quote.section}
        </span>
        {quote.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="px-1.5 py-0.5 text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-text-muted-light dark:text-text-muted-dark rounded-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {copied && (
        <div className="absolute bottom-2 right-10 text-[10px] text-section-growth dark:text-section-growth-dark font-medium animate-fade-in">
          已复制
        </div>
      )}
    </div>
  )
}
