<template>
  <main style="padding:16px; background:#111; color:#fff; min-height:100vh;">
    <h1 style="margin:0 0 12px 0;">Real-time Performance Dashboard</h1>

    <!-- Controls -->
    <section style="display:flex; gap:12px; flex-wrap:wrap; margin-bottom:12px;">
      <label>
        Window:
        <select v-model="selectedWindow" style="padding:6px;">
          <option v-for="k in windowKeys" :key="k" :value="k">{{ k }}</option>
        </select>
      </label>

      <label>
        Category:
        <select v-model="selectedCategory" style="padding:6px;">
          <option value="all">all</option>
          <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
    </section>

    <!-- Charts -->
    <section style="display:grid; gap:16px;">
      <LineChart :data="filteredData" :width="1000" :height="280" color="#33aaff" />
      <div style="display:grid; grid-template-columns: repeat(2, 1fr); gap:16px;">
        <BarChart :data="filteredData" :width="490" :height="260" color="#ff9900" />
        <ScatterPlot :data="filteredData" :width="490" :height="260" color="#ffee00" />
      </div>
      <Heatmap :data="filteredData" :width="1000" :height="240" />
    </section>

    <!-- Table -->
    <section style="margin-top:18px;">
      <DataTable :rows="filteredData" />
    </section>
  </main>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import LineChart from './components/charts/LineChart.vue'
import BarChart from './components/charts/BarChart.vue'
import ScatterPlot from './components/charts/ScatterPlot.vue'
import Heatmap from './components/charts/Heatmap.vue'
import DataTable from './components/DataTable.vue'

import { useDataStream } from './composables/useDataStream'
import type { DataPoint } from './composables/useDataStream'

/**
 * 1) Get streams/aggregations from the composable.
 *    It returns an object of Refs/ComputedRefs. We read them safely.
 */
const stream = useDataStream() // ✅ no args

const baseData = computed<DataPoint[]>(() => {
  const s: any = stream
  const arr = s?.dataPoints?.value ?? s?.dataPoints ?? []
  return Array.isArray(arr) ? (arr as DataPoint[]) : []
})

const byMinute = computed<DataPoint[]>(() => {
  const s: any = stream
  const arr = s?.aggregateByMinute?.value ?? s?.aggregateByMinute ?? []
  return Array.isArray(arr) ? (arr as DataPoint[]) : []
})

const byFiveMinutes = computed<DataPoint[]>(() => {
  const s: any = stream
  const arr = s?.aggregateByFiveMinutes?.value ?? s?.aggregateByFiveMinutes ?? []
  return Array.isArray(arr) ? (arr as DataPoint[]) : []
})

const byHour = computed<DataPoint[]>(() => {
  const s: any = stream
  const arr = s?.aggregateByHour?.value ?? s?.aggregateByHour ?? []
  return Array.isArray(arr) ? (arr as DataPoint[]) : []
})

/**
 * 2) Time windows with exact key types (no implicit-any on indexing).
 *    Map window -> which dataset to use.
 */
const windows = {
  '1min': 'minute',
  '5min': 'five',
  '1hr': 'hour',
  'all': 'all'
} as const
type WindowKey = keyof typeof windows
type WindowMode = (typeof windows)[WindowKey]

const windowKeys = Object.keys(windows) as WindowKey[]
const selectedWindow = ref<WindowKey>('all')

/** Pick the right dataset based on the selected window */
const windowedData = computed<DataPoint[]>(() => {
  const mode: WindowMode = windows[selectedWindow.value]
  switch (mode) {
    case 'minute': return byMinute.value
    case 'five':   return byFiveMinutes.value
    case 'hour':   return byHour.value
    case 'all':
    default:       return baseData.value
  }
})

/**
 * 3) Category filter
 */
const selectedCategory = ref<string>('all')

const categories = computed<string[]>(() => {
  const set = new Set<string>()
  for (const d of baseData.value) {
    if (d && typeof d.category === 'string' && d.category.length) set.add(d.category)
  }
  return Array.from(set)
})

/**
 * 4) Final filtered data (window + category) with safety guards.
 */
const filteredData = computed<DataPoint[]>(() => {
  const src = windowedData.value
  if (!src.length) return []
  return src.filter(d => {
    const catOk = selectedCategory.value === 'all'
      ? true
      : (d.category ?? '') === selectedCategory.value
    return catOk
  })
})
</script>

<style>
:root { font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji", "Segoe UI Emoji"; }
button { cursor: pointer; }
select { background:#1b1b1b; color:#fff; border:1px solid #444; border-radius:6px; }
label { display:flex; align-items:center; gap:8px; }
</style>
