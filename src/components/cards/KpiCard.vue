<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  label: string
  value: number | string
  type: 'dos' | 'pct' | 'text'
  unit?: string
}>()

const displayValue = ref<number | string>(props.value)

// Animate counter on value change
watch(() => props.value, (newVal, oldVal) => {
  if (typeof newVal === 'number' && typeof oldVal === 'number') {
    const duration = 500
    const startTime = performance.now()
    const startVal = oldVal
    const endVal = newVal
    
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      displayValue.value = Math.round(startVal + (endVal - startVal) * eased)
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  } else {
    displayValue.value = newVal
  }
}, { immediate: true })

const formattedValue = computed(() => {
  if (props.type === 'dos') {
    const num = typeof displayValue.value === 'number' ? displayValue.value : 0
    return num === 0 ? '-' : num.toLocaleString('id-ID')
  }
  if (props.type === 'pct') {
    const num = typeof displayValue.value === 'number' ? displayValue.value : 0
    return num === 0 ? '-' : `${num}%`
  }
  return displayValue.value
})

const colorClass = computed(() => {
  if (props.type === 'dos') {
    const val = typeof props.value === 'number' ? props.value : 0
    if (val >= 10000) return 'text-green-400'
    if (val >= 5000) return 'text-amber-400'
    return 'text-red-400'
  }
  if (props.type === 'pct') {
    const val = typeof props.value === 'number' ? props.value : 0
    if (val >= 100) return 'text-green-400'
    if (val >= 85) return 'text-amber-400'
    return 'text-red-400'
  }
  return 'text-slate-100'
})

const bgClass = computed(() => {
  if (props.type === 'dos') {
    const val = typeof props.value === 'number' ? props.value : 0
    if (val >= 10000) return 'bg-green-500/10 border-green-500/30'
    if (val >= 5000) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }
  if (props.type === 'pct') {
    const val = typeof props.value === 'number' ? props.value : 0
    if (val >= 100) return 'bg-green-500/10 border-green-500/30'
    if (val >= 85) return 'bg-amber-500/10 border-amber-500/30'
    return 'bg-red-500/10 border-red-500/30'
  }
  return 'bg-slate-800 border-slate-700'
})
</script>

<template>
  <div 
    class="rounded-lg border px-4 py-3 transition-all"
    :class="bgClass"
  >
    <div class="text-3xl font-bold font-mono" :class="colorClass">
      {{ formattedValue }}
    </div>
    <div class="text-xs text-slate-400 uppercase tracking-wider mt-1">
      {{ label }}
    </div>
  </div>
</template>