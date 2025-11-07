<template>
  <div style="display: flex; gap: 20px; margin-bottom: 12px;">
    <label>
      Category:
      <select v-model="selectedCategory">
        <option value="">All</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
    </label>
    <label>
      Min Value:
      <input type="number" v-model.number="minValue" style="width:70px;" />
    </label>
    <label>
      Max Value:
      <input type="number" v-model.number="maxValue" style="width:70px;" />
    </label>
    <button @click="emitFilter" style="margin-left:10px;">Apply</button>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

// Only grab categories prop directly, no unused "props" variable!
const { categories } = defineProps<{ categories: string[] }>();

const emit = defineEmits<{
  (e: 'filter', filter: {category: string; min: number; max: number}): void;
}>();

const selectedCategory = ref('');
const minValue = ref(10);
const maxValue = ref(100);

function emitFilter() {
  emit('filter', {
    category: selectedCategory.value,
    min: minValue.value,
    max: maxValue.value,
  });
}

// Immediately emit the default filter on mount for reactivity
watchEffect(() => {
  emitFilter();
});
</script>
