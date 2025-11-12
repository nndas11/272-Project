import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getOrders, createOrder, cancelOrder, type Order, type CreateOrderRequest } from '@/services/orders'

/**
 * Hook to fetch user's orders
 */
export function useOrders(refetchInterval = 5000) {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: getOrders,
    refetchInterval,
  })
}

/**
 * Hook to create a new order
 */
export function useCreateOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (order: CreateOrderRequest) => createOrder(order),
    onSuccess: () => {
      // Invalidate orders and portfolio queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}

/**
 * Hook to cancel an order
 */
export function useCancelOrder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (orderId: number) => cancelOrder(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.invalidateQueries({ queryKey: ['portfolio'] })
    },
  })
}


