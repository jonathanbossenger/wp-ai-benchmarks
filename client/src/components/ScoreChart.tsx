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
import { useTheme } from '../context/theme'

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
  const { isDark } = useTheme()
  const modelEntries = Object.entries(models)

  const data = SCORE_CATEGORIES.map(({ key, label }) => {
    const entry: Record<string, string | number> = { category: label }
    modelEntries.forEach(([name, model]) => {
      entry[name] = Math.round(model.scores[key] * 100)
    })
    return entry
  })

  const gridColor = isDark ? '#374151' : '#f3f4f6'
  const tickColor = isDark ? '#6b7280' : '#9ca3af'
  const tooltipStyle = isDark
    ? { backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', color: '#f9fafb' }
    : { borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Score Comparison</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
          <XAxis dataKey="category" tick={{ fontSize: 13, fill: tickColor }} axisLine={false} tickLine={false} />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fontSize: 12, fill: tickColor }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            formatter={(value) => [`${value}%`]}
            contentStyle={tooltipStyle}
          />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '16px', color: isDark ? '#d1d5db' : '#374151' }} />
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
