export function formatPercent(value: number | null, digits = 1): string {
  return value === null ? 'N/A' : `${(value * 100).toFixed(digits)}%`
}

export function formatCost(value: number | null): string {
  if (value === null) return 'N/A'
  return value < 0.01 ? `$${value.toFixed(4)}` : `$${value.toFixed(2)}`
}

export function formatLatency(value: number | null): string {
  if (value === null) return 'N/A'
  return value < 1000 ? `${Math.round(value)}ms` : `${(value / 1000).toFixed(1)}s`
}

export function formatTokens(value: number | null): string {
  if (value === null) return 'N/A'
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)}M`
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value)
}
