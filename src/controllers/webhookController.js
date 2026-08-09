const stripe = require("../utils/stripe");
const env = require("../config/env");

const { sequelize } = require("../config/db");

const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const Payment = require("../models/paymentModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const handleCheckoutCompleted = catchAsync(async (session) => {
  const transaction = await sequelize.transaction();

  try {
    const { subscriptionId, planId } = session.metadata;

    const subscription = await Subscription.findByPk(subscriptionId, {
      transaction,
    });

    if (!subscription) {
      throw AppError("Subscription not found", 404);
    }

    const plan = await SubscriptionPlan.findByPk(planId, {
      transaction,
    });

    if (!plan) {
      throw AppError("Plan not found", 404);
    }

    // Retrieve Stripe Subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription,
    );

    const subscriptionItem = stripeSubscription.items?.data?.[0];

    if (!subscriptionItem) {
      throw AppError("Subscription item not found", 404);
    }

    // Update Subscription
    await subscription.update(
      {
        planId: plan.id,
        stripeCustomerId: stripeSubscription.customer,

        stripeSubscriptionId: stripeSubscription.id,

        status: "ACTIVE",

        currentPeriodStart: new Date(
          subscriptionItem.current_period_start * 1000,
        ),

        currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    console.log("Subscription upgraded successfully.");
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
});

const handleInvoicePaid = catchAsync(async (invoice) => {
  const transaction = await sequelize.transaction();

  try {
    // Prevent duplicate processing
    const existingPayment = await Payment.findOne({
      where: {
        stripeInvoiceId: invoice.id,
      },
      transaction,
    });

    if (existingPayment) {
      console.log("Invoice already processed.");

      await transaction.commit();

      return;
    }

    // Retrieve Stripe Subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      invoice.subscription,
    );

    const subscriptionItem = stripeSubscription.items?.data?.[0];

    if (!subscriptionItem) {
      throw AppError("Subscription Item not found", 404);
    }

    // Find Local Subscription
    const subscription = await Subscription.findOne({
      where: {
        stripeSubscriptionId: stripeSubscription.id,
      },
      transaction,
    });

    if (!subscription) {
      throw AppError("Subscription not found", 404);
    }

    // Update Billing Period
    await subscription.update(
      {
        status: "ACTIVE",

        currentPeriodStart: new Date(
          subscriptionItem.current_period_start * 1000,
        ),

        currentPeriodEnd: new Date(subscriptionItem.current_period_end * 1000),
      },
      {
        transaction,
      },
    );

    // Create Payment Record
    await Payment.create(
      {
        accountId: subscription.accountId,

        subscriptionId: subscription.id,

        stripeInvoiceId: invoice.id,

        stripePaymentIntentId: invoice.payment_intent,

        amount: invoice.amount_paid / 100,

        currency: invoice.currency,

        paymentMethod: "CARD",

        status: invoice.paid ? "SUCCEEDED" : "FAILED",

        paidAt: new Date(invoice.status_transitions.paid_at * 1000),
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    console.log("Invoice Paid Successfully.");
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
});

exports.stripeWebhook = catchAsync(async (req, res, next) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripe.webhookSecret,
    );
  } catch (err) {
    return next(AppError(`Webhook Error: ${err.message}`, 400));
  }

  switch (event.type) {
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object);
      break;

    case "invoice.paid":
      await handleInvoicePaid(event.data.object);
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({
    received: true,
  });
});
