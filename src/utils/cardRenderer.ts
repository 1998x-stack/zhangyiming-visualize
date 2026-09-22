import type { QuoteEntry } from '../types'

export type CardTheme = 'paper' | 'peach' | 'night' | 'mint'
export type CardRatio = '3:4' | '4:5' | '1:1'
export type CardFontSize = 'small' | 'medium' | 'large'

export interface CardOptions {
  theme: CardTheme
  ratio: CardRatio
  fontSize: CardFontSize
  showTags: boolean
}

export const DEFAULT_CARD_OPTIONS: CardOptions = {
  theme: 'peach', ratio: '3:4', fontSize: 'medium', showTags: true,
}

export const CARD_THEMES: Record<CardTheme, { name: string; background: string; ink: string; muted: string; accent: string; panel: string }> = {
  paper: { name: '极简纸张', background: '#f8f6ef', ink: '#282b2d', muted: '#727775', accent: '#305f76', panel: '#e8e7df' },
  peach: { name: '蜜桃笔记', background: '#fff1ed', ink: '#543b42', muted: '#947982', accent: '#d25d75', panel: '#ffe0da' },
  night: { name: '深夜思考', background: '#19222c', ink: '#f5f0e8', muted: '#b0bdc5', accent: '#f2c37b', panel: '#293541' },
  mint: { name: '薄荷手账', background: '#eaf4ed', ink: '#234b45', muted: '#6c8a81', accent: '#328976', panel: '#d7e9de' },
}

export const CARD_RATIOS: Record<CardRatio, { label: string; width: number; height: number }> = {
  '3:4': { label: '3:4 · 小红书', width: 1080, height: 1440 },
  '4:5': { label: '4:5 · 竖版', width: 1080, height: 1350 },
  '1:1': { label: '1:1 · 方形', width: 1080, height: 1080 },
}

const FONT_SIZES: Record<CardFontSize, number> = { small: 43, medium: 52, large: 62 }
const FONT_STACK = '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", sans-serif'

export interface CardLayout {
  lines: string[]
  pages: string[][]
  width: number
  height: number
  fontSize: number
  lineHeight: number
}

/** Wrap by measured grapheme width, preserving explicit paragraphs and never dropping a character. */
export function wrapCardText(text: string, maxWidth: number, measure: (value: string) => number): string[] {
  const lines: string[] = []
  for (const paragraph of text.replace(/\r\n?/g, '\n').split('\n')) {
    if (!paragraph) { lines.push(''); continue }
    let current = ''
    for (const char of Array.from(paragraph)) {
      if (current && measure(current + char) > maxWidth) {
        lines.push(current)
        current = char
      } else {
        current += char
      }
    }
    lines.push(current)
  }
  return lines.length ? lines : ['']
}

/** Layout and exported bitmap share the same canvas metrics to avoid preview/export clipping. */
export function layoutCard(ctx: CanvasRenderingContext2D, content: string, options: CardOptions): CardLayout {
  const { width, height } = CARD_RATIOS[options.ratio]
  const fontSize = FONT_SIZES[options.fontSize]
  const lineHeight = Math.round(fontSize * 1.72)
  ctx.font = `500 ${fontSize}px ${FONT_STACK}`
  const lines = wrapCardText(content, width - 192, (text) => ctx.measureText(text).width)
  const maxLines = Math.max(1, Math.floor((height - 565) / lineHeight))
  const pages: string[][] = []
  for (let offset = 0; offset < lines.length; offset += maxLines) {
    pages.push(lines.slice(offset, offset + maxLines))
  }
  return { width, height, fontSize, lineHeight, lines, pages }
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}

/** Render a single page as a standalone, local-only PNG-ready canvas. */
export function renderCard(canvas: HTMLCanvasElement, quote: QuoteEntry, options: CardOptions, pageIndex: number): CardLayout {
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('当前浏览器不支持 Canvas 图片生成')
  const layout = layoutCard(ctx, quote.content, options)
  const index = Math.max(0, Math.min(pageIndex, layout.pages.length - 1))
  const palette = CARD_THEMES[options.theme]
  canvas.width = layout.width
  canvas.height = layout.height
  ctx.textBaseline = 'top'
  ctx.fillStyle = palette.background
  ctx.fillRect(0, 0, layout.width, layout.height)

  // Decorative shapes never carry textual meaning.
  ctx.fillStyle = palette.panel
  ctx.beginPath()
  ctx.arc(layout.width + 54, -60, 315, 0, 2 * Math.PI)
  ctx.fill()
  ctx.beginPath()
  ctx.arc(-82, layout.height + 72, 210, 0, 2 * Math.PI)
  ctx.fill()
  roundedRect(ctx, 76, 76, 96, 9, 5, palette.accent)
  ctx.fillStyle = palette.muted
  ctx.font = `600 29px ${FONT_STACK}`
  ctx.fillText('PUBLIC QUOTES  /  语录摘记', 76, 112)
  ctx.fillStyle = palette.accent
  ctx.font = `700 110px Georgia, serif`
  ctx.fillText('“', 62, 218)
  ctx.fillStyle = palette.ink
  ctx.font = `500 ${layout.fontSize}px ${FONT_STACK}`
  let y = 340
  for (const line of layout.pages[index]) {
    ctx.fillText(line, 96, y)
    y += layout.lineHeight
  }

  const footerY = layout.height - 184
  if (options.showTags && quote.tags.length) {
    ctx.font = `500 27px ${FONT_STACK}`
    let x = 88
    for (const tag of quote.tags.slice(0, 3)) {
      const label = `#${tag}`
      const tagWidth = ctx.measureText(label).width + 34
      if (x + tagWidth > layout.width - 76) break
      roundedRect(ctx, x, footerY - 70, tagWidth, 45, 22, palette.panel)
      ctx.fillStyle = palette.accent
      ctx.fillText(label, x + 17, footerY - 62)
      x += tagWidth + 12
    }
  }
  ctx.strokeStyle = palette.muted
  ctx.globalAlpha = 0.38
  ctx.beginPath()
  ctx.moveTo(76, footerY)
  ctx.lineTo(layout.width - 76, footerY)
  ctx.stroke()
  ctx.globalAlpha = 1
  ctx.fillStyle = palette.ink
  ctx.font = `600 29px ${FONT_STACK}`
  ctx.fillText('张一鸣公开语录 · 整理摘录', 76, footerY + 29)
  ctx.fillStyle = palette.muted
  ctx.font = `400 23px ${FONT_STACK}`
  ctx.fillText(`${quote.section}  ·  #${String(quote.global_id).padStart(3, '0')}`, 76, footerY + 75)
  const counter = `${index + 1} / ${layout.pages.length}`
  ctx.textAlign = 'right'
  ctx.fillText(counter, layout.width - 76, footerY + 75)
  ctx.textAlign = 'left'
  return layout
}

export async function saveCardPng(quote: QuoteEntry, options: CardOptions, pageIndex: number): Promise<void> {
  const canvas = document.createElement('canvas')
  const layout = renderCard(canvas, quote, options, pageIndex)
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error('PNG 编码失败')), 'image/png')
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `zhangyiming-${quote.global_id}-${Math.min(pageIndex + 1, layout.pages.length)}-of-${layout.pages.length}.png`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
