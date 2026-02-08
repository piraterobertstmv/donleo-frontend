/**
 * Affiliate API service - calls backend /api/affiliates
 */

const getBackendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL

export interface AffiliateMe {
  affiliateCode: string | null
}

export interface AffiliateDashboard {
  month: string
  registeredUsers: number
  premiumUsers: number
  planCounts: { weekly: number; monthly: number; annual: number }
  payoutThisMonth: {
    grossCollectedMinor: number
    refundsMinor: number
    netCollectedMinor: number
    commissionMinor: number
    rateSummary: string
  }
  perUser: Array<{
    userId: string
    firstPaidAt: string | null
    monthOffset: number | null
    rate: number
    grossCollectedMinor: number
    refundsMinor: number
    netCollectedMinor: number
    commissionMinor: number
    plan: string
    isPremium: boolean
  }>
}

export async function getAffiliateMe(token: string): Promise<AffiliateMe | null> {
  const base = getBackendUrl()
  if (!base) return null
  const res = await fetch(`${base}/api/affiliates/me`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getAffiliateDashboard(
  token: string,
  month?: string
): Promise<AffiliateDashboard | null> {
  const base = getBackendUrl()
  if (!base) return null
  const url = month
    ? `${base}/api/affiliates/dashboard?month=${encodeURIComponent(month)}`
    : `${base}/api/affiliates/dashboard`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function postAffiliateCode(token: string): Promise<{ affiliateCode: string } | null> {
  const base = getBackendUrl()
  if (!base) return null
  const res = await fetch(`${base}/api/affiliates/code`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}

export async function getAffiliatePayoutCurrent(
  token: string,
  month?: string
): Promise<AffiliateDashboard | null> {
  const base = getBackendUrl()
  if (!base) return null
  const url = month
    ? `${base}/api/affiliates/payouts/current?month=${encodeURIComponent(month)}`
    : `${base}/api/affiliates/payouts/current`
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return null
  return res.json()
}
