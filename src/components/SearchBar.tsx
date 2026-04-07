import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Search as SearchIcon } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setInputValue(value)
  }, [value])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => {
      onChange(inputValue)
    }, 200)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [inputValue, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setInputValue('')
      onChange('')
      inputRef.current?.blur()
    }
  }, [onChange])

  useEffect(() => {
    function handleGlobalKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleGlobalKey)
    return () => window.removeEventListener('keydown', handleGlobalKey)
  }, [])

  const clear = () => {
    setInputValue('')
    onChange('')
  }

  return (
    <div className="relative">
      <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted-light dark:text-text-muted-dark pointer-events-none" />
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="搜索..."
        className="w-40 sm:w-52 pl-9 pr-8 py-1.5 text-sm bg-zinc-50 dark:bg-zinc-900/50 border border-border-light dark:border-border-dark rounded-md text-text-primary-light dark:text-text-primary-dark placeholder:text-text-muted-light dark:placeholder:text-text-muted-dark focus:outline-none focus:ring-2 focus:ring-section-growth/20 dark:focus:ring-section-growth-dark/20 focus:border-section-growth dark:focus:border-section-growth-dark transition-all duration-200"
        aria-label="搜索语录"
      />
      {inputValue && (
        <button
          onClick={clear}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-text-muted-light dark:text-text-muted-dark hover:text-text-primary-light dark:hover:text-text-primary-dark transition-colors duration-200 cursor-pointer rounded-sm hover:bg-zinc-200 dark:hover:bg-zinc-700"
          aria-label="清除搜索"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
