"use client"

import React from "react"
import { useOrders } from "@/hooks/api/useOrders"

export function OrdersTable() {
  const { data: orders, isLoading } = useOrders()

  if (isLoading) {
    return <div className="p-4">Loading orders...</div>
  }

  if (!orders || orders.length === 0) {
    return <div className="p-4 text-sm text-gray-500">No orders</div>
  }

  return (
    <div className="p-4">
      <h4 className="font-semibold mb-2">Recent Orders</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-1">Symbol</th>
              <th className="text-left py-1">Side</th>
              <th className="text-right py-1">Qty</th>
              <th className="text-right py-1">Price</th>
              <th className="text-left py-1">Status</th>
              <th className="text-left py-1">Time</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(0, 10).map((order) => (
              <tr key={order.id} className="border-b">
                <td className="py-1">{order.symbol}</td>
                <td
                  className={`py-1 ${
                    order.side === "BUY" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {order.side}
                </td>
                <td className="text-right py-1">{order.qty.toFixed(4)}</td>
                <td className="text-right py-1">
                  {order.filled_price ? `$${order.filled_price.toFixed(2)}` : "-"}
                </td>
                <td className="py-1">
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      order.status === "FILLED"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-200"
                        : order.status === "REJECTED"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-200"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200"
                    }`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="py-1 text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleTimeString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}


