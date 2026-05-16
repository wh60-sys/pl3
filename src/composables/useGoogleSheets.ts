import { ref, computed } from 'vue'
import Papa from 'papaparse'
import { useIntervalFn } from '@vueuse/core'
import type { ProductionRecord } from '@/types/production'

const SHEET_URL = 'https://docs.google.com/spreadsheets/d/1O_s4A67NkLvI9Asz1CZszPNEAnQliIWV91UbTut7-Q8/export?format=csv&gid=0'

export function useGoogleSheets() {
  const data = ref<ProductionRecord[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const lastUpdated = ref<Date | null>(null)
  const countdown = ref(60)

  const fetchData = async () => {
    loading.value = true
    error.value = null
    
    try {
      // Add cache busting to avoid cached response
      const url = `${SHEET_URL}&cachebust=${Date.now()}`
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Accept': 'text/csv,application/csv,text/plain,*/*',
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const text = await response.text()
      
      // Check if response is HTML (error page) instead of CSV
      if (text.includes('<!DOCTYPE html>') || text.includes('<HTML>')) {
        console.warn('Received HTML instead of CSV - may need to share sheet publicly')
        throw new Error('Sheet not publicly shared or invalid response')
      }
      
      const result = Papa.parse(text, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      })
      
      // Transform the data to match our types
      const rawData = result.data as Record<string, string>[]
      data.value = rawData.map((row) => ({
        date: String(row.date || ''),
        shift: (String(row.shift || 'SHIFT 1') || 'SHIFT 1') as ProductionRecord['shift'],
        jam: String(row.jam || '08:00'),
        packing_line: (String(row.packing_line || 'Packing 1') || 'Packing 1') as ProductionRecord['packing_line'],
        product_name: String(row.product_name || ''),
        dos_target: Number(row.dos_target) || 0,
        dos_actual: Number(row.dos_actual) || 0,
        pct_cap: Number(row.pct_cap) || 0,
        pct_kwa: Number(row.pct_kwa) || 0,
      }))
      
      lastUpdated.value = new Date()
      countdown.value = 60
      
      console.log(`📊 Fetched ${data.value.length} rows from Google Sheets`)
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Gagal mengambil data'
      error.value = errMsg
      console.error('Fetch error:', errMsg)
    } finally {
      loading.value = false
    }
  }

  // Auto countdown every second
  useIntervalFn(() => {
    if (countdown.value > 0) {
      countdown.value--
    } else {
      fetchData()
    }
  }, 1000)

  // Initial fetch
  fetchData()

  return { 
    data, 
    loading, 
    error, 
    lastUpdated, 
    countdown, 
    fetchData,
    isLoading: computed(() => loading.value)
  }
}