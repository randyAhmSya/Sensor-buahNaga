import type { ReactNode } from 'react'
import { Inbox } from 'lucide-react'

export interface ColumnDef<T> {
  header: string
  accessorKey?: keyof T
  cell?: (item: T, index: number) => ReactNode
  className?: string
  mobileLabel?: string
  hideOnMobile?: boolean
}

export interface ResponsiveDataTableProps<T> {
  columns: ColumnDef<T>[]
  data: T[]
  keyExtractor: (item: T, index: number) => string | number
  isLoading?: boolean
  emptyMessage?: string
  emptySubMessage?: string
  emptyAction?: ReactNode
  renderMobileCard?: (item: T, index: number) => ReactNode
  className?: string
  tableMinWidth?: string
}

export function ResponsiveDataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'Tidak ada data',
  emptySubMessage = 'Belum ada rekaman data yang tersedia atau sesuai dengan filter.',
  emptyAction,
  renderMobileCard,
  className = '',
  tableMinWidth = 'min-w-[700px]',
}: ResponsiveDataTableProps<T>) {
  // 1. Loading State
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Mobile Skeleton Cards */}
        <div className="md:hidden space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3 animate-pulse"
            >
              <div className="h-5 bg-slate-200 rounded-md w-1/3" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 rounded-md w-full" />
                <div className="h-4 bg-slate-100 rounded-md w-3/4" />
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Skeleton Table */}
        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="h-5 bg-slate-200 rounded-md w-48 animate-pulse" />
          </div>
          <div className="divide-y divide-slate-100 p-2 space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-slate-100/70 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // 2. Empty State
  if (!data || data.length === 0) {
    return (
      <div
        className={`
          bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center shadow-2xs flex flex-col items-center justify-center
          ${className}
        `}
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-3.5 shadow-2xs">
          <Inbox className="w-7 h-7" />
        </div>
        <h3 className="text-base sm:text-lg font-bold text-slate-800">{emptyMessage}</h3>
        <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">{emptySubMessage}</p>
        {emptyAction && <div>{emptyAction}</div>}
      </div>
    )
  }

  // 3. Render Data (Mobile Cards vs Desktop Table)
  return (
    <div className={className}>
      {/* Tampilan Ponsel (< 768px): Card List View */}
      <div className="md:hidden space-y-3">
        {data.map((item, index) => {
          const key = keyExtractor(item, index)
          
          if (renderMobileCard) {
            return (
              <div key={key}>
                {renderMobileCard(item, index)}
              </div>
            )
          }

          // Fallback Default Card
          return (
            <div
              key={key}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5 transition-all duration-150"
            >
              {columns
                .filter((col) => !col.hideOnMobile)
                .map((col, cIdx) => {
                  const renderedValue = col.cell
                    ? col.cell(item, index)
                    : col.accessorKey
                    ? String(item[col.accessorKey] ?? '-')
                    : '-'

                  return (
                    <div
                      key={cIdx}
                      className="flex items-center justify-between gap-3 text-xs border-b border-slate-100/70 pb-2 last:border-b-0 last:pb-0"
                    >
                      <span className="font-medium text-slate-500 shrink-0">
                        {col.mobileLabel || col.header}
                      </span>
                      <div className="font-semibold text-slate-900 text-right min-w-0 truncate">
                        {renderedValue}
                      </div>
                    </div>
                  )
                })}
            </div>
          )
        })}
      </div>

      {/* Tampilan Tablet / Desktop (>= 768px): Table with Horizontal Scroll */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className={`w-full text-left border-collapse ${tableMinWidth}`}>
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                {columns.map((col, idx) => (
                  <th key={idx} className={`py-3.5 px-4 sm:px-5 ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-slate-100">
              {data.map((item, index) => (
                <tr
                  key={keyExtractor(item, index)}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  {columns.map((col, cIdx) => (
                    <td
                      key={cIdx}
                      className={`py-3.5 px-4 sm:px-5 text-slate-700 ${col.className || ''}`}
                    >
                      {col.cell
                        ? col.cell(item, index)
                        : col.accessorKey
                        ? String(item[col.accessorKey] ?? '-')
                        : '-'}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
