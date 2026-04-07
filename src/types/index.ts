export interface QuoteEntry {
  id: number
  section: string
  section_num: number
  global_id: number
  content: string
  tags: string[]
  keywords: string[]
}

export type SectionKey = 'all' | 'growth' | 'management' | 'business'

export const SECTION_MAP: Record<Exclude<SectionKey, 'all'>, string> = {
  growth: '关于成长',
  management: '关于管理',
  business: '关于商业',
}

export const SECTION_LABELS: Record<SectionKey, string> = {
  all: '全部',
  growth: '关于成长',
  management: '关于管理',
  business: '关于商业',
}

export const SECTION_COLORS: Record<Exclude<SectionKey, 'all'>, string> = {
  growth: 'section-growth',
  management: 'section-management',
  business: 'section-business',
}
