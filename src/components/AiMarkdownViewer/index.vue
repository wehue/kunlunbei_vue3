<script setup>
import { computed } from 'vue'
import MarkdownRenderer from 'vue-renderer-markdown'

const props = defineProps({
  content: {
    type: String,
    default: '',
  },
})

function fixTable(tableText) {
  const lines = tableText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return tableText

  const rows = lines.map((line) => line.split('|').filter((cell) => cell.trim() !== ''))

  const colCount = Math.max(...rows.map((r) => r.length))

  const normalized = rows.map((r) => {
    while (r.length < colCount) r.push('')
    return `| ${r.join(' | ')} |`
  })

  if (!/^\|\s*-+/.test(normalized[1])) {
    const divider = '| ' + Array(colCount).fill('---').join(' | ') + ' |'
    normalized.splice(1, 0, divider)
  }

  return normalized.join('\n')
}

function normalizeTables(text) {
  const lines = text.split('\n')
  const result = []

  let tableBuffer = []

  function flushTable() {
    if (tableBuffer.length > 0) {
      result.push(fixTable(tableBuffer.join('\n')))
      tableBuffer = []
    }
  }

  for (const line of lines) {
    if (line.trim().startsWith('|')) {
      tableBuffer.push(line)
    } else {
      flushTable()
      result.push(line)
    }
  }

  flushTable()
  return result.join('\n')
}

function normalizeMarkdown(raw) {
  if (!raw) return ''

  let text = raw

  text = text.replace(/<br\s*\/?>/gi, '\n')
  text = text.replace(/&nbsp;/gi, ' ')
  text = text.replace(/<\/?(?!br)[^>]+>/gi, '')

  text = text.replace(/^(#{1,6})([^ #])/gm, '$1 $2')

  text = text.replace(/^-\s*([^ ])/gm, '- $1')
  text = text.replace(/^(\d+)\.\s*([^ ])/gm, '$1. $2')

  text = text.replace(/([^\n|])\n(\|.*\|)/g, '$1\n\n$2')

  text = normalizeTables(text)

  text = text.replace(/\n{3,}/g, '\n\n')

  return text.trim()
}

const renderedMarkdown = computed(() => normalizeMarkdown(props.content))
</script>

<template>
  <div class="ai-markdown-container">
    <MarkdownRenderer :content="renderedMarkdown" />
  </div>
</template>

<style scoped>
.ai-markdown-container {
  padding: 16px;
  font-size: 14px;
  line-height: 1.75;
  text-align: left;
  color: #000000;
}

.ai-markdown-container h1,
.ai-markdown-container h2,
.ai-markdown-container h3,
.ai-markdown-container h4,
.ai-markdown-container h5,
.ai-markdown-container h6 {
  margin: 14px 0 8px;
  text-align: center;
}

.ai-markdown-container p,
.ai-markdown-container li,
.ai-markdown-container blockquote,
.ai-markdown-container pre,
.ai-markdown-container code {
  text-align: left;
}

.ai-markdown-container ul,
.ai-markdown-container ol {
  padding-left: 22px;
  text-align: left;
}

.ai-markdown-container table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  text-align: left;
}

.ai-markdown-container th,
.ai-markdown-container td {
  border: 1px solid #ddd;
  padding: 6px 10px;
  text-align: left;
}
</style>
