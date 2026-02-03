import { useAuth } from '@/contexts/auth-context'
import { useRouter } from '@/i18n/routing'
import { useLocale } from 'next-intl'

interface UsePremiumReturn {
  isPremium: boolean
  isLoading: boolean
  requirePremium: () => boolean
  redirectIfNotPremium: (featureName?: string) => boolean
}

/**
 * Hook to check premium status and manage premium-only features
 * Returns false and redirects to subscription page if user is not premium
 */
export const usePremium = (): UsePremiumReturn => {
  const { profile, loading } = useAuth()
  const router = useRouter()
  const locale = useLocale()

  const isPremium = profile?.isPremium ?? false

  /**
   * Check if user has premium access
   * Returns true if premium, false otherwise (does not redirect)
   */
  const requirePremium = (): boolean => {
    return isPremium
  }

  /**
   * Check if user has premium access
   * If not, redirects to subscription page and returns false
   * Use this before allowing access to premium features
   */
  const redirectIfNotPremium = (featureName?: string): boolean => {
    if (!isPremium && !loading) {
      console.log(
        `❌ Premium required${featureName ? ` for ${featureName}` : ''}. Redirecting to subscription.`
      )
      router.push('/app/subscription', { locale })
      return false
    }
    return true
  }

  return {
    isPremium,
    isLoading: loading,
    requirePremium,
    redirectIfNotPremium,
  }
}
