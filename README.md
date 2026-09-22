# 张一鸣公开微博语录 · 主题探索与图片卡片

基于整理后的公开语录构建的交互式探索与视觉创作网页。支持全文搜索、分类与标签筛选、主题统计、标签关联以及每条语录的文字复制和小红书风格图片卡片制作。

> 首页与语录卡片已经重新设计；仓库中的 `assets/screenshot.png` 是旧版截图，更新视觉截图前请以实际页面为准。

## 使用图片工作台

1. 在语录列表中找到想分享的内容，选择「生成图片卡片」。
2. 在 Card Studio 中切换四种原创主题：蜜桃笔记、极简纸张、深夜思考、薄荷手账。
3. 选择 3:4 (1080×1440)、4:5 (1080×1350) 或 1:1 (1080×1080) 像素的图片比例，设置字体大小或是否显示标签。
4. 通过实时预览检查排版，点击「下载第 N 张 PNG」保存当前页。长语录会根据实际 Canvas 字体测量自动分页；使用左右翻页按钮逐张保存。

图片在浏览器本地由 Canvas 生成，不会发送到远程绘图 API，也没有新增图片导出依赖。预览和 PNG 使用同一渲染函数；下载使用浏览器文件保存机制。移动端浏览器可能将图片打开到预览页，此时可使用系统自带的保存图片操作。

**当前范围：** 支持单条语录、逐页 PNG 下载，不包含批量 ZIP、全文自由编辑或图片上传。需要更复杂的批量导出时，可以在浏览器级回归测试和下载兼容性验证后再扩展。

## 语料与解释边界

仓库附带 `data/raw/` 中的整理资料，结构化数据在 `data/zhangyiming_weibo_tagged.jsonl`，网站加载 `public/` 中的同步副本。目前校验的语料规模为 231 条；网站的总数、分类及标签数量从数据动态计算。

当前记录没有逐条核实的发表日期和原始微博 URL。因此网站不推断按年趋势、观点演变或原始链接；导出卡片使用「整理摘录」字样，不能代替原始来源核验。文本来自整理资料，不应被视为全部公开言论的完整采样。主题标签来自既有标注，关联统计仅表示本数据集内同一记录上的共现，不表示因果关系。

## 其他功能

- 正文、标签和关键词全文搜索，支持与分类/标签组合筛选。
- 互动分类分布、主题标签排行与标签共现浏览，与筛选后的语录列表联动。
- 在所有设备上始终显示「复制文字」和「生成图片卡片」按钮；复制失败会明确提示。
- 支持深色模式、键盘跳转、编辑器 Escape 关闭与焦点恢复，以及减弱动态效果设置。
- 严格 JSONL 校验，异常记录和重复编号不会被静默忽略。

## 技术栈

React 18、TypeScript、Vite 6、Tailwind CSS 3、Lucide React 和浏览器 Canvas API。图表采用 HTML/CSS 统计条，图片生成无需服务端和额外运行时依赖。

## 本地开发与验证

要求 Node.js 20 与 Python 3.11（仅数据校验和 Python 测试需要 Python）。

```bash
git clone https://github.com/1998x-stack/zhangyiming-visualize.git
cd zhangyiming-visualize
npm ci
npm run dev
```

```bash
python3 data/scripts/validate_data.py
python3 -m unittest discover -s tests -p 'test_*.py' -v
npm test
npm run build
npm run preview
```

`npm test` 使用 Node 原生测试运行器，对搜索统计、数据解析、Canvas 文本换行与自动分页执行回归测试；`npm run build` 先执行 TypeScript 检查再打包到 `dist/`。GitHub Actions 在 PR 中执行相同的验证流程。

## 主要实现文件

- `src/components/InsightsDashboard.tsx`：分类、标签及主题关联可视化。
- `src/components/QuoteCard.tsx`、`QuoteGrid.tsx`：阅读卡片、复制操作、图片创建入口。
- `src/components/CardStudio.tsx`：可访问的响应式图片工作台和参数控制。
- `src/utils/cardRenderer.ts`：四种主题、三种尺寸、真实文字测量、无损分页与 PNG 导出。
- `tests/cardRenderer.test.cjs`：Unicode、段落、分页边界和成品页码回归测试。
- `src/utils/insights.ts`、`parseJsonl.ts`：统计聚合与客户端数据校验。
- `data/scripts/validate_data.py`、`tests/test_data.py`：独立数据验证。
- `.github/workflows/ci.yml`、`deploy.yml`：构建校验和 GitHub Pages 部署。

## 标签生成与后续扩展

`data/scripts/generate_tags.py` 依赖外部 DashScope SDK 和 API 访问权限，不是网站运行或常规测试所必需的步骤。若更新标签，请先人工检查，再同步更新 `data/` 和 `public/` 的 JSONL 文件并执行校验。

在核实逐条来源、日期并显式标记缺失数据后，可以添加时间轴及出处跳转。若进一步开发批量 ZIP 导出、模板自定义及浏览器端到端测试，应分别校验内存占用、长文自动分页和不同移动浏览器的保存行为。
