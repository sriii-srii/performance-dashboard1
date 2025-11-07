<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useDataStream, useAggregatedViaWorker } from './composables/useDataStream';
import { usePerformanceMonitor } from './composables/usePerformanceMonitor';

import LineChart from './components/charts/LineChart.vue';
import BarChart from './components/charts/BarChart.vue';
import ScatterPlot from './components/charts/ScatterPlot.vue';
import Heatmap from './components/charts/Heatmap.vue';
import FilterPanel from './components/controls/FilterPanel.vue';
import TimeRangeSelector from './components/controls/TimeRangeSelector.vue';
import DataTable from './components/DataTable.vue';

const { dataPoints, categories } = useDataStream();
const { fps, memory } = usePerformanceMonitor();

const filter = ref({ category: '', min: 10, max: 100 });
const period = ref('1min');

function handleFilter(newFilter: { category: string; min: number; max: number }) {
  filter.value = newFilter;
}
function handlePeriod(newPeriod: string) {
  period.value = newPeriod;
}

const windowSizeMap: Record<string, number> = {
  '1min': 60 * 1000,
  '5min': 5 * 60 * 1000,
  '1hr': 60 * 60 * 1000
};


// Use worker for fast aggregation
const rawAggregated = useAggregatedViaWorker(dataPoints, windowSizeMap[period.value]);
const filteredAggregated = computed(() =>
  rawAggregated.value.filter(p =>
    (filter.value.category === '' || p.category === filter.value.category) &&
    p.value >= filter.value.min &&
    p.value <= filter.value.max
  )
);
</script>

<template>
  <div style="padding: 5vw; max-width:1200px; margin:auto;">
    <h1>Real-time Data Stream Demo</h1>
    <div style="margin-bottom:8px; font-size:16px; color:#0ff;">
      <strong>FPS:</strong> {{ fps }} |
      <strong>Memory:</strong> {{ memory ? memory.toFixed(2) + ' MB' : 'N/A' }}
    </div>
    <FilterPanel :categories="categories" @filter="handleFilter"/>
    <TimeRangeSelector @change="handlePeriod"/>
    <LineChart :data="filteredAggregated" :width="900" :height="320" color="#0ff" />
    <BarChart :data="filteredAggregated" :width="900" :height="220" color="#f90" />
    <ScatterPlot :data="filteredAggregated" :width="900" :height="220" color="#ff0" />
    <Heatmap :data="filteredAggregated" :width="900" :height="120" />
    <DataTable :rows="filteredAggregated"/>
  </div>
</template>
