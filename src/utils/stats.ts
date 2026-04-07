import { QuoteEntry } from '../types'

const KEYWORDS = ['创业', '团队', '学习', '产品', '沟通', '延迟满足感', '理性', '创新', '人才', '执行力']

export interface StatsResult {
  keywordFrequencies: Record<string, number>
  sectionCounts: Record<string, number>
  topKeywords: string[]
}

export function computeStats(entries: QuoteEntry[]): StatsResult {
  const keywordFrequencies: Record<string, number> = {}
  const sectionCounts: Record<string, number> = {}

  for (const entry of entries) {
    sectionCounts[entry.section] = (sectionCounts[entry.section] || 0) + 1

    for (const kw of KEYWORDS) {
      if (entry.content.includes(kw)) {
        keywordFrequencies[kw] = (keywordFrequencies[kw] || 0) + 1
      }
    }
  }

  const topKeywords = Object.entries(keywordFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([kw]) => kw)

  return { keywordFrequencies, sectionCounts, topKeywords }
}
