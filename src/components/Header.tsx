import { SectionKey } from '../types'
import { SectionTabs } from './SectionTabs'
import { SearchBar } from './SearchBar'
import { ThemeToggle } from './ThemeToggle'

interface HeaderProps {
  section: SectionKey
  search: string
  theme: 'light' | 'dark'
  totalCount: number
  filteredCount: number
  sectionCounts: Record<string, number>
  onSectionChange: (section: SectionKey) => void
  onSearchChange: (search: string) => void
  onToggleTheme: () => void
}

export function Header({
  section,
  search,
  theme,
  totalCount,
  filteredCount,
  sectionCounts,
  onSectionChange,
  onSearchChange,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-2 z-50 mx-3 sm:mx-6 lg:mx-8 mt-3">
      <div className="bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border border-border-light dark:border-border-dark rounded-lg shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 sm:px-4">
          <h1 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight whitespace-nowrap">
            张一鸣微博 · 语料探索
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <SearchBar value={search} onChange={onSearchChange} />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
          <div className="w-full overflow-x-auto order-3">
            <SectionTabs section={section} counts={sectionCounts} onSectionChange={onSectionChange} />
          </div>
        </div>
        {search && (
          <div className="px-4 pb-2.5 text-xs text-text-muted-light dark:text-text-muted-dark" aria-live="polite">
            找到 {filteredCount} 条结果（共 {totalCount} 条）
          </div>
        )}
      </div>
    </header>
  )
}
