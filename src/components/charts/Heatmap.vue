<template>
  <canvas
    ref="canvasRef"
    :width="width"
    :height="height"
    style="border:1px solid #eee; background:#222;"
  />
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import type { DataPoint } from '../../composables/useDataStream'

const props = defineProps<{
  data: DataPoint[];
  width?: number;
  height?: number;
}>()

const width = props.width ?? 800
const height = props.height ?? 300
const canvasRef = ref<HTMLCanvasElement | null>(null)

function drawHeatmap(ctx: CanvasRenderingContext2D, data: DataPoint[]) {
  ctx.clearRect(0, 0, width, height)
  if (!data.length) return

  const rows = 10, cols = 20
  const values = data.map(d => d.value ?? 0)
  const minVal = Math.min(...values)
  const maxVal = Math.max(...values)
  const bins: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0))

  data.forEach(point => {
    const v = point.value ?? 0
    const t = point.timestamp ?? 0
    const row = Math.floor(((v - minVal) / (maxVal - minVal || 1)) * (rows - 1))
    const col = Math.floor((t % (1000 * cols)) / 1000)
    bins[Math.max(0, Math.min(rows - 1, row))][Math.max(0, Math.min(cols - 1, col))] += 1
  })

  const cellWidth = width / cols
  const cellHeight = height / rows
  bins.forEach((rowArr, r) => {
    rowArr.forEach((v, c) => {
      const intensity = Math.min(255, v * 20)
      ctx.fillStyle = `rgb(${intensity},0,${255 - intensity})`
      ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight)
    })
  })
}

let animationId: number | null = null
function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  drawHeatmap(ctx, props.data)
  animationId = requestAnimationFrame(render)
}

onMounted(render)
watch(() => props.data, () => {})
onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
})
</script>
<script lang="ts">
export default {};
</script>
