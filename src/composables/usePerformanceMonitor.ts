import { ref, onMounted, onUnmounted } from 'vue';

export function usePerformanceMonitor() {
  const fps = ref(0);
  const memory = ref<number | null>(null);
  const lastFrameTime = ref(0);
  const renderTime = ref(0);

  let frameCount = 0;
  let lastTime = performance.now();

  function update() {
    frameCount++;
    const now = performance.now();
    if (now - lastTime >= 1000) {
      fps.value = frameCount;
      frameCount = 0;
      lastTime = now;
      // Get JS heap memory (Chrome only)
      if ((performance as any).memory) {
        memory.value = (performance as any).memory.usedJSHeapSize / (1024 * 1024);
      }
    }
    lastFrameTime.value = now;
    requestAnimationFrame(update);
  }

  onMounted(update);
  onUnmounted(() => {});

  return { fps, memory, renderTime };
}
