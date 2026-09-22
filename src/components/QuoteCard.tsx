import { useEffect, useState } from 'react'
import { Check, Copy, Image as ImageIcon } from 'lucide-react'
import type { QuoteEntry } from '../types'

interface QuoteCardProps {
  quote: QuoteEntry
  onCreateCard: (quote: QuoteEntry) => void
}

const SECTION_ACCENTS: Record<string, string> = {
  '关于成长': 'bg-blue-600',
  '关于管理': 'bg-violet-600',
  '关于商业': 'bg-emerald-600',
}

export function QuoteCard({ quote, onCreateCard }: QuoteCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle')
  useEffect(() => {
    if (copyStatus === 'idle') return
    const timeout = window.setTimeout(() => setCopyStatus('idle'), 2400)
    return () => window.clearTimeout(timeout)
  }, [copyStatus])

  const copyQuote = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(quote.content)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = quote.content
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        try {
          textarea.select()
          if (!document.execCommand('copy')) throw new Error('copy failed')
        } finally {
          textarea.remove()
        }
      }
      setCopyStatus('success')
    } catch {
      setCopyStatus('error')
    }
  }

  return (
    <article className="masonry-item group relative overflow-hidden rounded-2xl border border-border-light bg-card-light shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-border-dark dark:bg-card-dark">
      <div className={`absolute inset-x-0 top-0 h-1 ${SECTION_ACCENTS[quote.section] ?? 'bg-zinc-500'}`} />
      <div className="p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-text-muted-light dark:bg-zinc-800 dark:text-text-muted-dark">{quote.section}</span>
          <span className="text-xs tabular-nums text-text-muted-light dark:text-text-muted-dark">#{String(quote.global_id).padStart(3, '0')}</span>
        </div>
        <p className="whitespace-pre-wrap break-words text-[15px] font-medium leading-[1.95] tracking-[.01em] text-text-primary-light dark:text-text-primary-dark">{quote.content}</p>
        <div className="mt-6 flex flex-wrap gap-1.5">
          {quote.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full bg-zinc-100 px-2.5 py-1 text-[11px] text-text-muted-light dark:bg-zinc-800 dark:text-text-muted-dark">#{tag}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-t border-border-light bg-zinc-50/70 p-3 dark:border-border-dark dark:bg-zinc-900/40">
        <button type="button" onClick={() => void copyQuote()} aria-label={`复制第 ${quote.global_id} 条语录`} className="flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg border border-border-light bg-card-light px-2 py-2 text-xs font-semibold text-text-primary-light transition-colors hover:bg-zinc-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark dark:hover:bg-zinc-800">
          {copyStatus === 'success' ? <Check size={15} /> : <Copy size={15} />}
          {copyStatus === 'success' ? '已复制' : copyStatus === 'error' ? '复制失败' : '复制文字'}
        </button>
        <button type="button" onClick={() => onCreateCard(quote)} aria-label={`为第 ${quote.global_id} 条语录生成图片卡片`} className="flex min-h-11 flex-[1.4] items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-2 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"><ImageIcon size={15} />生成图片卡片</button>
      </div>
      <span role="status" className="sr-only">{copyStatus === 'error' ? '复制未成功，请检查浏览器剪贴板权限' : copyStatus === 'success' ? '已复制到剪贴板' : ''}</span>
    </article>
  )
}
