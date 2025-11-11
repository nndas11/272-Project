"use client"

import React, { useState } from "react"
import { StockList } from "@/components/StockList"
import { StockDialog } from "@/components/StockDialog"
import { PortfolioCard } from "@/components/PortfolioCard"
import { OrdersTable } from "@/components/OrdersTable"
import { logout, getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"

export default function DashboardPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string>()
  const router = useRouter()

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  })

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Mock Stock Trading</h1>
            <div className="flex items-center gap-4">
              {user && <span className="text-sm">{user.email}</span>}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Stock List */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow h-[calc(100vh-12rem)]">
              <StockList
                onSelectStock={setSelectedSymbol}
                selectedSymbol={selectedSymbol}
              />
            </div>
          </div>

          {/* Center: Stock Details Modal */}
          <div className="lg:col-span-1">
            {selectedSymbol && (
              <StockDialog
                symbol={selectedSymbol}
                onClose={() => setSelectedSymbol(undefined)}
              />
            )}
            {!selectedSymbol && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center text-gray-500">
                Select a stock to view details
              </div>
            )}
          </div>

          {/* Right: Portfolio & Orders */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <PortfolioCard />
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <OrdersTable />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-sm text-gray-500 border-t">
        <p>Mock trading app. Not investment advice.</p>
      </footer>
    </div>
  )
}


