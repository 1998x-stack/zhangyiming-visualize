import { QuoteEntry } from '../types'

export function parseJsonl(text: string): QuoteEntry[] {
  const lines = text.trim().split('\n')
  const entries: QuoteEntry[] = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue
    try {
      const entry = JSON.parse(trimmed) as QuoteEntry
      if (
        typeof entry.id === 'number' &&
        typeof entry.section === 'string' &&
        typeof entry.section_num === 'number' &&
        typeof entry.global_id === 'number' &&
        typeof entry.content === 'string'
      ) {
        entries.push(entry)
      }
    } catch {
      // Skip malformed lines
    }
  }

  return entries
}
