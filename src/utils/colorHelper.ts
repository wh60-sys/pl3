export function getCapColor(value: number): string {
  if (value === 0) return ''
  if (value >= 100) return 'bg-green-500 text-white'
  if (value >= 85) return 'bg-amber-500 text-white'
  return 'bg-red-500 text-white'
}

export function getKwaColor(value: number): string {
  if (value === 0) return ''
  if (value >= 90) return 'bg-green-500 text-white'
  if (value >= 80) return 'bg-amber-500 text-white'
  return 'bg-red-500 text-white'
}

export function formatPct(value: number): string {
  return value === 0 ? '-' : `${value}%`
}

export function formatDos(value: number): string {
  return value === 0 ? '-' : value.toLocaleString('id-ID')
}

export function getKpiColor(value: number, type: 'cap' | 'kwa' | 'dos'): string {
  if (type === 'dos') {
    if (value >= 10000) return 'text-green-400'
    if (value >= 5000) return 'text-amber-400'
    return 'text-red-400'
  }
  
  if (type === 'cap') {
    if (value >= 100) return 'text-green-400'
    if (value >= 85) return 'text-amber-400'
    return 'text-red-400'
  }
  
  if (type === 'kwa') {
    if (value >= 90) return 'text-green-400'
    if (value >= 80) return 'text-amber-400'
    return 'text-red-400'
  }
  
  return 'text-slate-100'
}

export function getLineColor(line: string): string {
  const colors: Record<string, string> = {
    'Packing 1': '#ef4444',
    'Packing 2': '#3b82f6',
    'Packing 3': '#f59e0b',
    'Packing 4': '#22c55e',
    'TOTAL': '#94a3b8',
  }
  return colors[line] || '#94a3b8'
}