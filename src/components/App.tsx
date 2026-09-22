import { useReducer, useMemo } from 'react'
import type { SectionKey } from '../types'
import { useQuotes } from '../hooks/useQuotes'
import { useTheme } from '../hooks/useTheme'
import { useFilter } from '../hooks/useFilter'
import { computeStats } from '../utils/stats'
import { computeInsights } from '../utils/insights'
import { Header } from './Header'
import { Hero } from './Hero'
import { QuoteGrid } from './QuoteGrid'
import { EmptyState } from './EmptyState'
import { TagFilter } from './TagFilter'
import { InsightsDashboard } from './InsightsDashboard'

interface AppState {
  section: SectionKey
  search: string
  activeTag: string | null
}

type Action =
  | { type: 'SET_SECTION'; payload: SectionKey }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TAG'; payload: string | null }
  | { type: 'RESET' }

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_SECTION':
      return { ...state, section: action.payload, activeTag: null }
    case 'SET_SEARCH':
      return { ...state, search: action.payload }
    case 'SET_TAG':
      return { ...state, activeTag: action.payload }
    case 'RESET':
      return { section: 'all', search: '', activeTag: null }
    default:
      return state
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, {
    section: 'all', search: '', activeTag: null,
  })
  const [theme, toggleTheme] = useTheme()
  const { data, loading, error, retry } = useQuotes()
  const filtered = useFilter(data, state.section, state.search, state.activeTag)
  const searchEntries = useFilter(data, 'all', state.search, null)
  const sectionEntries = useFilter(data, state.section, state.search, null)
  const stats = useMemo(() => data ? computeStats(data) : null, [data])
  const corpus = useMemo(() => computeInsights(data ?? []), [data])
  const sectionCounts = useMemo(() => Object.fromEntries(
    corpus.sectionCounts.map(item => [item.label, item.count]),
  ), [corpus])
  const allTags = useMemo(() => corpus.tagCounts.slice(0, 30).map(item => item.label), [corpus])
  const showHero = data !== null && !state.search && !state.activeTag && state.section === 'all'
  const hasFilters = state.section !== 'all' || Boolean(state.search.trim()) || state.activeTag !== null

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-background-light dark:focus:bg-background-dark focus:p-3">跳转到主要内容</a>
      <Header
        section={state.section}
        search={state.search}
        theme={theme}
        onSectionChange={(s: SectionKey) => dispatch({ type: 'SET_SECTION', payload: s })}
        onSearchChange={(s: string) => dispatch({ type: 'SET_SEARCH', payload: s })}
        onToggleTheme={toggleTheme}
        totalCount={data?.length ?? 0}
        filteredCount={filtered.length}
        sectionCounts={sectionCounts}
      />

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {showHero && <Hero stats={stats} totalCount={corpus.total} />}

        {loading && (
          <div className="flex items-center justify-center py-32" role="status">
            <p className="text-text-muted-light dark:text-text-muted-dark">加载中...</p>
          </div>
        )}
        {error && <EmptyState type="error" message={error} onRetry={retry} />}

        {!loading && !error && data && (
          <>
            <InsightsDashboard
              visibleEntries={filtered}
              searchEntries={searchEntries}
              sectionEntries={sectionEntries}
              section={state.section}
              activeTag={state.activeTag}
              onSectionChange={(section) => dispatch({ type: 'SET_SECTION', payload: section })}
              onTagSelect={(tag) => dispatch({ type: 'SET_TAG', payload: tag })}
            />
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">语录原文 <span className="text-sm font-normal tabular-nums text-text-muted-light dark:text-text-muted-dark">({filtered.length})</span></h2>
              {hasFilters && (
                <button type="button" onClick={() => dispatch({ type: 'RESET' })} className="rounded border border-border-light dark:border-border-dark px-3 py-1.5 text-sm text-text-primary-light dark:text-text-primary-dark hover:bg-zinc-100 dark:hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500">清除全部筛选</button>
              )}
            </div>
            {allTags.length > 0 && <TagFilter tags={allTags} activeTag={state.activeTag} onTagSelect={(tag) => dispatch({ type: 'SET_TAG', payload: tag })} />}
            {filtered.length === 0
              ? <EmptyState type="empty" topKeywords={stats?.topKeywords ?? []} />
              : <QuoteGrid entries={filtered} />}
          </>
        )}
      </main>
    </div>
  )
}
