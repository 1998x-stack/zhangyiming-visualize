const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

function loadRenderer() {
  const filename = path.join(__dirname, '..', 'src/utils/cardRenderer.ts')
  const source = fs.readFileSync(filename, 'utf8')
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: filename,
  }).outputText
  const module = { exports: {} }
  new Function('module', 'exports', 'require', compiled)(module, module.exports, require)
  return module.exports
}

const { wrapCardText, layoutCard, renderCard, DEFAULT_CARD_OPTIONS, CARD_RATIOS } = loadRenderer()
const measure = (value) => Array.from(value).length * 10
const context = { font: '', measureText: (text) => ({ width: measure(text) }) }
const quote = (content) => ({ global_id: 42, section: '关于成长', content, tags: ['学习', '长期主义'] })

test('wraps CJK and surrogate pairs without dropping content', () => {
  const text = '学习😀成长愿景'
  const lines = wrapCardText(text, 30, measure)
  assert.deepEqual(lines, ['学习😀', '成长愿', '景'])
  assert.equal(lines.join(''), text)
})

test('preserves paragraph boundaries and blank lines', () => {
  const text = '第一段\n\n第二段\n'
  const lines = wrapCardText(text, 200, measure)
  assert.deepEqual(lines, ['第一段', '', '第二段', ''])
  assert.equal(lines.join('\n'), text)
})

test('long quotes paginate losslessly in all aspect ratios and font sizes', () => {
  const text = '实践复盘持续学习。'.repeat(400)
  for (const ratio of Object.keys(CARD_RATIOS)) {
    for (const fontSize of ['small', 'medium', 'large']) {
      const layout = layoutCard(context, text, { ...DEFAULT_CARD_OPTIONS, ratio, fontSize })
      assert.ok(layout.pages.length > 1, `${ratio} ${fontSize} must paginate`)
      assert.deepEqual(layout.pages.flat(), layout.lines)
      assert.equal(layout.lines.join(''), text)
      assert.ok(layout.pages.every((page) => page.length > 0))
      const lastLineTop = 340 + (layout.pages[0].length - 1) * layout.lineHeight
      assert.ok(lastLineTop + layout.lineHeight < layout.height - 184 - 70, 'text should not overlap tags')
    }
  }
})

test('short quotes produce one page and layout obeys pixel dimensions', () => {
  for (const ratio of Object.keys(CARD_RATIOS)) {
    const layout = layoutCard(context, '保持好奇心。', { ...DEFAULT_CARD_OPTIONS, ratio })
    assert.equal(layout.pages.length, 1)
    assert.equal(layout.width, 1080)
    assert.equal(layout.height, CARD_RATIOS[ratio].height)
  }
})

test('canvas render matches layout page count and shows page numbering', () => {
  const drawn = []
  const ctx = {
    ...context,
    fillRect() {}, beginPath() {}, roundRect() {}, fill() {}, arc() {},
    fillText(text) { drawn.push(text) }, moveTo() {}, lineTo() {}, stroke() {},
  }
  const canvas = { width: 0, height: 0, getContext: () => ctx }
  const layout = renderCard(canvas, quote('成长与学习。'.repeat(180)), DEFAULT_CARD_OPTIONS, 1)
  assert.ok(layout.pages.length > 1)
  assert.equal(canvas.width, 1080)
  assert.equal(canvas.height, 1440)
  assert.ok(drawn.includes(`2 / ${layout.pages.length}`))
  assert.ok(drawn.includes(layout.pages[1][0]))
})
