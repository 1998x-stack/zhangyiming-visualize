import { useReducer, useMemo } from 'react'
import { SectionKey } from '../types'
import { useQuotes } from '../hooks/useQuotes'
import { useTheme } from '../hooks/useTheme'
import { useFilter } from '../hooks/useFilter'
import { computeStats } from '../utils/stats'
import { Header } from './Header'
import { Hero } from './Hero'
import { QuoteGrid } from './QuoteGrid'
import { EmptyState } from './EmptyState'
import { TagFilter } from './TagFilter'

interface AppState {
  section: SectionKey
  search: string
  activeTag: string | null
}

type Action =
  | { type: 'SET_SECTION'; payload: SectionKey }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TAG'; payload: string | null }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, section: action.payload, activeTag: null }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_TAG':
      return { ...state, activeTag: action.payload }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    section: 'all',
    search: '',
    activeTag: null,
  })
  const [theme, toggleTheme] = useTheme()
  const { data, loading, error, retry } = useQuotes()
  const filtered = useFilter(data, state.section, state.search, state.activeTag)
  const stats = useMemo(() => data ? computeStats(data) : null, [data])

  const allTags = useMemo(() => {
    if (!data) return []
    const tagCounts: Record<string, number> = {}
    for (const entry of data) {
      for (const tag of entry.tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      }
    }
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30)
      .map(([tag]) => tag)
  }, [data])

  const showHero = !state.search && !state.activeTag && filtered.length === data?.length

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header
        section={state.section}
        search={state.search}
        theme={theme}
        onSectionChange={(s: SectionKey) => dispatch({ type: 'SET_SECTION', payload: s })}
        onSearchChange={(s: string) => dispatch({ type: 'SET_SEARCH', payload: s })}
        onToggleTheme={toggleTheme}
        totalCount={data?.length ?? 0}
        filteredCount={filtered.length}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {showHero && data && <Hero stats={stats} />}

        {data && allTags.length > 0 && (
          <TagFilter
            tags={allTags}
            activeTag={state.activeTag}
            onTagSelect={(tag: string | null) => dispatch({ type: 'SET_TAG', payload: tag })}
          />
        )}

        {loading && (
          <div className="flex items-center justify-center py-32">
            <p className="text-text-muted-light dark:text-text-muted-dark">加载中...</p>
          </div>
        )}

        {error && <EmptyState type="error" message={error} onRetry={retry} />}

        {!loading && !error && filtered.length === 0 && (
          <EmptyState type="empty" topKeywords={stats?.topKeywords ?? []} />
        )}

        {!loading && !error && filtered.length > 0 && (
          <QuoteGrid entries={filtered} />
        )}
      </main>
    </div>
  )
}
