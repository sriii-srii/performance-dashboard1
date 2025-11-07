<template>
  <div style="display:flex; gap:16px; align-items:center; margin-bottom:12px; flex-wrap:wrap;">
    <label>
      Category:
      <select v-model="selectedCategory" style="padding:6px;">
        <option value="">All</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>

    <label>
      Min Value:
      <input
        type="number"
        v-model.number="minValue"
        style="width:90px; padding:6px;"
        @keydown.enter.prevent="emitFilter"
        placeholder="min"
      />
    </label>

    <label>
      Max Value:
      <input
        type="number"
        v-model.number="maxValue"
        style="width:90px; padding:6px;"
        @keydown.enter.prevent="emitFilter"
        placeholder="max"
      />
    </label>

    <button @click="emitFilter" style="padding:6px 10px;">Apply</button>
    <button @click="reset" style="padding:6px 10px;">Reset</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  categories: string[]
  defaultCategory?: string
  defaultMin?: number | null
  defaultMax?: number | null
}>(), {
  defaultCategory: '',
  defaultMin: null,
  defaultMax: null
})

const emit = defineEmits<{
  (e: 'filter', filter: { category: string; min: number | null; max: number | null }): void
}>()

const selectedCategory = ref<string>(props.defaultCategory)
const minValue = ref<number | null>(props.defaultMin)
const maxValue = ref<number | null>(props.defaultMax)

function normalizeRange(): { min: number | null; max: number | null } {
  let min = minValue.value
  let max = maxValue.value
  if (min != null && max != null && min > max) {
    const tmp = min; min = max; max = tmp
  }
  return { min, max }
}

function emitFilter() {
  const { min, max } = normalizeRange()
  emit('filter', {
    category: selectedCategory.value,
    min,
    max
  })
}

function reset() {
  selectedCategory.value = props.defaultCategory
  minValue.value = props.defaultMin
  maxValue.value = props.defaultMax
  emitFilter()
}

watch([selectedCategory, minValue, maxValue], () => {
  emitFilter()
})

onMounted(() => {
  emitFilter()
})
</script>
