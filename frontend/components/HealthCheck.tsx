"use client"

import React from "react"
import { useHealth } from "@/hooks/api/useHealth"

export function HealthCheck() {
  const { data: health, isLoading, error, isError } = useHealth()

  if (isLoading) {
    return (
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600 dark:text-gray-400">Checking backend health...</span>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg shadow border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2">
          <span className="text-red-600 dark:text-red-400 font-semibold">Backend Unavailable</span>
        </div>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          {error instanceof Error ? error.message : "Unable to connect to backend"}
        </p>
        <p className="text-xs text-red-500 dark:text-red-500 mt-2">
          Please ensure the backend is running and accessible.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Backend Status</h3>
          <div className="mt-1 flex items-center gap-2">
            <span
              className={`inline-block w-2 h-2 rounded-full ${
                health?.status === "ok" ? "bg-green-500" : "bg-yellow-500"
              }`}
            ></span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {health?.status === "ok" ? "Healthy" : health?.status || "Unknown"}
            </span>
          </div>
        </div>
        {health?.symbols && health.symbols.length > 0 && (
          <div className="text-right">
            <p className="text-xs text-gray-500 dark:text-gray-400">Tracking</p>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {health.symbols.length} symbols
            </p>
          </div>
        )}
      </div>
      {health?.timestamp && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Last checked: {new Date(health.timestamp).toLocaleTimeString()}
        </p>
      )}
    </div>
  )
}


