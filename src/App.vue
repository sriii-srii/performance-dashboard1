<script lang="ts" setup>
import { computed, ref } from 'vue'
import LineChart from './components/charts/LineChart.vue'
import BarChart from './components/charts/BarChart.vue'
import ScatterPlot from './components/charts/ScatterPlot.vue'
import Heatmap from './components/charts/Heatmap.vue'
import DataTable from './components/DataTable.vue'

import { useDataStream } from './composables/useDataStream'
import type { DataPoint } from './composables/useDataStream'  // *** type-only import ***

const stream = useDataStream()

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

// windows typed with string index signature added
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

const selectedCategory = ref<string>('all')

const categories = computed<string[]>(() => {
  const set = new Set<string>()
  for (const d of baseData.value) {
    if (d && typeof d.category === 'string' && d.category.length) set.add(d.category)
  }
  return Array.from(set)
})

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
