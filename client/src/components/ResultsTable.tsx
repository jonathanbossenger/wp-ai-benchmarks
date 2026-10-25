import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import type { ModelData, TestResult } from '../types'
import { formatCost, formatLatency } from '../format'

interface FlatResult extends TestResult {
  model: string
}

const columnHelper = createColumnHelper<FlatResult>()

const PAGE_SIZE = 50

const SELECT_CLASS = 'text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#3858e9]/30'

const BUTTON_CLASS = 'text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-1.5 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed'

function ResultBadge({ result }: { result: FlatResult }) {
  if (result.execution_pass) return <span className="font-semibold text-sm text-green-600">✓ pass</span>
  if ((result.runtime ?? 0) > 0) return <span className="font-semibold text-sm text-amber-500">~ partial</span>
  return <span className="font-semibold text-sm text-red-500">✗ fail</span>
}

function formatScore(value: number | null): string {
  return value === null ? 'N/A' : value.toFixed(2)
}

interface Props {
  models: [string, ModelData][]
}

export default function ResultsTable({ models }: Props) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [modelFilter, setModelFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: PAGE_SIZE })

  const modelNames = useMemo(() => models.map(([name]) => name), [models])

  const flatData = useMemo<FlatResult[]>(
    () =>
      models.flatMap(([modelName, modelData]) =>
        modelData.results.map((result) => ({ ...result, model: modelName })),
      ),
    [models],
  )

  const categories = useMemo(
    () => [...new Set(flatData.map((row) => row.category))].sort(),
    [flatData],
  )

  const filteredData = useMemo(
    () =>
      flatData.filter(
        (row) =>
          (categoryFilter === 'all' || row.category === categoryFilter) &&
          (modelFilter === 'all' || row.model === modelFilter) &&
          (statusFilter === 'all' || row.execution_pass === (statusFilter === 'passed')),
      ),
    [flatData, categoryFilter, modelFilter, statusFilter],
  )

  function updateFilter(setter: (value: string) => void) {
    return (event: ChangeEvent<HTMLSelectElement>) => {
      setter(event.target.value)
      setPagination((current) => ({ ...current, pageIndex: 0 }))
    }
  }

  const columns = useMemo(
    () => [
      columnHelper.accessor('test_id', {
        header: 'Test ID',
        cell: (info) => (
          <div>
            <span className="font-mono text-xs text-gray-600 dark:text-gray-300">{info.getValue()}</span>
            {info.row.original.failures.length > 0 && (
              <ul className="mt-1 text-xs text-gray-400 dark:text-gray-500 list-disc list-inside">
                {info.row.original.failures.map((failure, index) => (
                  <li key={index}>{failure}</li>
                ))}
              </ul>
            )}
          </div>
        ),
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('model', {
        header: 'Model',
        cell: (info) => <span className="text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">{info.getValue()}</span>,
      }),
      columnHelper.accessor('execution_pass', {
        header: 'Result',
        cell: (info) => <ResultBadge result={info.row.original} />,
        sortingFn: 'basic',
      }),
      columnHelper.accessor('runtime', {
        header: 'Runtime',
        cell: (info) => <span className="text-sm tabular-nums text-gray-700 dark:text-gray-200">{formatScore(info.getValue())}</span>,
        sortingFn: 'basic',
      }),
      columnHelper.accessor('static', {
        header: 'Static',
        cell: (info) => <span className="text-sm tabular-nums text-gray-700 dark:text-gray-200">{formatScore(info.getValue())}</span>,
        sortingFn: 'basic',
      }),
      columnHelper.accessor('cost_usd', {
        header: 'Cost',
        cell: (info) => <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">{formatCost(info.getValue())}</span>,
        sortingFn: 'basic',
      }),
      columnHelper.accessor('latency_ms', {
        header: 'Latency',
        cell: (info) => <span className="text-sm tabular-nums text-gray-500 dark:text-gray-400">{formatLatency(info.getValue())}</span>,
        sortingFn: 'basic',
      }),
    ],
    []
  )

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
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
        <div className="flex flex-wrap gap-2">
          <select className={SELECT_CLASS} value={categoryFilter} onChange={updateFilter(setCategoryFilter)}>
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select className={SELECT_CLASS} value={modelFilter} onChange={updateFilter(setModelFilter)}>
            <option value="all">All Models</option>
            {modelNames.map((modelName) => (
              <option key={modelName} value={modelName}>
                {modelName}
              </option>
            ))}
          </select>
          <select className={SELECT_CLASS} value={statusFilter} onChange={updateFilter(setStatusFilter)}>
            <option value="all">All Results</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
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
                  <td key={cell.id} className="py-3 px-4 align-top">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between gap-4 mt-4">
          <span className="text-sm text-gray-400 dark:text-gray-500">
            Page {pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <div className="flex gap-2">
            <button className={BUTTON_CLASS} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              Previous
            </button>
            <button className={BUTTON_CLASS} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
