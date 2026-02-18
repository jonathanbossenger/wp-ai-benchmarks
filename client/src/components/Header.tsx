import type { Metadata } from '../types'
import { useTheme } from '../context/theme'

interface Props {
  metadata: Metadata
}

export default function Header({ metadata }: Props) {
  const { isDark, toggleDark } = useTheme()

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
          <button
            onClick={toggleDark}
            className="ml-1 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
