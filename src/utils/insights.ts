import type { QuoteEntry } from '../types'

export interface Metric {
  label: string
  count: number
}

export interface Insights {
  total: number
  sectionCounts: Metric[]
  tagCounts: Metric[]
  taggedCount: number
}

/** Count each tag once per quote, even when source data repeats a tag. */
export function computeInsights(entries: readonly QuoteEntry[]): Insights {
  const sections = new Map<string, number>()
  const tags = new Map<string, number>()
  let taggedCount = 0

  for (const entry of entries) {
    sections.set(entry.section, (sections.get(entry.section) ?? 0) + 1)
    const uniqueTags = new Set(entry.tags)
    if (uniqueTags.size > 0) taggedCount++
    for (const tag of uniqueTags) {
      tags.set(tag, (tags.get(tag) ?? 0) + 1)
    }
  }

  const byCountThenName = (a: Metric, b: Metric) =>
    b.count - a.count || a.label.localeCompare(b.label, 'zh-CN')
  const toMetrics = (source: Map<string, number>) =>
    [...source].map(([label, count]) => ({ label, count })).sort(byCountThenName)

  return {
    total: entries.length,
    sectionCounts: toMetrics(sections),
    tagCounts: toMetrics(tags),
    taggedCount,
  }
}
