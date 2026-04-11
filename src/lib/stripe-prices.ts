import type { Plan, PlanTier } from '@/types'

export const STRIPE_PRICE_IDS: Record<Exclude<Plan, 'free'>, Record<PlanTier, string>> = {
  automate: {
    essential: 'price_1TJ1Qd4Y1unNvKtXg0D4EwNl',
    pro: 'price_1TJ1Qd4Y1unNvKtXxPBnMHH6',
    max: 'price_1TJ1Qe4Y1unNvKtXbW6i1dbb',
  },
  create: {
    essential: 'price_1TJ1Qf4Y1unNvKtXJ4AermBW',
    pro: 'price_1TJ1Qg4Y1unNvKtXGDtTEGVI',
    max: 'price_1TJ1Qh4Y1unNvKtX9nRkx5iU',
  },
  build: {
    essential: 'price_1TJ1Qi4Y1unNvKtX5A9jRzzz',
    pro: 'price_1TJ1Qj4Y1unNvKtXFXeoz1PH',
    max: 'price_1TJ1Qk4Y1unNvKtX4cq6L73s',
  },
  complete: {
    essential: 'price_1TJ1Ql4Y1unNvKtXe0NQ6Mws',
    pro: 'price_1TJ1Qm4Y1unNvKtXVAlGNlmC',
    max: 'price_1TJ1Qn4Y1unNvKtXXu1OPZNx',
  },
}
