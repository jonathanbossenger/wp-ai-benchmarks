import rawData from './data/sample.json'
import type { BenchmarkData } from './types'
import Header from './components/Header'
import ModelCard from './components/ModelCard'
import ScoreChart from './components/ScoreChart'
import ResultsTable from './components/ResultsTable'

const data = rawData as BenchmarkData

const MODEL_COLORS = ['#3858e9', '#00b9eb']

function App() {
  const modelEntries = Object.entries(data.models)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header metadata={data.metadata} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {modelEntries.map(([name, model], i) => (
            <ModelCard
              key={name}
              name={name}
              model={model}
              color={MODEL_COLORS[i % MODEL_COLORS.length]}
            />
          ))}
        </div>
        <ScoreChart models={data.models} colors={MODEL_COLORS} />
        <ResultsTable models={data.models} />
      </main>
    </div>
  )
}

export default App
