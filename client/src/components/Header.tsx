import type { Metadata } from '../types'

interface Props {
  metadata: Metadata
}

export default function Header({ metadata }: Props) {
  return (
    <header className="bg-[#1d2327] text-white px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-[#3858e9]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
          <span className="text-xl font-bold tracking-tight">WP AI Benchmarks</span>
          <span className="bg-[#3858e9] text-white text-xs font-semibold px-2.5 py-1 rounded-full">
            {metadata.suite}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-400">
          <span>
            <span className="text-gray-500 mr-1">Grader</span>
            <span className="text-gray-200">{metadata.grader.kind}</span>
          </span>
          <span>
            <span className="text-gray-500 mr-1">Dataset</span>
            <span className="text-gray-200">{metadata.dataset.name}</span>
          </span>
          <span>
            <span className="text-gray-500 mr-1">Split</span>
            <span className="text-gray-200">{metadata.dataset.split}</span>
          </span>
          <span>
            <span className="text-gray-500 mr-1">Concurrency</span>
            <span className="text-gray-200">{metadata.grader.concurrency}</span>
          </span>
        </div>
      </div>
    </header>
  )
}
