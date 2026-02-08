"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Copy, RefreshCw, Users, Crown, Euro, Gift } from "lucide-react"
import { PrimaryCTA } from "@/components/ui/primary-cta"
import { useAuth } from "@/contexts/auth-context"
import {
  getAffiliateMe,
  getAffiliateDashboard,
  postAffiliateCode,
  getAffiliatePayoutCurrent,
  type AffiliateDashboard,
} from "@/lib/affiliate-api"
import { cn } from "@/lib/utils"

export default function AffiliatePage() {
  const t = useTranslations("affiliate")
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null)
  const [dashboard, setDashboard] = useState<AffiliateDashboard | null>(null)
  const [payout, setPayout] = useState<AffiliateDashboard | null>(null)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!user) return
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    setError(null)
    try {
      const token = await user.getIdToken()
      const [meRes, dashboardRes, payoutRes] = await Promise.all([
        getAffiliateMe(token),
        getAffiliateDashboard(token),
        getAffiliatePayoutCurrent(token),
      ])
      setAffiliateCode(meRes?.affiliateCode ?? null)
      setDashboard(dashboardRes ?? null)
      setPayout(payoutRes ?? null)
    } catch (err) {
      console.error("Affiliate fetch error:", err)
      setError(t("error"))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [user, t])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleGenerateCode = async () => {
    if (!user) return
    setGenerating(true)
    setError(null)
    try {
      const token = await user.getIdToken()
      const res = await postAffiliateCode(token)
      if (res?.affiliateCode) {
        setAffiliateCode(res.affiliateCode)
        await fetchData(true)
      } else {
        setError(t("generateError"))
      }
    } catch (err) {
      setError(t("generateError"))
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (!affiliateCode) return
    try {
      await navigator.clipboard.writeText(affiliateCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError(t("copyError"))
    }
  }

  const handleRefresh = () => fetchData(true)

  if (loading && !dashboard) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    )
  }

  const hasNoCode = !affiliateCode
  const defaultPayout = {
    grossCollectedMinor: 0,
    refundsMinor: 0,
    netCollectedMinor: 0,
    commissionMinor: 0,
    rateSummary: "",
  }
  const d = dashboard ?? {
    month: new Date().toISOString().slice(0, 7),
    registeredUsers: 0,
    premiumUsers: 0,
    planCounts: { weekly: 0, monthly: 0, annual: 0 },
    payoutThisMonth: defaultPayout,
    perUser: [],
  }
  const p = payout ?? d

  return (
    <div className="px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header + Refresh */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-heading-xl text-text">{t("title")}</h1>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={cn(
              "rounded-full p-2 transition-colors",
              "hover:bg-surface2 disabled:opacity-50",
              refreshing && "animate-spin"
            )}
            aria-label={t("refresh")}
          >
            <RefreshCw className="h-5 w-5 text-muted" />
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3">
            <p className="text-body-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Generate code CTA (when no code) */}
        {hasNoCode && (
          <div className="mb-6 rounded-3xl border-2 border-accentCTA bg-gradient-to-b from-accentSoft/30 to-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="h-8 w-8 text-accentCTA" />
              <div>
                <h2 className="text-heading-md text-text">{t("noCodeTitle")}</h2>
                <p className="text-body-sm text-muted">{t("noCodeSubtitle")}</p>
              </div>
            </div>
            <PrimaryCTA
              onClick={handleGenerateCode}
              isLoading={generating}
              size="large"
              className="w-full"
            >
              {t("generateCode")}
            </PrimaryCTA>
          </div>
        )}

        {/* Affiliate code + Copy */}
        {!hasNoCode && (
          <div className="mb-6 rounded-3xl border border-cardBorder bg-surface p-6">
            <p className="text-body-sm text-muted mb-2">{t("yourCode")}</p>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded-xl bg-surface2 px-4 py-3 text-heading-lg font-mono text-text">
                {affiliateCode}
              </code>
              <button
                onClick={handleCopy}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-3 font-medium transition-colors",
                  copied
                    ? "bg-green-500/20 text-green-600"
                    : "bg-accentSoft text-accent hover:bg-accentSoft/80"
                )}
              >
                <Copy className="h-5 w-5" />
                {copied ? t("copied") : t("copy")}
              </button>
            </div>
          </div>
        )}

        {/* Stats cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-cardBorder bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-5 w-5 text-accent" />
              <span className="text-body-sm text-muted">{t("referredUsers")}</span>
            </div>
            <p className="text-heading-xl text-text">{d.registeredUsers}</p>
          </div>
          <div className="rounded-2xl border border-cardBorder bg-surface p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-accentCTA" />
              <span className="text-body-sm text-muted">{t("premiumUsers")}</span>
            </div>
            <p className="text-heading-xl text-text">{d.premiumUsers}</p>
          </div>
        </div>

        {/* Plan breakdown */}
        <div className="mb-6 rounded-2xl border border-cardBorder bg-surface p-4">
          <p className="text-body-sm text-muted mb-3">{t("planBreakdown")}</p>
          <div className="flex flex-wrap gap-4">
            <div className="rounded-xl bg-surface2 px-4 py-2">
              <span className="text-body-sm text-muted">{t("weekly")}</span>
              <span className="ml-2 font-semibold text-text">{d.planCounts.weekly}</span>
            </div>
            <div className="rounded-xl bg-surface2 px-4 py-2">
              <span className="text-body-sm text-muted">{t("monthly")}</span>
              <span className="ml-2 font-semibold text-text">{d.planCounts.monthly}</span>
            </div>
            <div className="rounded-xl bg-surface2 px-4 py-2">
              <span className="text-body-sm text-muted">{t("annual")}</span>
              <span className="ml-2 font-semibold text-text">{d.planCounts.annual}</span>
            </div>
          </div>
        </div>

        {/* Payout this month */}
        <div className="mb-6 rounded-2xl border border-accentBorderSoft bg-gradient-to-br from-accentSoft/20 to-surface p-4">
          <div className="flex items-center gap-2 mb-2">
            <Euro className="h-5 w-5 text-accent" />
            <span className="text-body-sm text-muted">{t("payoutThisMonth")}</span>
          </div>
          <p className="text-heading-xl text-accent">
            €{(p.payoutThisMonth.commissionMinor / 100).toFixed(2)}
          </p>
          <p className="text-body-xs text-muted mt-1">
            {t("month")}: {p.month}
          </p>
          {p.payoutThisMonth.rateSummary && (
            <p className="text-body-xs text-muted mt-1">
              {p.payoutThisMonth.rateSummary}
            </p>
          )}
        </div>

        {/* Per-user breakdown */}
        <div className="rounded-2xl border border-cardBorder bg-surface p-4">
          <p className="text-body-md font-medium text-text mb-3">{t("recentReferrals")}</p>
          {d.perUser.length === 0 ? (
            <p className="text-body-sm text-muted py-4 text-center">{t("noReferrals")}</p>
          ) : (
            <ul className="space-y-3">
              {d.perUser.map((ref) => (
                <li
                  key={ref.userId}
                  className="flex items-center justify-between rounded-xl bg-surface2 px-4 py-3"
                >
                  <div>
                    <span className="font-mono text-body-sm text-text">
                      {ref.userId.slice(0, 8)}…
                    </span>
                    <span
                      className={cn(
                        "ml-2 rounded-full px-2 py-0.5 text-xs font-medium",
                        ref.isPremium ? "bg-accentCTA/20 text-accentCTA" : "bg-surface3 text-muted"
                      )}
                    >
                      {ref.isPremium ? (ref.plan || t("premium")) : t("free")}
                    </span>
                  </div>
                  <span className="text-body-sm text-muted">
                    €{(ref.commissionMinor / 100).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
