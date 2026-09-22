import { useMemo } from 'react'
import type { QuoteEntry, SectionKey } from '../types'
import { SECTION_LABELS, SECTION_MAP } from '../types'
import { computeInsights } from '../utils/insights'

interface InsightsDashboardProps {
  /** Results after applying every active filter. */
  visibleEntries: QuoteEntry[]
  /** Search results before applying a section or tag. */
  searchEntries: QuoteEntry[]
  /** Results after applying section and search, before applying a tag. */
  sectionEntries: QuoteEntry[]
  section: SectionKey
  activeTag: string | null
  onSectionChange: (section: SectionKey) => void
  onTagSelect: (tag: string | null) => void
}

const SECTIONS: Exclude<SectionKey, 'all'>[] = ['growth', 'management', 'business']
const BAR_COLORS: Record<Exclude<SectionKey, 'all'>, string> = {
  growth: 'bg-section-growth dark:bg-section-growth-dark',
  management: 'bg-section-management dark:bg-section-management-dark',
  business: 'bg-section-business dark:bg-section-business-dark',
}

export function InsightsDashboard({
  visibleEntries,
  searchEntries,
  sectionEntries,
  section,
  activeTag,
  onSectionChange,
  onTagSelect,
}: InsightsDashboardProps) {
  const visible = useMemo(() => computeInsights(visibleEntries), [visibleEntries])
  const search = useMemo(() => computeInsights(searchEntries), [searchEntries])
  const sectionScope = useMemo(() => computeInsights(sectionEntries), [sectionEntries])
  const sectionCounts = new Map(search.sectionCounts.map(item => [item.label, item.count]))
  const popularTags = sectionScope.tagCounts.slice(0, 12)
  const selectedTag = sectionScope.tagCounts.find(item => item.label === activeTag)
  if (selectedTag && !popularTags.some(item => item.label === selectedTag.label)) {
    popularTags.push(selectedTag)
  }
  const relatedTags = activeTag
    ? visible.tagCounts.filter(item => item.label !== activeTag).slice(0, 8)
    : []

  return (
    <section aria-labelledby="insights-title" className="mb-10 animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs tracking-widest uppercase text-text-muted-light dark:text-text-muted-dark">Corpus explorer / 语料探索</p>
          <h2 id="insights-title" className="mt-2 text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">主题洞察</h2>
          <p className="mt-2 text-sm text-text-muted-light dark:text-text-muted-dark">
            统计范围：当前搜索结果；选择分类或标签，查看匹配语录。
          </p>
        </div>
        <p className="text-sm text-text-muted-light dark:text-text-muted-dark" aria-live="polite">
          当前匹配 <strong className="text-xl tabular-nums text-text-primary-light dark:text-text-primary-dark">{visible.total}</strong> / {search.total} 条
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">分类分布</h3>
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark">按语录条数统计</span>
          </div>
          <p className="mt-1 mb-6 text-xs text-text-muted-light dark:text-text-muted-dark">基于当前搜索结果；点击切换分类</p>
          <div className="space-y-5">
            {SECTIONS.map(key => {
              const label = SECTION_MAP[key]
              const count = sectionCounts.get(label) ?? 0
              const ratio = search.total ? Math.round((count / search.total) * 100) : 0
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onSectionChange(section === key ? 'all' : key)}
                  aria-pressed={section === key}
                  aria-label={`${label}，${count} 条，占当前搜索结果 ${ratio}%，点击筛选`}
                  className={`block w-full text-left rounded-md p-2 -m-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${section === key ? 'ring-1 ring-zinc-400 dark:ring-zinc-500' : ''}`}
                >
                  <span className="flex justify-between gap-2 text-sm text-text-primary-light dark:text-text-primary-dark">
                    <span>{label}</span>
                    <span className="tabular-nums font-medium">{count} <span className="font-normal text-text-muted-light dark:text-text-muted-dark">· {ratio}%</span></span>
                  </span>
                  <span aria-hidden="true" className="mt-2 block h-2 rounded bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                    <span className={`block h-full rounded ${BAR_COLORS[key]}`} style={{ width: `${ratio}%` }} />
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">热门主题标签</h3>
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark">前 12 项</span>
          </div>
          <p className="mt-1 mb-4 text-xs text-text-muted-light dark:text-text-muted-dark">
            当前分类及搜索范围内共 {sectionScope.tagCounts.length} 种标签；一条语录可以属于多个标签。
          </p>
          {popularTags.length === 0 ? (
            <p className="py-6 text-sm text-text-muted-light dark:text-text-muted-dark">此范围暂无标签数据。</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3">
              {popularTags.map(({ label, count }) => {
                const percentage = sectionScope.total ? Math.round(count / sectionScope.total * 100) : 0
                return (
                  <button
                    type="button"
                    key={label}
                    aria-pressed={activeTag === label}
                    onClick={() => onTagSelect(activeTag === label ? null : label)}
                    className={`rounded-md p-2 -m-1 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 ${activeTag === label ? 'ring-1 ring-zinc-400 dark:ring-zinc-500' : ''}`}
                  >
                    <span className="flex justify-between gap-2 text-xs text-text-primary-light dark:text-text-primary-dark">
                      <span className="truncate">{label}</span><span className="tabular-nums">{count} · {percentage}%</span>
                    </span>
                    <span aria-hidden="true" className="mt-1.5 block h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                      <span className="block h-full bg-zinc-700 dark:bg-zinc-300 rounded" style={{ width: `${percentage}%` }} />
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {activeTag && (
        <div className="mt-4 rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">“{activeTag}” 的关联主题</h3>
            <span className="text-xs text-text-muted-light dark:text-text-muted-dark">与当前筛选结果共同出现 · {visible.total} 条基数</span>
          </div>
          {relatedTags.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted-light dark:text-text-muted-dark">当前范围内没有其他共现标签。</p>
          ) : (
            <div className="mt-4 flex flex-wrap gap-2">
              {relatedTags.map(({ label, count }) => (
                <button key={label} type="button" onClick={() => onTagSelect(label)} className="rounded border border-border-light dark:border-border-dark px-3 py-2 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">
                  {label} <span className="tabular-nums text-text-muted-light dark:text-text-muted-dark">{count}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      <p className="mt-3 text-xs text-text-muted-light dark:text-text-muted-dark">标签来自规则生成的数据集，仅表示此语料内的出现及共现频次，不代表全部公开言论或作者观点的重要程度。</p>
    </section>
  )
}
