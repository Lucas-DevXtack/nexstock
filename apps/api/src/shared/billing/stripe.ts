import Stripe from 'stripe';
import { env } from '../../config/env.js';

export const stripe = env.STRIPE_SECRET_KEY
  ? new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

export function ensureStripe() {
  if (!stripe) throw new Error('Stripe not configured (STRIPE_SECRET_KEY)');
  return stripe;
}

export function priceForPlan(plan: 'PRO'|'BUSINESS') {
  if (plan === 'PRO') return env.STRIPE_PRICE_PRO;
  return env.STRIPE_PRICE_BUSINESS;
}

export function planForPrice(priceId?: string | null): 'FREE'|'PRO'|'BUSINESS' {
  if (!priceId) return 'FREE';
  if (priceId === env.STRIPE_PRICE_BUSINESS) return 'BUSINESS';
  if (priceId === env.STRIPE_PRICE_PRO) return 'PRO';
  return 'FREE';
}
