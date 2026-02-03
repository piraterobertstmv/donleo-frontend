'use client'

import { Lock } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { PrimaryCTA } from '@/components/ui/primary-cta'

interface PremiumWallProps {
  featureName: string
  description?: string
}

/**
 * Premium access wall component
 * Shows when user doesn't have premium access to a feature
 */
export const PremiumWall = ({ featureName, description }: PremiumWallProps) => {
  const locale = useLocale()
  const t = useTranslations('premium')

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] rounded-3xl border-2 border-dashed border-cardBorder bg-surface/30 p-8 text-center">
      {/* Lock Icon */}
      <div className="mb-6 p-4 rounded-full bg-accentSoft">
        <Lock className="h-12 w-12 text-accent" />
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold text-text mb-3">
        {t('lockedFeature')}
      </h2>

      {/* Feature Name */}
      <p className="text-heading-md text-muted mb-2">
        {featureName}
      </p>

      {/* Description */}
      {description && (
        <p className="text-body-md text-muted/70 mb-8 max-w-sm">
          {description}
        </p>
      )}

      {/* CTA */}
      <Link href="/app/subscription" locale={locale}>
        <PrimaryCTA size="large">
          {t('upgradeToPremium')}
        </PrimaryCTA>
      </Link>

      {/* Benefits */}
      <div className="mt-8 pt-8 border-t border-cardBorder w-full">
        <p className="text-body-sm text-muted mb-4">
          {t('premiumBenefits')}
        </p>
        <ul className="text-body-sm text-muted space-y-2">
          <li>✓ {t('benefit1')}</li>
          <li>✓ {t('benefit2')}</li>
          <li>✓ {t('benefit3')}</li>
        </ul>
      </div>
    </div>
  )
}
