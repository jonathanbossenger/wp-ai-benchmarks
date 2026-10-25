import { useMemo } from 'react'
import type { ModelData } from '../types'
import { useTheme } from '../context/theme'

interface Props {
  models: [string, ModelData][]
}

interface CategoryRow {
  category: string
  tests: number
  passRates: (number | null)[]
}

// Red at 0%, amber around 50%, green at 100%.
function cellColor(rate: number, isDark: boolean): string {
  const hue = Math.round(rate * 120)
  return isDark ? `hsl(${hue} 55% 28%)` : `hsl(${hue} 70% 88%)`
}

export default function CategoryBreakdown({ models }: Props) {
  const { isDark } = useTheme()

  const rows = useMemo<CategoryRow[]>(() => {
    const tests = new Map<string, Set<string>>()
    const totals = models.map(() => new Map<string, { passed: number; total: number }>())

    models.forEach(([, model], modelIndex) => {
      for (const result of model.results) {
        if (!tests.has(result.category)) tests.set(result.category, new Set())
        tests.get(result.category)!.add(result.test_id)
        const tally = totals[modelIndex].get(result.category) ?? { passed: 0, total: 0 }
        tally.total += 1
        if (result.execution_pass) tally.passed += 1
        totals[modelIndex].set(result.category, tally)
      }
    })

    return [...tests.entries()]
      .map(([category, ids]) => ({
        category,
        tests: ids.size,
        passRates: totals.map((modelTotals) => {
          const tally = modelTotals.get(category)
          return tally ? tally.passed / tally.total : null
        }),
      }))
      .sort((a, b) => a.category.localeCompare(b.category))
  }, [models])

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Pass Rate by Category</h2>
      <p className="text-sm text-gray-400 dark:text-gray-500 mb-6">
        Share of execution tests in each category that passed strictly (runtime assertions and static policy).
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0.5">
          <thead>
            <tr>
              <th className="text-left py-2 px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider align-bottom">
                Category
              </th>
              <th className="text-right py-2 px-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider align-bottom">
                Tests
              </th>
              {models.map(([name]) => (
                <th
                  key={name}
                  title={name}
                  className="py-2 px-1 text-xs font-medium text-gray-500 dark:text-gray-400 align-bottom whitespace-nowrap"
                >
                  <span className="inline-block [writing-mode:vertical-rl] rotate-180 max-h-40 overflow-hidden text-ellipsis">
                    {name}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.category}>
                <td className="py-1.5 px-2 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {row.category}
                </td>
                <td className="py-1.5 px-2 text-right text-xs text-gray-400 dark:text-gray-500 tabular-nums">
                  {row.tests}
                </td>
                {row.passRates.map((rate, index) => (
                  <td
                    key={models[index][0]}
                    title={`${models[index][0]} · ${row.category}`}
                    className="py-1.5 px-2 text-center text-xs font-semibold text-gray-800 dark:text-gray-100 tabular-nums rounded min-w-12"
                    style={rate === null ? undefined : { backgroundColor: cellColor(rate, isDark) }}
                  >
                    {rate === null ? '–' : Math.round(rate * 100)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
