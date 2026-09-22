const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const ts = require('typescript')

// Compile the two dependency-free TypeScript modules under test without
// introducing another test runner or loading browser-only React components.
function loadPureModule(relativePath) {
  const input = fs.readFileSync(path.join(__dirname, '..', relativePath), 'utf8')
  const output = ts.transpileModule(input, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    fileName: relativePath,
  }).outputText
  const module = { exports: {} }
  new Function('module', 'exports', 'require', output)(module, module.exports, require)
  return module.exports
}

const { computeInsights } = loadPureModule('src/utils/insights.ts')
const { parseJsonl } = loadPureModule('src/utils/parseJsonl.ts')

function quote(global_id, section = '关于成长', tags = []) {
  return {
    id: global_id,
    global_id,
    section_num: 1,
    section,
    content: `语录 ${global_id}`,
    tags,
    keywords: [],
  }
}

test('aggregates sections and deduplicates repeated tags within a quote', () => {
  const result = computeInsights([
    quote(1, '关于成长', ['学习', '学习', '团队']),
    quote(2, '关于管理', ['团队']),
    quote(3),
  ])
  assert.equal(result.total, 3)
  assert.equal(result.taggedCount, 2)
  assert.deepEqual(result.sectionCounts, [
    { label: '关于成长', count: 2 },
    { label: '关于管理', count: 1 },
  ])
  assert.deepEqual(result.tagCounts, [
    { label: '团队', count: 2 },
    { label: '学习', count: 1 },
  ])
})

test('empty search scope has zero totals and no chart items', () => {
  assert.deepEqual(computeInsights([]), {
    total: 0, sectionCounts: [], tagCounts: [], taggedCount: 0,
  })
})

test('valid CRLF JSONL parses and ignores blank lines', () => {
  assert.deepEqual(parseJsonl(`${JSON.stringify(quote(1))}\r\n\r\n${JSON.stringify(quote(2))}\r\n`), [quote(1), quote(2)])
})

test('malformed JSON reports its original line', () => {
  assert.throws(() => parseJsonl(`${JSON.stringify(quote(1))}\n{bad}`), /第 2 行/)
})

test('invalid tag arrays are rejected before dashboard calculations', () => {
  assert.throws(() => parseJsonl(JSON.stringify({ ...quote(1), tags: null })), /第 1 行/)
})

test('duplicate global identifiers are rejected', () => {
  assert.throws(() => parseJsonl(`${JSON.stringify(quote(1))}\n${JSON.stringify(quote(1))}`), /重复/)
})

test('non-positive and non-integer identifiers are rejected', () => {
  for (const id of [0, -1, 1.2, true]) {
    assert.throws(() => parseJsonl(JSON.stringify({ ...quote(1), global_id: id })), /字段无效/)
  }
})
