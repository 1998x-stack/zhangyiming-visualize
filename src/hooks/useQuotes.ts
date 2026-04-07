import { useState, useEffect } from 'react'
import { QuoteEntry } from '../types'
import { parseJsonl } from '../utils/parseJsonl'

interface UseQuotesResult {
  data: QuoteEntry[] | null
  loading: boolean
  error: string | null
  retry: () => void
}

export function useQuotes(): UseQuotesResult {
  const [data, setData] = useState<QuoteEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    let cancelled = false

    async function fetchQuotes() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`${import.meta.env.BASE_URL}zhangyiming_weibo_tagged.jsonl`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const text = await response.text()
        const entries = parseJsonl(text)
        if (entries.length === 0) {
          throw new Error('No valid entries found')
        }
        if (!cancelled) {
          setData(entries)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unknown error')
          setLoading(false)
        }
      }
    }

    fetchQuotes()
    return () => { cancelled = true }
  }, [retryCount])

  const retry = () => setRetryCount(c => c + 1)

  return { data, loading, error, retry }
}
