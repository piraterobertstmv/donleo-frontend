"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Crown, Check } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { DonLeoLogo } from "@/components/Brand/DonLeoLogo"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { Link } from '@/i18n/routing'
import { useAuth } from '@/contexts/auth-context'

interface Plan {
  id: 'weekly' | 'monthly' | 'yearly'
  name: string
  price: number
  period: string
  badge?: string
  popular?: boolean
  bestValue?: boolean
  savings?: string
  hasTrial?: boolean
  checkoutUrl: string
}

export default function SubscriptionPage() {
  const t = useTranslations('subscription')
  const tBilling = useTranslations('billing')
  const { user, profile, loading } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  // Stripe Billing Links for direct checkout (TEST MODE)
  const plans: Plan[] = [
    {
      id: 'weekly',
      name: t('plans.weekly.name'),
      price: 2.99,
      period: `/${t('plans.weekly.period')}`,
      hasTrial: false,
      checkoutUrl: 'https://buy.stripe.com/test_8x200k2FT16s2VmdLl5J600',
    },
    {
      id: 'monthly',
      name: t('plans.monthly.name'),
      price: 8.99,
      period: `/${t('plans.monthly.period')}`,
      badge: t('plans.monthly.badge'),
      popular: true,
      hasTrial: true,
      checkoutUrl: 'https://buy.stripe.com/test_cNi7sM5S5cPa1RidLl5J602',
    },
    {
      id: 'yearly',
      name: t('plans.annual.name'),
      price: 49.99,
      period: `/${t('plans.annual.period')}`,
      badge: t('plans.annual.badge'),
      bestValue: true,
      savings: t('plans.annual.savePercent'),
      hasTrial: false,
      checkoutUrl: 'https://buy.stripe.com/test_dRm3cw3JXaH27bCcHh5J601',
    },
  ]

  const features = [
    t('features.unlimited'),
    t('features.modes'),
    t('features.priority'),
  ]

  const handleCheckout = (planId: string, checkoutUrl: string) => {
    setSelectedPlan(planId)
    // Redirect directly to Stripe Billing Link
    window.location.href = checkoutUrl
  }

  // Get user display info
  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User'
  const displayEmail = user?.email || 'user@example.com'
  const isPremium = profile?.isPremium ?? false

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b border-cardBorder">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 max-w-6xl mx-auto">
          <Link href="/app">
            <DonLeoLogo size="md" priority />
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 md:px-6 py-8 md:py-12 max-w-6xl mx-auto">
        {/* Your Profile Card */}
        <div className="mb-8 md:mb-12 p-4 md:p-6 rounded-2xl border border-cardBorder bg-surface/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accentSoft flex items-center justify-center">
              <span className="text-lg md:text-xl">👤</span>
            </div>
            <div>
              <p className="font-semibold text-text">{displayName}</p>
              <p className="text-xs md:text-sm text-muted">{displayEmail}</p>
            </div>
          </div>
          <div className="px-3 py-1 rounded-full bg-accentSoft text-accent text-xs md:text-sm font-semibold">
            {isPremium ? t('planStatus.premium') : t('planStatus.free')}
          </div>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-8 md:mb-12">
          {/* 3-day free trial badge */}
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-accentSoft text-accent text-xs font-semibold">
            ✨ 3-day free trial
          </div>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-accentCTA" />
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text">
              {t('title')}
            </h1>
          </div>
          <p className="text-base sm:text-lg md:text-xl text-muted max-w-2xl mx-auto mb-2">
            {t('subtitle')}
          </p>
          <p className="text-sm text-muted/70">Secure checkout in one click</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-3xl border-2 p-6 md:p-8 flex flex-col w-full ${
                plan.popular
                  ? 'border-accentCTA bg-surface shadow-lg shadow-accentCTA/20'
                  : plan.bestValue
                  ? 'border-accent bg-surface shadow-lg shadow-accent/20'
                  : 'border-cardBorder bg-surface'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-sm font-semibold ${
                    plan.popular
                      ? 'bg-accentCTA text-white'
                      : 'bg-accent text-white'
                  }`}
                >
                  {plan.badge}
                </div>
              )}

              {/* Savings Badge */}
              {plan.bestValue && plan.savings && (
                <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-accentSoft text-accent text-xs font-semibold">
                  {plan.savings}
                </div>
              )}

              {/* Plan Name */}
              <h3 className="text-2xl font-bold text-text mb-2">
                {plan.name}
              </h3>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-text">
                    €{plan.price}
                  </span>
                  <span className="text-muted">{plan.period}</span>
                </div>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-8 flex-1">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-accentCTA flex-shrink-0 mt-0.5" />
                    <span className="text-text">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="space-y-3">
                <button
                  onClick={() => handleCheckout(plan.id, plan.checkoutUrl)}
                  disabled={selectedPlan === plan.id}
                  className={`w-full px-6 py-3 rounded-full font-semibold transition-all ${
                    plan.popular || plan.bestValue 
                      ? 'bg-accentCTA text-white hover:bg-accentPressed disabled:opacity-50' 
                      : 'bg-surface2 text-text hover:bg-surface3 disabled:opacity-50'
                  } ${selectedPlan === plan.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {plan.hasTrial ? t('trialCta') : t('startNow')}
                </button>
                <p className="text-center text-sm text-muted min-h-[20px]">
                  {plan.hasTrial ? t('cancelAnytime') : `Then €${plan.price}/${plan.period}`}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Free Plan Note */}
        <div className="text-center text-muted text-body-md">
          {t('freePlanNote')}
        </div>
      </main>
    </div>
  )
}
