import type { ModelData, ModelScores } from '../types'
import { formatCost, formatLatency, formatTokens } from '../format'

const SCORE_BARS: { label: string; key: keyof ModelScores }[] = [
  { label: 'Overall', key: 'overall' },
  { label: 'Runtime', key: 'runtime' },
  { label: 'Static policy', key: 'static_policy_pass_rate' },
]

interface Props {
  name: string
  model: ModelData
  rank: number
  color: string
}

function ScoreBar({ label, value, color }: { label: string; value: number | null; color: string }) {
  const pct = value === null ? null : Math.round(value * 1000) / 10
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct ?? 0}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-14 text-right text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
        {pct === null ? 'N/A' : `${pct}%`}
      </span>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-gray-400 dark:text-gray-500">{label}</div>
      <div className="text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">{value}</div>
    </div>
  )
}

export default function ModelCard({ name, model, rank, color }: Props) {
  const { scores, usage } = model
  const passed = model.results.filter((result) => result.execution_pass).length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight break-all">{name}</h2>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full text-white shrink-0 ml-2"
          style={{ backgroundColor: color }}
        >
          #{rank}
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
        {model.config.kind} · temp {model.config.temperature} · {passed}/{model.results.length} passed
        {model.variant !== 'baseline' && <> · {model.variant}</>}
      </p>
      <div className="space-y-3">
        {SCORE_BARS.map(({ label, key }) => (
          <ScoreBar key={key} label={label} value={scores[key]} color={color} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
        <Stat label="Est. cost" value={formatCost(usage.estimated_cost_usd)} />
        <Stat label="Median latency" value={formatLatency(usage.median_latency_ms)} />
        <Stat label="Tokens" value={formatTokens(usage.total_tokens)} />
      </div>
    </div>
  )
}
