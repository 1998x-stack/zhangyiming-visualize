import type { QuoteEntry } from '../types'

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString)

function isQuoteEntry(value: unknown): value is QuoteEntry {
  if (typeof value !== 'object' || value === null) return false
  const entry = value as Record<string, unknown>
  return Number.isSafeInteger(entry.id) && (entry.id as number) > 0 &&
    isNonEmptyString(entry.section) &&
    Number.isSafeInteger(entry.section_num) && (entry.section_num as number) > 0 &&
    Number.isSafeInteger(entry.global_id) && (entry.global_id as number) > 0 &&
    isNonEmptyString(entry.content) &&
    isStringArray(entry.tags) && isStringArray(entry.keywords)
}

/** Reject invalid records instead of silently displaying misleading statistics. */
export function parseJsonl(text: string): QuoteEntry[] {
  const entries: QuoteEntry[] = []
  const seen = new Set<number>()
  for (const [index, raw] of text.split(/\r?\n/).entries()) {
    const line = raw.trim()
    if (!line) continue
    let parsed: unknown
    try {
      parsed = JSON.parse(line)
    } catch {
      throw new Error(`第 ${index + 1} 行不是有效的 JSON`)
    }
    if (!isQuoteEntry(parsed)) {
      throw new Error(`第 ${index + 1} 行的语录字段无效，请检查编号、正文、标签及关键词`)
    }
    if (seen.has(parsed.global_id)) {
      throw new Error(`第 ${index + 1} 行的全局编号 ${parsed.global_id} 重复`)
    }
    seen.add(parsed.global_id)
    entries.push(parsed)
  }
  return entries
}
