import { computed, watch } from 'vue'
import { useProductionStore } from '@/stores/productionStore'
import { useGoogleSheets } from './useGoogleSheets'
import type { HourlyRow, ShiftSummary } from '@/types/production'

export function useProductionData() {
  const store = useProductionStore()
  const { data, loading, error, lastUpdated, countdown, fetchData, isLoading } = useGoogleSheets()

  // Sync data to store
  watch(data, (newData) => {
    if (newData.length > 0) {
      store.setRecords(newData)
    }
  }, { immediate: true })

  const hourlyRows = computed<HourlyRow[]>(() => store.hourlyRows)
  const shiftSummaries = computed<ShiftSummary[]>(() => store.shiftSummaries)
  const dailySummary = computed(() => store.dailySummary)
  const activeShift = computed(() => store.activeShift)
  const selectedDate = computed(() => store.selectedDate)

  const chartData = computed(() => {
    const rows = hourlyRows.value
    const labels = rows.map(r => r.jam)
    
    const series: Record<string, number[]> = {
      'Packing 1': [],
      'Packing 2': [],
      'Packing 3': [],
      'Packing 4': [],
      'TOTAL': []
    }

    rows.forEach(row => {
      series['Packing 1'].push(row.packingData['Packing 1']?.pct_cap || 0)
      series['Packing 2'].push(row.packingData['Packing 2']?.pct_cap || 0)
      series['Packing 3'].push(row.packingData['Packing 3']?.pct_cap || 0)
      series['Packing 4'].push(row.packingData['Packing 4']?.pct_cap || 0)
      series['TOTAL'].push(row.total_pct_cap)
    })

    return { labels, series }
  })

  const kwaChartData = computed(() => {
    const rows = hourlyRows.value
    const labels = rows.map(r => r.jam)
    
    const series: Record<string, number[]> = {
      'Packing 1': [],
      'Packing 2': [],
      'Packing 3': [],
      'Packing 4': [],
      'TOTAL': []
    }

    rows.forEach(row => {
      series['Packing 1'].push(row.packingData['Packing 1']?.pct_kwa || 0)
      series['Packing 2'].push(row.packingData['Packing 2']?.pct_kwa || 0)
      series['Packing 3'].push(row.packingData['Packing 3']?.pct_kwa || 0)
      series['Packing 4'].push(row.packingData['Packing 4']?.pct_kwa || 0)
      series['TOTAL'].push(row.total_pct_kwa)
    })

    return { labels, series }
  })

  return {
    loading,
    error,
    lastUpdated,
    countdown,
    fetchData,
    isLoading,
    hourlyRows,
    shiftSummaries,
    dailySummary,
    activeShift,
    selectedDate,
    chartData,
    kwaChartData,
    setSelectedDate: store.setSelectedDate
  }
}