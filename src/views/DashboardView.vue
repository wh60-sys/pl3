<script setup lang="ts">
import { computed } from 'vue'
import { useProductionData } from '@/composables/useProductionData'
import { useProductionStore } from '@/stores/productionStore'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import KpiCard from '@/components/cards/KpiCard.vue'
import AchievementChart from '@/components/charts/AchievementChart.vue'
import KwaChart from '@/components/charts/KwaChart.vue'
import HourlyTable from '@/components/table/HourlyTable.vue'

const store = useProductionStore()
const { 
  loading, 
  error, 
  lastUpdated, 
  countdown, 
  fetchData,
  hourlyRows, 
  shiftSummaries, 
  dailySummary, 
  activeShift,
  selectedDate,
  chartData,
  kwaChartData
} = useProductionData()

const handleDateChange = (date: string) => {
  store.setSelectedDate(date)
}

const getProductName = (line: string) => {
  return store.getProductName(line as any)
}
</script>

<template>
  <div class="min-h-screen bg-slate-900 flex flex-col">
    <!-- Header -->
    <AppHeader
      :selected-date="selectedDate"
      :last-updated="lastUpdated"
      :countdown="countdown"
      :loading="loading"
      @update:date="handleDateChange"
      @refresh="fetchData"
    />

    <!-- Error Toast -->
    <div v-if="error" class="bg-red-500/90 text-white px-6 py-2 text-sm flex items-center gap-2">
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      {{ error }}
    </div>

    <!-- Main Content -->
    <main class="flex-1 p-4 lg:p-6 space-y-6">
      <!-- KPI Cards -->
      <section>
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Total DOS"
            :value="dailySummary.total_dos"
            type="dos"
          />
          <KpiCard
            label="% Achievement"
            :value="dailySummary.total_pct_cap"
            type="pct"
          />
          <KpiCard
            label="% KWA"
            :value="dailySummary.total_pct_kwa"
            type="pct"
          />
          <KpiCard
            label="Active Shift"
            :value="activeShift"
            type="text"
          />
        </div>
      </section>

      <!-- Charts -->
      <section>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AchievementChart
            :labels="chartData.labels"
            :series="chartData.series"
          />
          <KwaChart
            :labels="kwaChartData.labels"
            :series="kwaChartData.series"
          />
        </div>
      </section>

      <!-- Table -->
      <section>
        <HourlyTable
          :hourly-rows="hourlyRows"
          :shift-summaries="shiftSummaries"
          :daily-summary="dailySummary"
          :get-product-name="getProductName"
        />
      </section>
    </main>

    <!-- Footer -->
    <AppFooter requester="PAK TITOYO" />
  </div>
</template>