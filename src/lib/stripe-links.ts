/**
 * Stripe Payment Links - single source of truth
 * Used everywhere subscription/upgrade is offered (all languages, all pages)
 */
export const STRIPE_PAYMENT_LINKS = {
  weekly: 'https://buy.stripe.com/cNifZi6XI6tR2AmdURejK02',
  monthly: 'https://buy.stripe.com/cNi6oI81McSf5MybMJejK01',
  annual: 'https://buy.stripe.com/eVq14o1Do2dBa2O6spejK00',
} as const
