<script setup lang="ts">
import { computed } from 'vue'
import dayjs from 'dayjs'

const props = defineProps<{
  selectedDate: string
  lastUpdated: Date | null
  countdown: number
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'update:date', value: string): void
  (e: 'refresh'): void
}>()

const formattedLastUpdate = computed(() => {
  if (!props.lastUpdated) return '-'
  return dayjs(props.lastUpdated).format('HH:mm:ss')
})

const formattedDate = computed({
  get: () => props.selectedDate,
  set: (value: string) => emit('update:date', value)
})

const today = computed(() => new Date().toISOString().slice(0, 10))
</script>

<template>
  <header class="bg-slate-900 border-b border-slate-700 px-6 py-4">
    <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <!-- Left: Title and Badge -->
      <div class="flex items-center gap-4">
        <h1 class="text-2xl font-bold text-slate-100 font-mono">Monitor PL3</h1>
        <div class="flex items-center gap-2">
          <span class="relative flex h-3 w-3">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span class="text-xs font-medium text-green-400 uppercase tracking-wider">LIVE</span>
        </div>
      </div>

      <!-- Right: Controls -->
      <div class="flex flex-wrap items-center gap-4">
        <!-- Date Picker -->
        <div class="flex items-center gap-2">
          <label class="text-sm text-slate-400">Date:</label>
          <input
            type="date"
            v-model="formattedDate"
            :max="today"
            class="bg-slate-800 border border-slate-600 rounded px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
          />
        </div>

        <!-- Countdown -->
        <div class="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-mono text-slate-300">
            Refresh in: <span class="text-blue-400">{{ countdown.toString().padStart(2, '0') }}</span>
          </span>
        </div>

        <!-- Last Update -->
        <div class="text-sm text-slate-400">
          Last: <span class="text-slate-300 font-mono">{{ formattedLastUpdate }}</span>
        </div>

        <!-- Refresh Button -->
        <button
          @click="emit('refresh')"
          :disabled="loading"
          class="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed px-4 py-1.5 rounded text-sm font-medium text-white transition-colors"
        >
          <svg class="w-4 h-4" :class="{ 'animate-spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>
    </div>
  </header>
</template>