import type { ModelData, ModelScores } from '../types'

const SCORE_BARS: { label: string; key: keyof ModelScores }[] = [
  { label: 'Overall', key: 'overall' },
  { label: 'Knowledge', key: 'knowledge' },
  { label: 'Correctness', key: 'correctness' },
  { label: 'Quality', key: 'quality' },
]

interface Props {
  name: string
  model: ModelData
  color: string
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const pct = Math.round(value * 100)
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-sm text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="w-10 text-right text-sm font-semibold text-gray-700 dark:text-gray-200 tabular-nums">
        {pct}%
      </span>
    </div>
  )
}

export default function ModelCard({ name, model, color }: Props) {
  const { scores } = model
  const knowledgeCount = model.results.filter((result) => result.type === 'knowledge').length
  const executionCount = model.results.filter((result) => result.type === 'execution').length

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex items-start justify-between mb-1">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{name}</h2>
        <span
          className="text-xs font-bold px-2 py-1 rounded-full text-white shrink-0 ml-2"
          style={{ backgroundColor: color }}
        >
          #{Math.round(scores.overall * 100)}%
        </span>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mb-5">
        {model.config.kind} · temp {model.config.temperature} ·{' '}
        {knowledgeCount} knowledge · {executionCount} execution
      </p>
      <div className="space-y-3">
        {SCORE_BARS.map(({ label, key }) => (
          <ScoreBar key={key} label={label} value={scores[key]} color={color} />
        ))}
      </div>
    </div>
  )
}
