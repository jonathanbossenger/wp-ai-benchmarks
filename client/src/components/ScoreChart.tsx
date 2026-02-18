import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { ModelData } from '../types'

interface Props {
  models: Record<string, ModelData>
  colors: string[]
}

const SCORE_CATEGORIES = [
  { key: 'overall', label: 'Overall' },
  { key: 'knowledge', label: 'Knowledge' },
  { key: 'correctness', label: 'Correctness' },
  { key: 'quality', label: 'Quality' },
] as const

export default function ScoreChart({ models, colors }: Props) {
  const modelEntries = Object.entries(models)

  const data = SCORE_CATEGORIES.map(({ key, label }) => {
    const entry: Record<string, string | number> = { category: label }
    modelEntries.forEach(([name, model]) => {
      entry[name] = Math.round(model.scores[key] * 100)
    })
    return entry
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6">Score Comparison</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="category" tick={{ fontSize: 13, fill: '#6b7280' }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value}%`]}
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px' }} />
          {modelEntries.map(([name], i) => (
            <Bar
              key={name}
              dataKey={name}
              fill={colors[i % colors.length]}
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
