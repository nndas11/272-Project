"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api"

interface Position {
  symbol: string
  qty: number
  avg_cost: number
  mkt_price?: number
  mkt_value?: number
  pnl?: number
}

interface Portfolio {
  cash: number
  positions: Position[]
  total_equity?: number
}

export function PortfolioCard() {
  const { data: portfolio, isLoading } = useQuery<Portfolio>({
    queryKey: ["portfolio"],
    queryFn: () => apiGet<Portfolio>("/api/portfolio"),
    refetchInterval: 5000,
  })

  if (isLoading) {
    return <div className="p-4">Loading portfolio...</div>
  }

  if (!portfolio) {
    return <div className="p-4">No portfolio data</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Portfolio</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Cash:</span>
            <span className="font-medium">${portfolio.cash.toFixed(2)}</span>
          </div>
          {portfolio.total_equity !== undefined && (
            <div className="flex justify-between border-t pt-2">
              <span className="font-semibold">Total Equity:</span>
              <span className="font-bold">${portfolio.total_equity.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-semibold mb-2">Positions</h4>
        {portfolio.positions.length === 0 ? (
          <p className="text-sm text-gray-500">No positions</p>
        ) : (
          <div className="space-y-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-1">Symbol</th>
                  <th className="text-right py-1">Qty</th>
                  <th className="text-right py-1">Avg Cost</th>
                  <th className="text-right py-1">Mkt Value</th>
                  <th className="text-right py-1">P&L</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.positions.map((pos) => (
                  <tr key={pos.symbol} className="border-b">
                    <td className="py-1">{pos.symbol}</td>
                    <td className="text-right py-1">{pos.qty.toFixed(4)}</td>
                    <td className="text-right py-1">${pos.avg_cost.toFixed(2)}</td>
                    <td className="text-right py-1">
                      {pos.mkt_value ? `$${pos.mkt_value.toFixed(2)}` : "-"}
                    </td>
                    <td
                      className={`text-right py-1 ${
                        pos.pnl && pos.pnl >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {pos.pnl !== undefined
                        ? `${pos.pnl >= 0 ? "+" : ""}$${pos.pnl.toFixed(2)}`
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


