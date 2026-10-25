import rawData from '../../results/data.json'
import type { BenchmarkData } from './types'
import { ThemeProvider } from './context/theme'
import Header from './components/Header'
import ModelCard from './components/ModelCard'
import ScoreChart from './components/ScoreChart'
import CategoryBreakdown from './components/CategoryBreakdown'
import ResultsTable from './components/ResultsTable'

const data = rawData as BenchmarkData
// Rank models by overall score (the strict execution pass rate).
const modelEntries = Object.entries(data.models).sort(
  ([, a], [, b]) => b.scores.overall - a.scores.overall,
)

const COLOR_PALETTE = [
  '#3858e9', '#00b9eb', '#f59e0b', '#10b981',
  '#f43f5e', '#8b5cf6', '#f97316', '#06b6d4',
  '#84cc16', '#ec4899',
]

function getModelColors(count: number): string[] {
  return Array.from({ length: count }, (_, index) =>
    index < COLOR_PALETTE.length
      ? COLOR_PALETTE[index]
      : `hsl(${(index * 360) / count}, 65%, 55%)`,
  )
}

const modelColors = getModelColors(modelEntries.length)

const cardGridClass =
  modelEntries.length === 1
    ? 'grid-cols-1 max-w-lg mx-auto'
    : modelEntries.length <= 2
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header metadata={data.metadata} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
          <div className={`grid ${cardGridClass} gap-6`}>
            {modelEntries.map(([name, model], index) => (
              <ModelCard
                key={name}
                name={name}
                model={model}
                rank={index + 1}
                color={modelColors[index]}
              />
            ))}
          </div>
          <ScoreChart models={modelEntries} colors={modelColors} />
          <CategoryBreakdown models={modelEntries} />
          <ResultsTable models={modelEntries} />
        </main>
      </div>
    </ThemeProvider>
  )
}

export default App
