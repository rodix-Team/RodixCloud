// Stripe client for server-side operations
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY is not defined!');
    throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

console.log('✅ Stripe Secret Key found:', process.env.STRIPE_SECRET_KEY.substring(0, 20) + '...');

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
});
