<template>
  <div style="display: flex; gap: 15px; margin-bottom: 12px;">
    <label v-for="opt in options" :key="opt.value" style="cursor:pointer;">
      <input type="radio" v-model="period" :value="opt.value" />
      {{ opt.label }}
    </label>
  </div>
</template>

<script lang="ts" setup>
import { ref, watchEffect } from 'vue';

const options = [
  { label: '1 min', value: '1min' },
  { label: '5 min', value: '5min' },
  { label: '1 hr', value: '1hr' }
];

const period = ref('1min');

const emit = defineEmits<{
  (e: 'change', period: string): void;
}>();

watchEffect(() => {
  emit('change', period.value);
});
</script>
<script lang="ts">
export default {};
</script>

