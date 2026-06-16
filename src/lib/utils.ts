import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date.includes('T') ? date : date + 'T00:00:00') : date
  return d.toLocaleDateString('es-CL', opts ?? { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function monthName(month: number): string {
  const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
  return months[month - 1] ?? '-'
}

export function ordinal(n: number): string {
  return `${n}°`
}

export function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase() ?? '').join('')
}

export function formatHandicap(hcp: number | null | undefined): string {
  if (hcp == null) return '-'
  return hcp > 0 ? `+${hcp}` : String(hcp)
}

export function calculateNetScore(gross: number, handicap: number): number {
  return gross - handicap
}

export function pluralize(n: number, s: string, p: string): string {
  return `${n} ${n === 1 ? s : p}`
}

export function getPointsForPosition(position: number, config: { positions: number[]; participation: number }): number {
  if (position <= 0) return 0
  return config.positions[position - 1] ?? config.participation
}
