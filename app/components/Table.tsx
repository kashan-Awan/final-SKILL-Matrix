"use client"

import type React from "react"
import { Award } from "lucide-react"
import { useTheme } from "./ThemeProvider"

interface Column {
  key: string
  label: string
  render?: (value: any, row: any) => React.ReactNode
}

interface TableProps {
  columns: Column[]
  data: any[]
  isLoading?: boolean
  emptyMessage?: string
  onInspect?: (row: any) => void
}

export default function Table({
  columns,
  data,
  isLoading,
  emptyMessage = "No data available",
  onInspect,
}: TableProps) {
  const { isDark } = useTheme()

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
        <div className="animate-pulse">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 border-b-2 border-blue-800">
            <div className="h-5 bg-blue-300 rounded w-1/4"></div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className={`px-6 py-4 border-b border-gray-200 dark:border-gray-700 ${
              i % 2 === 0 ? "bg-gray-50 dark:bg-gray-800/50" : "bg-white dark:bg-gray-800"
            }`}>
              <div className="flex space-x-4">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded flex-1"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              {/* S.No. column */}
              <th className="border-b-2 border-blue-800 px-6 py-4 text-left text-sm font-semibold tracking-wide">
                S.No.
              </th>

              {/* Existing dynamic columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="border-b-2 border-blue-800 px-6 py-4 text-left text-sm font-semibold tracking-wide"
                >
                  {column.label}
                </th>
              ))}

              {/* Actions column (if any) */}
              {onInspect && (
                <th className="border-b-2 border-blue-800 px-6 py-4 text-center text-sm font-semibold tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            {data.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (onInspect ? 2 : 1)} 
                  className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Award className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                    <p className="text-lg font-medium">{emptyMessage}</p>
                    <p className="text-sm">Try adjusting your search or filter criteria</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className={`${
                    index % 2 === 0
                      ? "bg-gray-50 dark:bg-gray-800/50"
                      : "bg-white dark:bg-gray-800"
                  } hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200 border-b border-gray-200 dark:border-gray-700`}
                >
                  {/* S.No. value */}
                  <td className="px-6 py-4 text-sm font-medium text-blue-700 dark:text-blue-300 border-r border-gray-200 dark:border-gray-700">
                    {index + 1}
                  </td>

                  {/* Dynamic values */}
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 border-r border-gray-200 dark:border-gray-700"
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}

                  {/* Action button (if any) */}
                  {onInspect && (
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onInspect(row)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold transition-all duration-200 text-sm shadow-sm hover:shadow-md transform hover:scale-105"
                      >
                        <Award className="h-4 w-4" />
                        Inspect
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
