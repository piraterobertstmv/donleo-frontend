import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'

interface CheckoutSession {
  url: string
}

export type CheckoutPlan = 'weekly' | 'monthly' | 'annual'

export const useStripeCheckout = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCheckoutByPlan = async (plan: CheckoutPlan, locale?: string) => {
    if (!user) {
      setError('You must be logged in to subscribe')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const token = await user.getIdToken()
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!backendUrl) {
        throw new Error('Backend URL not configured')
      }
      const response = await fetch(`${backendUrl}/api/billing/checkout-by-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plan, locale }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      if (!data.url) {
        throw new Error('No checkout URL returned')
      }
      window.location.href = data.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('❌ Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  const createCheckoutSession = async (priceId: string, locale?: string) => {
    if (!user) {
      setError('You must be logged in to subscribe')
      return
    }
    try {
      setLoading(true)
      setError(null)
      const token = await user.getIdToken()
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL
      if (!backendUrl) {
        throw new Error('Backend URL not configured')
      }
      const response = await fetch(`${backendUrl}/api/billing/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ priceId, locale }),
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }
      if (!data.url) {
        throw new Error('No checkout URL returned')
      }
      window.location.href = data.url
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      console.error('❌ Checkout error:', err)
    } finally {
      setLoading(false)
    }
  }

  return {
    createCheckoutByPlan,
    createCheckoutSession,
    loading,
    error,
  }
}
