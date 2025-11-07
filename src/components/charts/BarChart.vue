<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import type { DataPoint } from '../../composables/useDataStream'  // *** type-only import ***

const props = defineProps<{
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
}>();

const width = props.width ?? 800;
const height = props.height ?? 300;
const color = props.color ?? '#ff9900';
const canvasRef = ref<HTMLCanvasElement | null>(null);

function drawBarChart(ctx: CanvasRenderingContext2D, data: DataPoint[]) {
  ctx.clearRect(0, 0, width, height);
  if (!data.length) return;

  const categories = Array.from(new Set(data.map(d => d.category ?? '')));
  const sums = categories.map(c =>
    data.filter(d => (d.category ?? '') === c).reduce((s, d) => s + d.value, 0)
  );
  const barWidth = (width - 40) / categories.length;

  ctx.fillStyle = color;
  sums.forEach((sum, idx) => {
    const x = 20 + idx * barWidth;
    const y = height - (sum / Math.max(...sums)) * (height - 40) - 20;
    ctx.fillRect(x, y, barWidth * 0.8, height - y - 20);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 14px Arial";
    ctx.fillText(categories[idx] ?? '', x, height - 6);
    ctx.fillStyle = color;
  });
}

let animationId: number | null = null;
function render() {
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  drawBarChart(ctx, props.data);
  animationId = requestAnimationFrame(render);
}

onMounted(render);
watch(() => props.data, () => {});
onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId);
});
</script>

<script lang="ts">
export default {};
</script>
