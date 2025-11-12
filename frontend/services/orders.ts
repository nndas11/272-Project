import { apiGet, apiPost, apiDelete } from '@/lib/http'

export interface Order {
  id: number
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
  status: 'FILLED' | 'REJECTED' | 'CANCELLED' | 'PENDING'
  filled_price?: number
  created_at: string
}

export interface CreateOrderRequest {
  symbol: string
  side: 'BUY' | 'SELL'
  qty: number
}

/**
 * Get all orders for the current user
 */
export async function getOrders(): Promise<Order[]> {
  return apiGet<Order[]>('/api/orders')
}

/**
 * Create a new order
 */
export async function createOrder(order: CreateOrderRequest): Promise<Order> {
  return apiPost<Order>('/api/orders', order)
}

/**
 * Cancel an order by ID
 */
export async function cancelOrder(orderId: number): Promise<void> {
  return apiDelete(`/api/orders/${orderId}`)
}


