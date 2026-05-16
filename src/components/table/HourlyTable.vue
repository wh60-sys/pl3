<script setup lang="ts">
import { computed } from 'vue'
import type { HourlyRow, ShiftSummary, PackingLineSummary } from '@/types/production'
import { PACKING_LINES } from '@/types/production'
import { getCapColor, getKwaColor, formatPct, formatDos } from '@/utils/colorHelper'

const props = defineProps<{
  hourlyRows: HourlyRow[]
  shiftSummaries: ShiftSummary[]
  dailySummary: { total_dos: number; total_pct_cap: number; total_pct_kwa: number }
  getProductName: (line: string) => string
}>()

const currentHour = computed(() => {
  const now = new Date()
  return `${now.getHours().toString().padStart(2, '0')}:00`
})

const isCurrentHour = (jam: string) => jam === currentHour.value

const getShiftRows = (shift: string): ShiftSummary | undefined => {
  return props.shiftSummaries.find(s => s.shift === shift)
}

const formatProductName = (line: string) => {
  // Show "Packing 1", "Packing 2", etc instead of product code
  return line
}

// Group rows with their shift summary
const tableRows = computed(() => {
  const rows = props.hourlyRows
  const result: Array<{ type: 'hour' | 'shift' | 'total'; data?: HourlyRow; shiftName?: string }> = []
  
  // Add hours 08:00 - 15:00 with SHIFT 1
  const shift1Hours = rows.filter(r => r.jam >= '08:00' && r.jam <= '15:00')
  shift1Hours.forEach(row => {
    result.push({ type: 'hour', data: row })
  })
  result.push({ type: 'shift', shiftName: 'SHIFT 1' })
  
  // Add hours 16:00 - 23:00 with SHIFT 2
  const shift2Hours = rows.filter(r => r.jam >= '16:00' && r.jam <= '23:00')
  shift2Hours.forEach(row => {
    result.push({ type: 'hour', data: row })
  })
  result.push({ type: 'shift', shiftName: 'SHIFT 2' })
  
  // Add hours 00:00 - 07:00 with SHIFT 3
  const shift3Hours = rows.filter(r => r.jam >= '00:00' && r.jam <= '07:00')
  shift3Hours.forEach(row => {
    result.push({ type: 'hour', data: row })
  })
  result.push({ type: 'shift', shiftName: 'SHIFT 3' })
  
  // Add TOTAL DAY
  result.push({ type: 'total' })
  
  return result
})

const getLineColor = (line: string) => {
  const colors: Record<string, string> = {
    'Packing 1': 'text-red-500',
    'Packing 2': 'text-blue-500',
    'Packing 3': 'text-amber-500',
    'Packing 4': 'text-green-500'
  }
  return colors[line] || 'text-slate-400'
}
</script>

<template>
  <div class="overflow-x-auto">
    <table class="w-full text-sm border-collapse">
      <!-- Header -->
      <thead>
        <tr class="bg-slate-800">
          <th class="sticky left-0 z-30 bg-slate-800 border border-slate-700 px-2 py-2 text-center text-slate-300 font-medium w-14">
            JAM
          </th>
          <template v-for="line in PACKING_LINES" :key="line">
            <th class="border border-slate-700 px-1 py-2 text-center" colspan="3">
              <div class="text-xs font-semibold" :class="getLineColor(line)">
                {{ line }}
              </div>
            </th>
          </template>
          <th class="border border-slate-700 px-2 py-2 text-center bg-slate-700" colspan="3">
            <div class="text-xs font-semibold text-slate-300">TOTAL</div>
          </th>
        </tr>
        <tr class="bg-slate-800">
          <th class="sticky left-0 z-30 bg-slate-800 border border-slate-700 border-t-0 px-2 py-1 text-center text-slate-400 text-xs w-14"></th>
          <template v-for="line in PACKING_LINES" :key="line + '-sub'">
            <th class="border border-slate-700 border-t-0 border-l px-1 py-1 text-center text-slate-400 text-xs">Dos</th>
            <th class="border border-slate-700 border-t-0 px-1 py-1 text-center text-slate-400 text-xs">%Cap</th>
            <th class="border border-slate-700 border-t-0 px-1 py-1 text-center text-slate-400 text-xs">%Kwa</th>
          </template>
          <th class="border border-slate-700 border-t-0 border-l px-1 py-1 text-center text-slate-400 text-xs bg-slate-700">Dos</th>
          <th class="border border-slate-700 border-t-0 px-1 py-1 text-center text-slate-400 text-xs bg-slate-700">%Cap</th>
          <th class="border border-slate-700 border-t-0 px-1 py-1 text-center text-slate-400 text-xs bg-slate-700">%Kwa</th>
        </tr>
      </thead>
      
      <tbody>
        <template v-for="(row, index) in tableRows" :key="index">
          <!-- Hour Row -->
          <tr 
            v-if="row.type === 'hour' && row.data"
            class="font-mono"
            :class="{
              'border-l-2 border-l-blue-500': isCurrentHour(row.data.jam),
              'bg-slate-800/50': !isCurrentHour(row.data.jam)
            }"
          >
            <td class="sticky left-0 z-20 bg-slate-900 border border-slate-700 px-2 py-1.5 text-center text-slate-300">
              {{ row.data.jam }}
            </td>
            <template v-for="line in PACKING_LINES" :key="line">
              <td class="border border-slate-700 px-1 py-1.5 text-center border-l">
                {{ formatDos(row.data.packingData[line]?.dos || 0) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-1.5 text-center"
                :class="getCapColor(row.data.packingData[line]?.pct_cap || 0)"
              >
                {{ formatPct(row.data.packingData[line]?.pct_cap || 0) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-1.5 text-center"
                :class="getKwaColor(row.data.packingData[line]?.pct_kwa || 0)"
              >
                {{ formatPct(row.data.packingData[line]?.pct_kwa || 0) }}
              </td>
            </template>
            <td class="border border-slate-700 px-1 py-1.5 text-center border-l bg-slate-800 font-medium">
              {{ formatDos(row.data.total_dos) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-1.5 text-center font-medium"
              :class="getCapColor(row.data.total_pct_cap)"
            >
              {{ formatPct(row.data.total_pct_cap) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-1.5 text-center font-medium"
              :class="getKwaColor(row.data.total_pct_kwa)"
            >
              {{ formatPct(row.data.total_pct_kwa) }}
            </td>
          </tr>

          <!-- Shift Summary Row -->
          <tr 
            v-if="row.type === 'shift'"
            class="bg-blue-900/20 font-medium"
          >
            <td class="sticky left-0 z-20 bg-blue-900/30 border border-slate-700 px-2 py-2 text-center text-blue-300 font-semibold">
              {{ row.shiftName }}
            </td>
            <template v-for="line in PACKING_LINES" :key="line">
              <td class="border border-slate-700 px-1 py-2 text-center border-l bg-blue-900/10">
                {{ formatDos(getShiftRows(row.shiftName!)?.packingLines.find((p: PackingLineSummary) => p.line === line)?.dos_total || 0) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-2 text-center"
                :class="getCapColor(getShiftRows(row.shiftName!)?.packingLines.find((p: PackingLineSummary) => p.line === line)?.pct_cap_avg || 0)"
              >
                {{ formatPct(getShiftRows(row.shiftName!)?.packingLines.find((p: PackingLineSummary) => p.line === line)?.pct_cap_avg || 0) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-2 text-center"
                :class="getKwaColor(getShiftRows(row.shiftName!)?.packingLines.find((p: PackingLineSummary) => p.line === line)?.pct_kwa_avg || 0)"
              >
                {{ formatPct(getShiftRows(row.shiftName!)?.packingLines.find((p: PackingLineSummary) => p.line === line)?.pct_kwa_avg || 0) }}
              </td>
            </template>
            <td class="border border-slate-700 px-1 py-2 text-center border-l bg-blue-900/20 font-bold">
              {{ formatDos(getShiftRows(row.shiftName!)?.total_dos || 0) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-2 text-center font-bold"
              :class="getCapColor(getShiftRows(row.shiftName!)?.total_pct_cap || 0)"
            >
              {{ formatPct(getShiftRows(row.shiftName!)?.total_pct_cap || 0) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-2 text-center font-bold"
              :class="getKwaColor(getShiftRows(row.shiftName!)?.total_pct_kwa || 0)"
            >
              {{ formatPct(getShiftRows(row.shiftName!)?.total_pct_kwa || 0) }}
            </td>
          </tr>

          <!-- TOTAL DAY Row -->
          <tr 
            v-if="row.type === 'total'"
            class="bg-amber-900/30 font-bold"
          >
            <td class="sticky left-0 z-20 bg-amber-900/40 border border-slate-700 px-2 py-3 text-center text-amber-400 font-semibold">
              TOTAL DAY
            </td>
            <template v-for="line in PACKING_LINES" :key="line">
              <td class="border border-slate-700 px-1 py-3 text-center border-l bg-amber-900/20">
                {{ formatDos(dailySummary.total_dos / 4) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-3 text-center"
                :class="getCapColor(dailySummary.total_pct_cap)"
              >
                {{ formatPct(dailySummary.total_pct_cap) }}
              </td>
              <td 
                class="border border-slate-700 px-1 py-3 text-center"
                :class="getKwaColor(dailySummary.total_pct_kwa)"
              >
                {{ formatPct(dailySummary.total_pct_kwa) }}
              </td>
            </template>
            <td class="border border-slate-700 px-1 py-3 text-center border-l bg-amber-900/30 text-lg">
              {{ formatDos(dailySummary.total_dos) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-3 text-center text-lg"
              :class="getCapColor(dailySummary.total_pct_cap)"
            >
              {{ formatPct(dailySummary.total_pct_cap) }}
            </td>
            <td 
              class="border border-slate-700 px-1 py-3 text-center text-lg"
              :class="getKwaColor(dailySummary.total_pct_kwa)"
            >
              {{ formatPct(dailySummary.total_pct_kwa) }}
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>