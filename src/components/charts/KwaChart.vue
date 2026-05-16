<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import VueApexCharts from 'vue3-apexcharts'

const props = defineProps<{
  labels: string[]
  series: Record<string, number[]>
}>()

const chartKey = ref(0)

watch(() => props.series, () => {
  chartKey.value++
}, { deep: true })

const series = computed(() => [
  { name: 'Packing 1', data: props.series['Packing 1'] || [] },
  { name: 'Packing 2', data: props.series['Packing 2'] || [] },
  { name: 'Packing 3', data: props.series['Packing 3'] || [] },
  { name: 'Packing 4', data: props.series['Packing 4'] || [] },
  { name: 'TOTAL', data: props.series['TOTAL'] || [] }
])

const chartOptions = computed(() => {
  return {
    chart: {
      type: 'line' as const,
      height: 300,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500
      }
    },
    colors: ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#94a3b8'],
    stroke: {
      width: [2, 2, 2, 2, 3],
      dashArray: [0, 0, 0, 0, 5],
      curve: 'smooth' as const
    },
    markers: {
      size: [0, 0, 0, 0, 0]
    },
    grid: {
      borderColor: '#334155',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
    xaxis: {
      categories: props.labels,
      labels: {
        style: {
          colors: '#94a3b8',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px'
        }
      },
      axisBorder: { color: '#334155' },
      axisTicks: { color: '#334155' }
    },
    yaxis: {
      min: 0,
      max: 100,
      tickAmount: 5,
      labels: {
        style: {
          colors: '#94a3b8',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '11px'
        },
        formatter: (val: number) => `${val}%`
      }
    },
    annotations: {
      yaxis: [{
        y: 90,
        borderColor: '#22c55e',
        borderWidth: 2,
        borderDash: [5, 5],
        label: {
          text: 'Target 90%',
          style: { color: '#22c55e', background: '#0f172a' }
        }
      }]
    },
    legend: {
      position: 'top' as const,
      horizontalAlign: 'right' as const,
      floating: true,
      offsetY: -10,
      labels: { colors: '#94a3b8' }
    },
    tooltip: {
      theme: 'dark' as const,
      y: {
        formatter: (val: number) => `${val}%`
      }
    }
  }
})
</script>

<template>
  <div class="bg-slate-800 rounded-lg border border-slate-700 p-4">
    <h3 class="text-sm font-medium text-slate-300 mb-4">% KWA per Jam</h3>
    <VueApexCharts
      :key="chartKey"
      type="line"
      height="300"
      :options="chartOptions"
      :series="series"
    />
  </div>
</template>