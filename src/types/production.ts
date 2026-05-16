export interface ProductionRecord {
  date: string
  shift: 'SHIFT 1' | 'SHIFT 2' | 'SHIFT 3'
  jam: string
  packing_line: 'Packing 1' | 'Packing 2' | 'Packing 3' | 'Packing 4'
  product_name: string
  dos_target: number
  dos_actual: number
  pct_cap: number
  pct_kwa: number
}

export interface PackingLineSummary {
  line: string
  product_name: string
  dos_total: number
  pct_cap_avg: number
  pct_kwa_avg: number
}

export interface ShiftSummary {
  shift: string
  packingLines: PackingLineSummary[]
  total_dos: number
  total_pct_cap: number
  total_pct_kwa: number
}

export interface HourlyRow {
  jam: string
  shift: string
  packingData: {
    [line: string]: {
      dos: number
      pct_cap: number
      pct_kwa: number
    }
  }
  total_dos: number
  total_pct_cap: number
  total_pct_kwa: number
}

export type PackingLine = 'Packing 1' | 'Packing 2' | 'Packing 3' | 'Packing 4'

export const PACKING_LINES: PackingLine[] = ['Packing 1', 'Packing 2', 'Packing 3', 'Packing 4']

export const JAM_LIST = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
  '00:00', '01:00', '02:00', '03:00', '04:00', '05:00', '06:00', '07:00'
]

export const SHIFT_MAP: Record<string, string> = {
  '08:00': 'SHIFT 1', '09:00': 'SHIFT 1', '10:00': 'SHIFT 1', '11:00': 'SHIFT 1',
  '12:00': 'SHIFT 1', '13:00': 'SHIFT 1', '14:00': 'SHIFT 1', '15:00': 'SHIFT 1',
  '16:00': 'SHIFT 2', '17:00': 'SHIFT 2', '18:00': 'SHIFT 2', '19:00': 'SHIFT 2',
  '20:00': 'SHIFT 2', '21:00': 'SHIFT 2', '22:00': 'SHIFT 2', '23:00': 'SHIFT 2',
  '00:00': 'SHIFT 3', '01:00': 'SHIFT 3', '02:00': 'SHIFT 3', '03:00': 'SHIFT 3',
  '04:00': 'SHIFT 3', '05:00': 'SHIFT 3', '06:00': 'SHIFT 3', '07:00': 'SHIFT 3',
}