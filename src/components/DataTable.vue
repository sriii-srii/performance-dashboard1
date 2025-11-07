<template>
  <div>
    <table border="1" cellspacing="0" cellpadding="6" style="width:100%;background:#222;color:#fff;">
      <thead>
        <tr>
          <th>Timestamp</th>
          <th>Value</th>
          <th>Category</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in pagedRows" :key="row.timestamp + (row.category ?? '')">
          <td>{{ row.timestamp }}</td>
          <td>{{ row.value.toFixed(2) }}</td>
          <td>{{ row.category }}</td>
        </tr>
      </tbody>
    </table>
    <div v-if="rows.length > 100" style="margin-top:8px;">
      <button @click="prevPage" :disabled="pageIndex===0">Prev 100</button>
      <button @click="nextPage" :disabled="endIndex >= rows.length">Next 100</button>
      <span>Show {{startIndex+1}}-{{Math.min(endIndex,rows.length)}} of {{rows.length}}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue';
import type { DataPoint } from '../composables/useDataStream';

const props = defineProps<{
  rows: DataPoint[];
}>();

const pageIndex = ref(0);

const startIndex = computed(() => pageIndex.value * 100);
const endIndex = computed(() => startIndex.value + 100);
const pagedRows = computed(() =>
  props.rows.slice().reverse().slice(startIndex.value, endIndex.value)
);

function prevPage() {
  if (pageIndex.value > 0) pageIndex.value--;
}
function nextPage() {
  if ((pageIndex.value + 1) * 100 < props.rows.length) pageIndex.value++;
}
</script>
