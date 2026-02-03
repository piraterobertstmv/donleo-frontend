"use client"

import { XCircle } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { PrimaryCTA } from '@/components/ui/primary-cta'

export default function BillingCancelPage() {
  const t = useTranslations('billing')
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accentSoft/5 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        {/* Cancel Icon */}
        <div className="p-4 rounded-full bg-red-500/20 mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-500 mx-auto" />
        </div>

        {/* Content */}
        <div>
          <h1 className="text-3xl font-bold text-text mb-3">
            {t('cancelTitle')}
          </h1>
          <p className="text-body-lg text-muted mb-6">
            {t('cancelSubtitle')}
          </p>
          <p className="text-body-md text-muted/70 bg-surface p-4 rounded-lg mb-6">
            {t('cancelMessage')}
          </p>
        </div>

        {/* CTA */}
        <div className="w-full flex flex-col gap-3">
          <Link href="/app/subscription" locale={locale}>
            <PrimaryCTA size="large" className="w-full">
              {t('tryAgain')}
            </PrimaryCTA>
          </Link>
          <Link href="/app/wingman" locale={locale}>
            <button className="w-full px-6 py-3 rounded-full bg-surface border border-cardBorder text-text hover:bg-surface2 transition-colors">
              {t('backToApp')}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
