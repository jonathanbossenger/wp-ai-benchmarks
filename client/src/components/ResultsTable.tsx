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

const SELECT_CLASS = 'text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3858e9]/30'

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

  const flatData = useMemo<FlatResult[]>(
    () =>
      Object.entries(models).flatMap(([modelName, modelData]) =>
        modelData.results.map((result) => ({
          test_id: result.test_id,
          type: result.type,
          model: modelName,
          score: result.type === 'knowledge' ? result.score : result.correctness,
        })),
      ),
    [models],
  )

  const filteredData = useMemo(
    () =>
      flatData.filter(
        (row) =>
          (typeFilter === 'all' || row.type === typeFilter) &&
          (modelFilter === 'all' || row.model === modelFilter),
      ),
    [flatData, typeFilter, modelFilter],
  )

  const columns = useMemo(
    () => [
      columnHelper.accessor('test_id', {
        header: 'Test ID',
        cell: (info) => (
          <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('type', {
        header: 'Type',
        cell: (info) => (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              info.getValue() === 'knowledge'
                ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
          >
            {info.getValue()}
          </span>
        ),
        enableSorting: false,
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => <span className="text-sm text-gray-700 dark:text-gray-200">{info.getValue()}</span>,
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Results
          <span className="ml-2 text-sm font-normal text-gray-400 dark:text-gray-500">
            ({filteredData.length} rows)
          </span>
        </h2>
        <div className="flex gap-2">
          <select className={SELECT_CLASS} value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="all">All Types</option>
            <option value="knowledge">Knowledge</option>
            <option value="execution">Execution</option>
          </select>
          <select className={SELECT_CLASS} value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
            <option value="all">All Models</option>
            {modelNames.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-gray-100 dark:border-gray-700">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className={`text-left py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${
                      header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300' : ''
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
                className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50/60 dark:hover:bg-gray-700/50 transition-colors"
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
