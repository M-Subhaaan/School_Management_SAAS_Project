const Subscription = require("../models/subscriptionModel");
const Account = require("../models/accountModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");
const User = require("../models/userModel");

const stripe = require("../utils/stripe");
const { encrypt, decrypt } = require("../utils/encryption");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

exports.getMySubscription = catchAsync(async (req, res, next) => {
  const subscription = await Subscription.findOne({
    include: [
      {
        model: Account,
        as: "account",
        where: {
          ownerId: req.user.id,
        },
        attributes: ["id", "name", "slug", "status"],
      },

      {
        model: SubscriptionPlan,
        as: "plan",
        attributes: [
          "id",
          "name",
          "price",
          "billingCycle",
          "maxSchools",
          "maxTeachers",
          "maxStudents",
        ],
      },
    ],
  });

  if (!subscription) {
    return next(AppError("Subscription not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      subscription,
    },
  });
});

exports.createCheckoutSession = catchAsync(async (req, res, next) => {
  let { plan } = req.body;

  plan = plan.toUpperCase();

  const account = await Account.findOne({
    where: {
      ownerId: req.user.id,
    },
    include: [
      {
        model: Subscription,
        as: "subscription",
      },
    ],
  });

  if (!account) {
    return next(AppError("Account not found", 404));
  }

  const subscription = account.subscription;

  if (!subscription) {
    return next(AppError("Subscription not found", 404));
  }

  const selectedPlan = await SubscriptionPlan.findOne({
    where: {
      name: plan,
    },
  });

  if (!selectedPlan) {
    return next(AppError("Subscription plan not found", 404));
  }

  if (!selectedPlan.stripePriceId) {
    return next(AppError("Stripe Price ID not configured", 400));
  }

  const user = await User.findByPk(req.user.id);

  const decryptedEmail = await decrypt(user.emailEncrypted);

  let stripeCustomerId = subscription.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      name: `${user.firstName} ${user.lastName}`,
      email: decryptedEmail,
    });

    stripeCustomerId = customer.id;
  }

  await subscription.update({
    stripeCustomerId,
  });

  // Create checkout session

  const session = await stripe.checkout.sessions.create({
    customer: stripeCustomerId,

    payment_method_types: ["card"],

    mode: "subscription",

    line_items: [
      {
        price: selectedPlan.stripePriceId,
        quantity: 1,
      },
    ],

    success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,

    cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,

    metadata: {
      accountId: account.id,
      subscriptionId: subscription.id,
      planId: selectedPlan.id,
    },
  });

  res.status(200).json({
    status: "Success",
    data: {
      sessionId: session.id,
      checkoutUrl: session.url,
    },
  });
});
