import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
    try {
        const { amount, currency = 'mad' } = await request.json();

        // Create a PaymentIntent with the specific amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Stripe expects amount in cents (e.g., 100 MAD = 10000 cents)
            currency: currency,
            automatic_payment_methods: {
                enabled: true,
            },
            metadata: {
                integration_check: 'accept_a_payment',
            },
        });

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
