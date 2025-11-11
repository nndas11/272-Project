"use client"

import React from "react"
import { useQuotes } from "@/app/providers/QuoteProvider"
import { apiGet } from "@/lib/api"

interface Symbol {
  symbol: string
  name: string
  exchange?: string
}

interface StockListProps {
  onSelectStock: (symbol: string) => void
  selectedSymbol?: string
}

export function StockList({ onSelectStock, selectedSymbol }: StockListProps) {
  const [symbols, setSymbols] = React.useState<Symbol[]>([])
  const [searchQuery, setSearchQuery] = React.useState("")
  const { quotes, subscribe } = useQuotes()
  
  // Subscribe to quotes when symbols change
  React.useEffect(() => {
    if (symbols.length > 0) {
      const symbolStrings = symbols.map((s) => s.symbol)
      subscribe(symbolStrings)
    }
  }, [symbols, subscribe])

  React.useEffect(() => {
    apiGet<Symbol[]>("/api/market/symbols").then(setSymbols).catch(console.error)
  }, [])

  const filteredSymbols = symbols.filter(
    (s) =>
      !searchQuery ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getChangePercent = (symbol: string): number | null => {
    // This would need historical data - for now return null
    return null
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Search stocks..."
          className="w-full px-3 py-2 border rounded-md"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Symbol
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Name
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Price
              </th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                Change
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSymbols.map((symbol) => {
              const quote = quotes[symbol.symbol]
              const price = quote?.price ?? null
              const change = getChangePercent(symbol.symbol)
              const isSelected = selectedSymbol === symbol.symbol

              return (
                <tr
                  key={symbol.symbol}
                  onClick={() => onSelectStock(symbol.symbol)}
                  className={`cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    isSelected ? "bg-blue-50 dark:bg-blue-900/20" : ""
                  }`}
                >
                  <td className="px-4 py-2 font-medium">{symbol.symbol}</td>
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {symbol.name}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {price ? `$${price.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {change !== null ? (
                      <span
                        className={change >= 0 ? "text-green-600" : "text-red-600"}
                      >
                        {change >= 0 ? "+" : ""}
                        {change.toFixed(2)}%
                      </span>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

