import { AlertCircle, SearchX } from 'lucide-react'

interface EmptyStateProps {
  type: 'error' | 'empty'
  message?: string
  topKeywords?: string[]
  onRetry?: () => void
}

export function EmptyState({ type, message, topKeywords = [], onRetry }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
      {type === 'error' ? (
        <AlertCircle className="w-12 h-12 text-text-muted-light dark:text-text-muted-dark mb-4" />
      ) : (
        <SearchX className="w-12 h-12 text-text-muted-light dark:text-text-muted-dark mb-4" />
      )}

      {type === 'error' ? (
        <>
          <p className="text-text-primary-light dark:text-text-primary-dark font-medium mb-2">
            数据加载失败
          </p>
          {message && (
            <p className="text-sm text-text-muted-light dark:text-text-muted-dark mb-4">
              {message}
            </p>
          )}
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2 text-sm font-medium bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors duration-200 cursor-pointer"
            >
              重试
            </button>
          )}
        </>
      ) : (
        <>
          <p className="text-text-primary-light dark:text-text-primary-dark font-medium mb-2">
            未找到相关内容
          </p>
          {topKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3 justify-center">
              <span className="text-xs text-text-muted-light dark:text-text-muted-dark">试试：</span>
              {topKeywords.map((kw) => (
                <span
                  key={kw}
                  className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-text-muted-light dark:text-text-muted-dark rounded-sm"
                >
                  {kw}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
