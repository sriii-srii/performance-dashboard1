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
  color?: string;
}>()

const width = props.width ?? 800
const height = props.height ?? 300
const color = props.color ?? '#ff0'
const canvasRef = ref<HTMLCanvasElement | null>(null)

function drawScatterPlot(ctx: CanvasRenderingContext2D, data: DataPoint[]) {
  ctx.clearRect(0, 0, width, height)
  if (!data.length) return

  const minTime = data[0]?.timestamp ?? 0
  const maxTime = data[data.length - 1]?.timestamp ?? minTime
  const vals = data.map(d => d.value ?? 0)
  const minVal = Math.min(...vals)
  const maxVal = Math.max(...vals)

  ctx.fillStyle = color
  data.forEach(point => {
    const t = point.timestamp ?? minTime
    const v = point.value ?? minVal
    const x = ((t - minTime) / (maxTime - minTime || 1)) * (width - 40) + 20
    const y = height - ((v - minVal) / (maxVal - minVal || 1)) * (height - 40) - 20
    ctx.beginPath()
    ctx.arc(x, y, 3, 0, Math.PI * 2)
    ctx.fill()
  })
}

let animationId: number | null = null
function render() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  drawScatterPlot(ctx, props.data)
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
