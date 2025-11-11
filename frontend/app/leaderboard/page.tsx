"use client"

import React from "react"
import { useQuery } from "@tanstack/react-query"
import { apiGet } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import { useRouter } from "next/navigation"
import { logout } from "@/lib/auth"

interface LeaderboardEntry {
  user_id: number
  email: string
  total_equity: number
  change_24h?: number
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { data: currentUser } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  })

  const { data: leaderboard, isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: () => apiGet<LeaderboardEntry[]>("/api/leaderboard?limit=100"),
    refetchInterval: 10000,
  })

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <div className="flex items-center gap-4">
              <a
                href="/"
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Dashboard
              </a>
              {currentUser && <span className="text-sm">{currentUser.email}</span>}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">Loading leaderboard...</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    Total Equity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                    24h Change
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {leaderboard?.map((entry, index) => {
                  const isCurrentUser = currentUser && entry.user_id === currentUser.id
                  return (
                    <tr
                      key={entry.user_id}
                      className={isCurrentUser ? "bg-blue-50 dark:bg-blue-900/20" : ""}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {entry.email}
                        {isCurrentUser && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-semibold">
                        ${entry.total_equity.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {entry.change_24h !== undefined ? (
                          <span
                            className={
                              entry.change_24h >= 0 ? "text-green-600" : "text-red-600"
                            }
                          >
                            {entry.change_24h >= 0 ? "+" : ""}
                            {entry.change_24h.toFixed(2)}%
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
          )}
        </div>
      </div>
    </div>
  )
}

