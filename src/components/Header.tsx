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
  onSectionChange,
  onSearchChange,
  onToggleTheme,
}: HeaderProps) {
  return (
    <header className="sticky top-3 z-50 mx-3 sm:mx-6 lg:mx-8 mt-3">
      <div className="bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border border-border-light dark:border-border-dark rounded-lg shadow-sm">
        <div className="flex items-center justify-between h-13 px-4 gap-3">
          <div className="flex-shrink-0">
            <h1 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark tracking-tight">
              张一鸣微博
            </h1>
          </div>

          <SectionTabs
            section={section}
            counts={{
              '关于成长': 157,
              '关于管理': 45,
              '关于商业': 29,
            }}
            onSectionChange={onSectionChange}
          />

          <div className="flex items-center gap-2 flex-shrink-0">
            <SearchBar value={search} onChange={onSearchChange} />
            <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          </div>
        </div>

        {search && (
          <div className="px-4 pb-2.5 text-xs text-text-muted-light dark:text-text-muted-dark animate-fade-in" aria-live="polite">
            找到 {filteredCount} 条结果（共 {totalCount} 条）
          </div>
        )}
      </div>
    </header>
  )
}
