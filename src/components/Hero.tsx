import { ArrowDownRight, Image as ImageIcon } from 'lucide-react'
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
    <section className="relative my-3 mb-9 overflow-hidden rounded-3xl border border-[#eddccf] bg-[#faf0e6] px-6 py-9 dark:border-zinc-700 dark:bg-[#222c34] sm:px-10 sm:py-12 lg:px-14">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-28 h-72 w-72 rounded-full bg-[#eeb69e]/40 blur-3xl dark:bg-[#7c8275]/20" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 right-20 h-72 w-72 rounded-full bg-[#d5c6ef]/40 blur-3xl dark:bg-[#65748e]/20" />
      <div className="relative z-10 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[.22em] text-[#956c61] dark:text-[#d6b49e]">PUBLIC QUOTES  /  READ · CREATE · SHARE</p>
        <h2 className="mt-5 text-[clamp(1.8rem,4.4vw,3.35rem)] font-bold leading-[1.25] tracking-tight text-[#382f31] dark:text-[#f6efe8]">
          让每一句思考，<br />成为一张值得收藏的卡片。
        </h2>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-[#675959] dark:text-zinc-300 sm:text-base">
          探索整理后的张一鸣公开语录，按主题发现观点；复制原文，或选择模板，一键制作高清分享图片。
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href="#quotes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#463b3c] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#635050] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 dark:bg-[#f8eee5] dark:text-[#292b31]"><ImageIcon size={17} />选择语录 · 制作卡片 <ArrowDownRight size={16} /></a>
          <a href="#insights-title" className="inline-flex min-h-11 items-center rounded-xl border border-[#baa69a] px-5 py-3 text-sm font-semibold text-[#4f4444] transition-colors hover:bg-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700">探索主题分布</a>
        </div>
        <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#cfbfb2] pt-5 text-xs text-[#76675f] dark:border-zinc-600 dark:text-zinc-300">
          <span><strong className="mr-1 text-lg tabular-nums text-[#382f31] dark:text-white">{totalCount}</strong> 条整理语录</span>
          <span>{growthCount} 成长 · {managementCount} 管理 · {businessCount} 商业</span>
          <span>本地生成 · 无需上传内容</span>
        </div>
      </div>
    </section>
  )
}
