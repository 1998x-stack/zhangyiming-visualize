import { useMemo } from 'react'
import { QuoteEntry, SectionKey, SECTION_MAP } from '../types'

export function useFilter(
  entries: QuoteEntry[] | null,
  section: SectionKey,
  search: string,
  activeTag: string | null
): QuoteEntry[] {
  return useMemo(() => {
    if (!entries) return []

    let filtered = entries

    if (section !== 'all') {
      const sectionName = SECTION_MAP[section]
      filtered = filtered.filter(e => e.section === sectionName)
    }

    if (activeTag) {
      filtered = filtered.filter(e => e.tags.includes(activeTag))
    }

    if (search.trim()) {
      const query = search.trim().toLowerCase()
      filtered = filtered.filter(e =>
        e.content.toLowerCase().includes(query) ||
        e.tags.some(t => t.toLowerCase().includes(query)) ||
        e.keywords.some(k => k.toLowerCase().includes(query))
      )
    }

    return filtered
  }, [entries, section, search, activeTag])
}
