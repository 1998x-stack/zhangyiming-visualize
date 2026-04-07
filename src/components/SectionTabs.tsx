import { SectionKey, SECTION_LABELS, SECTION_MAP } from '../types'

interface SectionTabsProps {
  section: SectionKey
  counts: Record<string, number>
  onSectionChange: (section: SectionKey) => void
}

const SECTION_KEYS: SectionKey[] = ['all', 'growth', 'management', 'business']

function getAccentColor(key: Exclude<SectionKey, 'all'>): string {
  const colors: Record<string, string> = {
    growth: 'bg-section-growth dark:bg-section-growth-dark',
    management: 'bg-section-management dark:bg-section-management-dark',
    business: 'bg-section-business dark:bg-section-business-dark',
  }
  return colors[key]
}

export function SectionTabs({ section, counts, onSectionChange }: SectionTabsProps) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto" role="tablist" aria-label="语录分类">
      {SECTION_KEYS.map((key) => {
        const isActive = section === key
        const label = SECTION_LABELS[key]
        const count = key === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : counts[SECTION_MAP[key as Exclude<SectionKey, 'all'>]] ?? 0

        if (key === 'all') {
          return (
            <button
              key={key}
              role="tab"
              aria-selected={isActive}
              onClick={() => onSectionChange(key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {label} ({count})
            </button>
          )
        }

        return (
          <button
            key={key}
            role="tab"
            aria-selected={isActive}
            onClick={() => onSectionChange(key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
              isActive
                ? `${getAccentColor(key)} text-white shadow-sm`
                : 'text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {label} ({count})
          </button>
        )
      })}
    </div>
  )
}
