import { Tag } from 'lucide-react'

interface TagFilterProps {
  tags: string[]
  activeTag: string | null
  onTagSelect: (tag: string | null) => void
}

export function TagFilter({ tags, activeTag, onTagSelect }: TagFilterProps) {
  return (
    <div className="mb-4 animate-fade-in">
      <div className="flex items-center gap-2 mb-2">
        <Tag className="w-3.5 h-3.5 text-text-muted-light dark:text-text-muted-dark" />
        <span className="text-xs font-medium text-text-muted-light dark:text-text-muted-dark">
          标签筛选
        </span>
        {activeTag && (
          <button
            onClick={() => onTagSelect(null)}
            className="ml-1 text-xs text-section-growth dark:text-section-growth-dark hover:underline cursor-pointer"
          >
            清除
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => {
          const isActive = tag === activeTag
          return (
            <button
              key={tag}
              onClick={() => onTagSelect(isActive ? null : tag)}
              className={`px-2 py-0.5 text-[11px] font-medium rounded-md transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-text-muted-light dark:text-text-muted-dark hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-text-primary-light dark:hover:text-text-primary-dark'
              }`}
            >
              {tag}
            </button>
          )
        })}
      </div>
    </div>
  )
}
