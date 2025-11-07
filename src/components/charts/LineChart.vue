<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
    style="border:1px solid #eee; background:#222; touch-action:none"
    @mousedown="onMouseDown"
    @mousemove="onMouseMove"
    @mouseup="onMouseUp"
    @mouseleave="onMouseUp"
    @wheel="onWheel"
  />
</template>

<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { DataPoint } from '../../composables/useDataStream';

const props = defineProps<{
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}>();

const width = props.width ?? 800;
const height = props.height ?? 300;
const color = props.color ?? '#00f';

const canvasRef = ref<HTMLCanvasElement | null>(null);

let xOffset = 0;
let zoom = 1;
let isDragging = false;
let dragStartX = 0;
let dragStartOffset = 0;

// Simple pan with mouse
function onMouseDown(e: MouseEvent) {
  isDragging = true;
  dragStartX = e.offsetX;
  dragStartOffset = xOffset;
}
function onMouseMove(e: MouseEvent) {
  if (isDragging) {
    const dx = e.offsetX - dragStartX;
    xOffset = dragStartOffset + dx / zoom;
  }
}
function onMouseUp() {
  isDragging = false;
}
function onWheel(e: WheelEvent) {
  e.preventDefault();
  if (e.deltaY < 0) zoom *= 1.1;
  else zoom /= 1.1;
  zoom = Math.max(zoom, 0.05); // prevent flipping
}

// Actual chart rendering
function drawLineChart(ctx: CanvasRenderingContext2D, data: DataPoint[]) {
  ctx.clearRect(0, 0, width, height);
  if (!data.length) return;

  // Pan/zoom logic
  const displayCount = Math.floor(data.length / zoom);
  const startIdx = Math.max(0, Math.min(data.length - displayCount, Math.floor(xOffset)));
  const shown = data.slice(startIdx, startIdx + displayCount);

  const minTime = shown[0].timestamp;
  const maxTime = shown[shown.length - 1].timestamp;
  const minVal = Math.min(...shown.map(d => d.value));
  const maxVal = Math.max(...shown.map(d => d.value));

  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  shown.forEach((point, idx) => {
    const x = ((point.timestamp - minTime) / (maxTime - minTime || 1)) * (width - 40) + 20;
    const y = height - ((point.value - minVal) / (maxVal - minVal || 1)) * (height - 40) - 20;
    if (idx === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });

  ctx.stroke();

  // Draw pan/zoom info
  ctx.fillStyle = "#fff";
  ctx.font = "bold 14px Arial";
  ctx.fillText(`Pan: ${Math.round(xOffset)}, Zoom: ${zoom.toFixed(2)}`, 20, 22);
}

let animationId: number | null = null;
function render() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawLineChart(ctx, props.data);
  animationId = requestAnimationFrame(render);
}

onMounted(render);

watch(() => props.data, () => {
  // Redraw happens automatically on each frame
});

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>
<script lang="ts">
export default {};
</script>

