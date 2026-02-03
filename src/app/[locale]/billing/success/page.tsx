"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle, Loader } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { PrimaryCTA } from '@/components/ui/primary-cta'
import { useAuth } from '@/contexts/auth-context'

export default function BillingSuccessPage() {
  const t = useTranslations('billing')
  const locale = useLocale()
  const searchParams = useSearchParams()
  const { refreshProfile } = useAuth()
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)

    // Refresh profile from backend to get updated isPremium status (set by Stripe webhook)
    refreshProfile?.()
  }, [searchParams, refreshProfile])

  useEffect(() => {
    // Brief loading state for confirmation
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accentSoft/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 rounded-full bg-accentSoft animate-pulse">
              <Loader className="h-8 w-8 text-accent animate-spin" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-text mb-2">
                {t('processing')}
              </h1>
              <p className="text-body-md text-muted">
                {t('processingSubtitle')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-6">
            {/* Success Icon */}
            <div className="p-4 rounded-full bg-green-500/20">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>

            {/* Content */}
            <div>
              <h1 className="text-3xl font-bold text-text mb-3">
                {t('successTitle')}
              </h1>
              <p className="text-body-lg text-muted mb-4">
                {t('successSubtitle')}
              </p>
              {sessionId && (
                <p className="text-body-sm text-muted/70 break-all bg-surface p-3 rounded-lg">
                  {t('sessionId')}: {sessionId}
                </p>
              )}
            </div>

            {/* CTA */}
            <div className="w-full flex flex-col gap-3 pt-4">
              <Link href="/app/wingman" locale={locale}>
                <PrimaryCTA size="large" className="w-full">
                  {t('backToApp')}
                </PrimaryCTA>
              </Link>
              <Link href="/app/profile" locale={locale}>
                <button className="w-full px-6 py-3 rounded-full bg-surface border border-cardBorder text-text hover:bg-surface2 transition-colors">
                  {t('viewProfile')}
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
