/**
 * Stripe Payment Links - single source of truth
 * Used everywhere subscription/upgrade is offered (all languages, all pages)
 */
export const STRIPE_PAYMENT_LINKS = {
  weekly: 'https://buy.stripe.com/test_8x200k2FT16s2VmdLl5J600',
  monthly: 'https://buy.stripe.com/test_cNi7sM5S5cPa1RidLl5J602',
  annual: 'https://buy.stripe.com/test_dRm3cw3JXaH27bCcHh5J601',
} as const
