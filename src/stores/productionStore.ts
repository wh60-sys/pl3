import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import type { ProductionRecord, HourlyRow, PackingLine, ShiftSummary } from '@/types/production'
import { PACKING_LINES, JAM_LIST, SHIFT_MAP } from '@/types/production'

export const useProductionStore = defineStore('production', () => {
  const records = ref<ProductionRecord[]>([])
  const selectedDate = ref<string>(new Date().toISOString().slice(0, 10))

  // Update selectedDate when records change - prioritize today's date
  watch(records, () => {
    const today = new Date().toISOString().slice(0, 10)
    const dates = [...new Set(records.value.map((r: ProductionRecord) => r.date))]
    
    // If there's data for today, use today
    if (dates.includes(today)) {
      selectedDate.value = today
    } else if (dates.length > 0) {
      // Otherwise use the most recent date
      const sortedDates = dates.sort().reverse()
      selectedDate.value = sortedDates[0]
    }
  })

  const filteredByDate = computed(() =>
    records.value.filter((r: ProductionRecord) => r.date === selectedDate.value)
  )

  const hourlyRows = computed<HourlyRow[]>(() => {
    return JAM_LIST.map((jam: string) => {
      const packingData: HourlyRow['packingData'] = {}
      let total_dos = 0
      let total_cap_sum = 0
      let total_kwa_sum = 0
      let count = 0

      PACKING_LINES.forEach((line: string) => {
        const record = filteredByDate.value.find(
          (r: ProductionRecord) => r.jam === jam && r.packing_line === line
        )
        packingData[line] = {
          dos: record?.dos_actual ?? 0,
          pct_cap: record?.pct_cap ?? 0,
          pct_kwa: record?.pct_kwa ?? 0
        }
        if (record && record.dos_actual > 0) {
          total_dos += record.dos_actual
          total_cap_sum += record.pct_cap
          total_kwa_sum += record.pct_kwa
          count++
        }
      })

      return {
        jam,
        shift: SHIFT_MAP[jam] || 'SHIFT 1',
        packingData,
        total_dos,
        total_pct_cap: count > 0 ? Math.round(total_cap_sum / count) : 0,
        total_pct_kwa: count > 0 ? Math.round(total_kwa_sum / count) : 0
      }
    })
  })

  const shiftSummaries = computed<ShiftSummary[]>(() => {
    const shifts: ShiftSummary[] = []
    
    for (const shiftName of ['SHIFT 1', 'SHIFT 2', 'SHIFT 3']) {
      const shiftRows = hourlyRows.value.filter(r => r.shift === shiftName)
      const packingLinesData: Record<string, { dos_total: number; pct_cap_sum: number; pct_kwa_sum: number; count: number }> = {}
      
      PACKING_LINES.forEach((line: string) => {
        packingLinesData[line] = { dos_total: 0, pct_cap_sum: 0, pct_kwa_sum: 0, count: 0 }
      })

      let total_dos = 0
      let total_cap_sum = 0
      let total_kwa_sum = 0
      let count = 0

      shiftRows.forEach((row: HourlyRow) => {
        PACKING_LINES.forEach((line: string) => {
          const data = row.packingData[line]
          if (data.dos > 0) {
            packingLinesData[line].dos_total += data.dos
            packingLinesData[line].pct_cap_sum += data.pct_cap
            packingLinesData[line].pct_kwa_sum += data.pct_kwa
            packingLinesData[line].count++
            total_dos += data.dos
            total_cap_sum += data.pct_cap
            total_kwa_sum += data.pct_kwa
            count++
          }
        })
      })

      const packingLines = PACKING_LINES.map((line: string) => {
        const d = packingLinesData[line]
        return {
          line,
          product_name: filteredByDate.value.find((r: ProductionRecord) => r.shift === shiftName && r.packing_line === line)?.product_name || '',
          dos_total: d.dos_total,
          pct_cap_avg: d.count > 0 ? Math.round(d.pct_cap_sum / d.count) : 0,
          pct_kwa_avg: d.count > 0 ? Math.round(d.pct_kwa_sum / d.count) : 0
        }
      })

      shifts.push({
        shift: shiftName,
        packingLines,
        total_dos,
        total_pct_cap: count > 0 ? Math.round(total_cap_sum / count) : 0,
        total_pct_kwa: count > 0 ? Math.round(total_kwa_sum / count) : 0
      })
    }

    return shifts
  })

  const dailySummary = computed(() => {
    let total_dos = 0
    let total_cap_sum = 0
    let total_kwa_sum = 0
    let count = 0

    hourlyRows.value.forEach((row: HourlyRow) => {
      PACKING_LINES.forEach((line: string) => {
        const data = row.packingData[line]
        if (data.dos > 0) {
          total_dos += data.dos
          total_cap_sum += data.pct_cap
          total_kwa_sum += data.pct_kwa
          count++
        }
      })
    })

    return {
      total_dos,
      total_pct_cap: count > 0 ? Math.round(total_cap_sum / count) : 0,
      total_pct_kwa: count > 0 ? Math.round(total_kwa_sum / count) : 0
    }
  })

  const activeShift = computed(() => {
    const now = new Date()
    const hour = now.getHours()
    if (hour >= 8 && hour <= 15) return 'SHIFT 1'
    if (hour >= 16 && hour <= 23) return 'SHIFT 2'
    return 'SHIFT 3'
  })

  const getProductName = (line: PackingLine): string => {
    const record = filteredByDate.value.find((r: ProductionRecord) => r.packing_line === line)
    return record?.product_name || ''
  }

  const setRecords = (newRecords: ProductionRecord[]) => {
    records.value = newRecords
  }

  const setSelectedDate = (date: string) => {
    selectedDate.value = date
  }

  return {
    records,
    selectedDate,
    filteredByDate,
    hourlyRows,
    shiftSummaries,
    dailySummary,
    activeShift,
    getProductName,
    setRecords,
    setSelectedDate,
    packingLines: PACKING_LINES,
    jamList: JAM_LIST
  }
})