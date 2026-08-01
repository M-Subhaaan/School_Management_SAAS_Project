const stripe = require("../utils/stripe");
const env = require("../config/env");

const { sequelize } = require("../config/db");

const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const Payment = require("../models/paymentModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

const handleCheckoutCompleted = async (session) => {
  const transaction = await sequelize.transaction();

  try {
    const { accountId, subscriptionId, planId } = session.metadata;

    const subscription = await Subscription.findByPk(subscriptionId, {
      transaction,
    });

    if (!subscription) {
      await transaction.rollback();
      return AppError("Subscription not found", 404);
    }

    const plan = await SubscriptionPlan.findByPk(planId, {
      transaction,
    });

    if (!plan) {
      await transaction.rollback();
      return AppError("Plan not found", 404);
    }

    // Retrieve Stripe Subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(
      session.subscription,
    );

    const subscriptionItem = stripeSubscription.items?.data?.[0];

    if (!subscriptionItem) {
      return AppError("Subscription item not found", 404);
    }

    // Update Subscription
    await subscription.update(
      {
        planId: plan.id,

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

    // Create Payment History
    await Payment.create(
      {
        accountId,

        subscriptionId: subscription.id,

        stripePaymentIntentId: session.payment_intent,

        stripeInvoiceId: stripeSubscription.latest_invoice,

        amount: session.amount_total / 100,

        currency: session.currency,

        paymentMethod: "CARD",

        status: "SUCCEEDED",

        paidAt: new Date(),
      },
      {
        transaction,
      },
    );

    await transaction.commit();

    console.log("Subscription upgraded successfully.");
  } catch (error) {
    await transaction.rollback();
    console.error(error);
  }
};

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

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({
    received: true,
  });
});
