import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, Download, X, Image as ImageIcon } from 'lucide-react'
import type { QuoteEntry } from '../types'
import {
  CARD_RATIOS, CARD_THEMES, DEFAULT_CARD_OPTIONS, renderCard, saveCardPng,
  type CardFontSize, type CardOptions, type CardRatio, type CardTheme,
} from '../utils/cardRenderer'

interface CardStudioProps {
  quote: QuoteEntry
  onClose: () => void
}

const themeOrder: CardTheme[] = ['peach', 'paper', 'night', 'mint']
const ratioOrder: CardRatio[] = ['3:4', '4:5', '1:1']

export function CardStudio({ quote, onClose }: CardStudioProps) {
  const [options, setOptions] = useState<CardOptions>(DEFAULT_CARD_OPTIONS)
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(1)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); onClose(); return }
      if (event.key !== 'Tab') return
      const dialog = closeRef.current?.closest('[role="dialog"]')
      const targets = dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), select:not(:disabled), input:not(:disabled), a[href]')
      if (!targets?.length) return
      const first = targets[0]
      const last = targets[targets.length - 1]
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onClose])

  useEffect(() => {
    let cancelled = false
    const draw = async () => {
      // Use the same resolved fonts in preview and downloaded bitmap.
      if (document.fonts?.ready) await document.fonts.ready
      if (cancelled || !canvasRef.current) return
      try {
        const layout = renderCard(canvasRef.current, quote, options, page)
        setPageCount(layout.pages.length)
        if (page >= layout.pages.length) setPage(Math.max(0, layout.pages.length - 1))
        setError(null)
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : '图片预览失败')
      }
    }
    void draw()
    return () => { cancelled = true }
  }, [quote, options, page])

  const changeOptions = (next: Partial<CardOptions>) => {
    setOptions((current) => ({ ...current, ...next }))
    setPage(0)
    setError(null)
  }

  const download = async () => {
    if (exporting) return
    setExporting(true)
    setError(null)
    try {
      if (document.fonts?.ready) await document.fonts.ready
      await saveCardPng(quote, options, page)
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : '下载失败，请重试')
    } finally {
      setExporting(false)
    }
  }

  const ratio = CARD_RATIOS[options.ratio]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 sm:p-5" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <div aria-hidden="true" className="absolute inset-0 bg-zinc-950/75 backdrop-blur-sm" />
      <section role="dialog" aria-modal="true" aria-labelledby="card-studio-title" aria-describedby="card-studio-description" className="relative z-10 flex h-full w-full max-w-6xl flex-col overflow-hidden bg-background-light dark:bg-background-dark shadow-2xl sm:h-[min(92vh,950px)] sm:rounded-2xl">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border-light dark:border-border-dark px-4 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-[.2em] uppercase text-section-growth dark:text-section-growth-dark">Card studio · 内容创作</p>
            <h2 id="card-studio-title" className="mt-1 text-lg sm:text-xl font-bold text-text-primary-light dark:text-text-primary-dark">将语录变成分享图片</h2>
            <p id="card-studio-description" className="text-xs text-text-muted-light dark:text-text-muted-dark">本地生成 · 实时预览 · 高清 PNG</p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="关闭卡片工作台" className="shrink-0 rounded-full p-2 text-text-primary-light dark:text-text-primary-dark hover:bg-zinc-200 dark:hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500"><X size={21} /></button>
        </header>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row">
          <div className="order-2 w-full shrink-0 space-y-6 border-t border-border-light dark:border-border-dark p-5 sm:p-6 lg:order-1 lg:w-[320px] lg:overflow-y-auto lg:border-r lg:border-t-0">
            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">01 / 选择主题</legend>
              <div className="grid grid-cols-2 gap-2">
                {themeOrder.map((theme) => (
                  <button key={theme} type="button" aria-pressed={options.theme === theme} onClick={() => changeOptions({ theme })} className={`rounded-xl border p-2 text-left text-xs font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${options.theme === theme ? 'border-section-growth ring-2 ring-section-growth/20 dark:border-section-growth-dark' : 'border-border-light dark:border-border-dark'}`}>
                    <span aria-hidden="true" className="mb-2 block h-10 rounded-md" style={{ background: CARD_THEMES[theme].background, borderLeft: `7px solid ${CARD_THEMES[theme].accent}` }} />
                    <span className="text-text-primary-light dark:text-text-primary-dark">{CARD_THEMES[theme].name}</span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">02 / 图片比例</legend>
              <div className="grid grid-cols-3 gap-2">
                {ratioOrder.map((value) => (
                  <button key={value} type="button" aria-pressed={options.ratio === value} onClick={() => changeOptions({ ratio: value })} className={`rounded-lg border px-1.5 py-3 text-xs font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${options.ratio === value ? 'border-section-growth bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100' : 'border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark'}`}>{value}</button>
                ))}
              </div>
              <p className="mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">{ratio.label} · {ratio.width} × {ratio.height} 像素</p>
            </fieldset>

            <fieldset>
              <legend className="mb-3 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">03 / 文字与标签</legend>
              <div className="flex gap-2">
                {([['small', '小'], ['medium', '中'], ['large', '大']] as [CardFontSize, string][]).map(([value, label]) => (
                  <button key={value} type="button" aria-pressed={options.fontSize === value} onClick={() => changeOptions({ fontSize: value })} className={`flex-1 rounded-lg border py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 ${options.fontSize === value ? 'border-section-growth bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-100' : 'border-border-light dark:border-border-dark text-text-primary-light dark:text-text-primary-dark'}`}>{label}</button>
                ))}
              </div>
              <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm text-text-primary-light dark:text-text-primary-dark">
                <input type="checkbox" checked={options.showTags} onChange={(event) => changeOptions({ showTags: event.target.checked })} className="h-4 w-4 accent-blue-600" />在图片中显示主题标签
              </label>
            </fieldset>
            <p className="rounded-lg bg-zinc-100 p-3 text-xs leading-relaxed text-text-muted-light dark:bg-zinc-800 dark:text-text-muted-dark">卡片保留完整原文并自动分页。图片内的来源说明为“整理摘录”，不表示已经核实每条语录的原始微博链接。</p>
          </div>

          <div className="order-1 flex min-h-[300px] flex-1 flex-col items-center justify-center gap-4 bg-zinc-200/50 p-4 dark:bg-zinc-900/70 sm:p-7 lg:order-2 lg:min-h-0 lg:overflow-y-auto">
            <div className="flex w-full items-center justify-between gap-2 text-xs font-medium text-text-muted-light dark:text-text-muted-dark sm:max-w-[430px]">
              <span className="flex items-center gap-1.5"><ImageIcon size={15} /> 实时成品预览</span>
              <span aria-live="polite">第 {Math.min(page + 1, pageCount)} / {pageCount} 张</span>
            </div>
            <canvas ref={canvasRef} role="img" aria-label={`语录图片预览：${quote.content}。第 ${page + 1} 张，共 ${pageCount} 张。`} className="h-auto w-full max-w-[430px] rounded-lg shadow-[0_20px_60px_rgba(0,0,0,.16)]" />
            <div className="flex items-center gap-4">
              <button type="button" onClick={() => setPage((value) => Math.max(0, value - 1))} disabled={page === 0} aria-label="上一张图片" className="rounded-full border border-border-light bg-card-light p-2 text-text-primary-light disabled:cursor-not-allowed disabled:opacity-40 dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark"><ArrowLeft size={18} /></button>
              <span className="min-w-14 text-center text-sm tabular-nums text-text-primary-light dark:text-text-primary-dark">{page + 1} / {pageCount}</span>
              <button type="button" onClick={() => setPage((value) => Math.min(pageCount - 1, value + 1))} disabled={page >= pageCount - 1} aria-label="下一张图片" className="rounded-full border border-border-light bg-card-light p-2 text-text-primary-light disabled:cursor-not-allowed disabled:opacity-40 dark:border-border-dark dark:bg-card-dark dark:text-text-primary-dark"><ArrowRight size={18} /></button>
            </div>
            <div className="w-full max-w-[430px] text-center">
              <button type="button" onClick={() => void download()} disabled={exporting || Boolean(error)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 px-5 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"><Download size={18} />{exporting ? '正在生成…' : `下载第 ${page + 1} 张 PNG`}</button>
              {pageCount > 1 && <p className="mt-2 text-xs text-text-muted-light dark:text-text-muted-dark">长语录已自动分成 {pageCount} 张，可逐张切换并保存。</p>}
              {error && <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
