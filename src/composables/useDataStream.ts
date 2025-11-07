import { ref, computed, watch } from 'vue';
// Import type-only for Ref if strict mode (new TS)
import type { Ref } from 'vue';

// Define the data point structure
export interface DataPoint {
  timestamp: number;
  value: number;
  category: string;
}

const categories = ['A', 'B', 'C', 'D'];

// Worker initialization - only in browser
let dataWorker: Worker | null = null;
if (typeof window !== 'undefined') {
  dataWorker = new Worker(new URL('../utils/dataWorker.ts', import.meta.url), { type: 'module' });
}

// Web Worker Aggregation Composable
export function useAggregatedViaWorker(dataPoints: Ref<DataPoint[]>, windowMs: number) {
  const result = ref<DataPoint[]>([]);
  if (!dataWorker) return result;

  watch([dataPoints, () => windowMs], () => {
    dataWorker!.postMessage({
      type: 'aggregate',
      data: dataPoints.value,
      windowMs
    });
  }, { immediate: true });

  dataWorker.onmessage = (e: MessageEvent) => {
    if (e.data.type === 'aggregated') {
      result.value = e.data.result;
    }
  };
  return result;
}

// Helper: Generate random number between min and max
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

const WINDOW_SIZE_MS = 60 * 60 * 1000; // 1 hour
const STREAM_INTERVAL_MS = 100; // 100ms

export function useDataStream() {
  const dataPoints = ref<DataPoint[]>([]);
  let currentTimestamp = Date.now();

  function generateDataPoint(): DataPoint {
    const idx = Math.floor(Math.random() * categories.length);
    const category = categories[idx] ?? 'A';
    const value = randomBetween(10, 100);
    currentTimestamp += STREAM_INTERVAL_MS;
    return { timestamp: currentTimestamp, value, category };
  }

  setInterval(() => {
    dataPoints.value.push(generateDataPoint());
    // Remove old data beyond sliding window (safe check for empty array)
    while (
      dataPoints.value.length > 0 &&
      (dataPoints.value[0]?.timestamp ?? 0) < Date.now() - WINDOW_SIZE_MS
    ) {
      dataPoints.value.shift();
    }
  }, STREAM_INTERVAL_MS);

  // Direct (non-worker) aggregation helpers
  const aggregateByMinute = computed(() => aggregateData(60 * 1000));
  const aggregateByFiveMinutes = computed(() => aggregateData(5 * 60 * 1000));
  const aggregateByHour = computed(() => aggregateData(60 * 60 * 1000));

  function aggregateData(windowMs: number) {
    const groups: Record<string, { sum: number; count: number }> = {};
    dataPoints.value.forEach((dp) => {
      const key = `${dp.category}-${Math.floor(dp.timestamp / windowMs)}`;
      if (!groups[key]) groups[key] = { sum: 0, count: 0 };
      groups[key].sum += dp.value;
      groups[key].count += 1;
    });
    return Object.entries(groups).map(([key, val]) => {
      const [category, timeGroup] = key.split('-');
      return {
        category,
        timestamp: Number(timeGroup) * windowMs,
        value: val.sum / val.count,
      };
    });
  }

  return {
    dataPoints,
    aggregateByMinute,
    aggregateByFiveMinutes,
    aggregateByHour,
    categories,
  };
}
