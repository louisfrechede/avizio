import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import prisma from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' as any });

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;
        const businessId = session.metadata?.businessId;

        if (businessId) {
          // Determine plan from price
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId === process.env.STRIPE_PRICE_PRO ? 'PRO' : 'ESSENTIAL';

          await prisma.business.update({
            where: { id: businessId },
            data: {
              stripeCustomerId: customerId,
              stripeSubscriptionId: subscriptionId,
              plan,
              smsQuota: plan === 'PRO' ? 300 : 100,
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (business) {
          const priceId = subscription.items.data[0]?.price.id;
          const plan = priceId === process.env.STRIPE_PRICE_PRO ? 'PRO' : 'ESSENTIAL';
          await prisma.business.update({
            where: { id: business.id },
            data: { plan, smsQuota: plan === 'PRO' ? 300 : 100 },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const business = await prisma.business.findFirst({
          where: { stripeSubscriptionId: subscription.id },
        });
        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: { plan: 'TRIAL', smsQuota: 0, stripeSubscriptionId: null },
          });
        }
        break;
      }

      case 'invoice.paid': {
        // Reset monthly SMS counter on successful payment
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const business = await prisma.business.findFirst({
          where: { stripeCustomerId: customerId },
        });
        if (business) {
          await prisma.business.update({
            where: { id: business.id },
            data: { smsUsed: 0 },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
