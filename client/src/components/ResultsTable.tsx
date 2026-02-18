import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { ModelData } from '../types'

interface FlatResult {
  test_id: string
  type: 'knowledge' | 'execution'
  model: string
  score: number
}

const columnHelper = createColumnHelper<FlatResult>()

const PASS_THRESHOLD = 0.99

function ScoreBadge({ score, type }: { score: number; type: string }) {
  if (type === 'knowledge') {
    const pass = score >= PASS_THRESHOLD
    return (
      <span className={`inline-flex items-center gap-1 font-semibold text-sm ${pass ? 'text-green-600' : 'text-red-500'}`}>
        {pass ? '✓' : '✗'} {score.toFixed(2)}
      </span>
    )
  }
  if (score >= PASS_THRESHOLD) return <span className="font-semibold text-sm text-green-600">✓ {score.toFixed(2)}</span>
  if (score <= 0) return <span className="font-semibold text-sm text-red-500">✗ {score.toFixed(2)}</span>
  return <span className="font-semibold text-sm text-amber-500">~ {score.toFixed(2)}</span>
}

interface Props {
  models: Record<string, ModelData>
}

export default function ResultsTable({ models }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [typeFilter, setTypeFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')

  const modelNames = useMemo(() => Object.keys(models), [models])

  const flatData = useMemo<FlatResult[]>(() => {
    const rows: FlatResult[] = []
    Object.entries(models).forEach(([modelName, modelData]) => {
      modelData.results.forEach((result) => {
        rows.push({
          test_id: result.test_id,
          type: result.type,
          model: modelName,
          score: result.type === 'knowledge' ? result.score : result.correctness,
        })
      })
    })
    return rows
  }, [models])

  const filteredData = useMemo(() => {
    return flatData.filter((row) => {
      if (typeFilter !== 'all' && row.type !== typeFilter) return false
      if (modelFilter !== 'all' && row.model !== modelFilter) return false
      return true
    })
  }, [flatData, typeFilter, modelFilter])

  const columns = useMemo(
    () => [
      columnHelper.accessor('test_id', {
        header: 'Test ID',
        cell: (info) => (
          <span className="font-mono text-xs text-gray-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              info.getValue() === 'knowledge'
                ? 'bg-purple-50 text-purple-700'
                : 'bg-blue-50 text-blue-700'
            }`}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => <span className="text-sm text-gray-700">{info.getValue()}</span>,
        enableSorting: false,
      }),
      columnHelper.accessor('score', {
        header: 'Score',
        cell: (info) => <ScoreBadge score={info.getValue()} type={info.row.original.type} />,
        sortingFn: 'basic',
      }),
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900">
          Results
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({filteredData.length} rows)
          </span>
        </h2>
        <div className="flex gap-2">
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3858e9]/30"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="knowledge">Knowledge</option>
            <option value="execution">Execution</option>
          </select>
          <select
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#3858e9]/30"
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
          >
            <option value="all">All Models</option>
            {modelNames.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-600' : ''
                    }`}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() === 'asc'
                      ? ' ↑'
                      : header.column.getIsSorted() === 'desc'
                      ? ' ↓'
                      : header.column.getCanSort()
                      ? ' ↕'
                      : ''}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="py-3 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
