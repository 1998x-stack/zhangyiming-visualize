import type { StatsResult } from '../utils/stats'

interface HeroProps {
  stats: StatsResult | null
  totalCount: number
}

export function Hero({ stats, totalCount }: HeroProps) {
  const growthCount = stats?.sectionCounts['关于成长'] ?? 0
  const managementCount = stats?.sectionCounts['关于管理'] ?? 0
  const businessCount = stats?.sectionCounts['关于商业'] ?? 0

  return (
    <section className="py-8 sm:py-12 animate-fade-in">
      <p className="text-xs uppercase tracking-widest text-text-muted-light dark:text-text-muted-dark">Public corpus / 公开语录整理</p>
      <h2 className="mt-3 text-2xl sm:text-3xl lg:text-[clamp(1.75rem,4vw,2.5rem)] font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight leading-tight">
        张一鸣微博 · 主题探索
      </h2>
      <p className="mt-3 text-base text-text-muted-light dark:text-text-muted-dark">
        收录 {totalCount} 条语录。按分类与主题探索整理后的公开语料。
      </p>
      <div className="w-12 h-px bg-border-light dark:bg-border-dark my-6" />
      <div className="flex flex-wrap gap-3">
        <div className="px-3 py-1.5 text-xs font-medium bg-section-growth/10 dark:bg-section-growth-dark/10 text-section-growth dark:text-section-growth-dark rounded-sm">{growthCount} 成长</div>
        <div className="px-3 py-1.5 text-xs font-medium bg-section-management/10 dark:bg-section-management-dark/10 text-section-management dark:text-section-management-dark rounded-sm">{managementCount} 管理</div>
        <div className="px-3 py-1.5 text-xs font-medium bg-section-business/10 dark:bg-section-business-dark/10 text-section-business dark:text-section-business-dark rounded-sm">{businessCount} 商业</div>
      </div>
    </section>
  )
}
