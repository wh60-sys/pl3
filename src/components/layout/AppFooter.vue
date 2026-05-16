<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  requester?: string
}>()

const now = computed(() => dayjs().format('DD MMMM YYYY HH:mm'))
</script>

<template>
  <footer class="bg-slate-900 border-t border-slate-700 px-6 py-3">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-slate-400">
      <div class="flex items-center gap-1">
        <span>© {{ new Date().getFullYear() }}</span>
        <span class="text-slate-500">munirudin</span>
      </div>
      <div class="flex items-center gap-2 mt-2 sm:mt-0">
        <span>REQUESTED BY:</span>
        <span class="text-slate-300 font-medium">{{ requester || 'PAK TITOYO' }}</span>
        <span class="text-slate-600">|</span>
        <span>DATE:</span>
        <span class="text-slate-300 font-mono">{{ now }}</span>
      </div>
    </div>
  </footer>
</template>