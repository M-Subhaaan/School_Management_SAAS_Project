const User = require("../models/userModel");
const Account = require("../models/accountModel");
const Subscription = require("../models/subscriptionModel");
const SubscriptionPlan = require("../models/subscriptionPlanModel");

// User → Account
User.hasOne(Account, {
  foreignKey: "ownerId",
  as: "account",
});

Account.belongsTo(User, {
  foreignKey: "ownerId",
  as: "owner",
});

// Account → Subscription
Account.hasOne(Subscription, {
  foreignKey: "accountId",
  as: "subscription",
});

Subscription.belongsTo(Account, {
  foreignKey: "accountId",
  as: "account",
});

// Subscription → Plan
Subscription.belongsTo(SubscriptionPlan, {
  foreignKey: "planId",
  as: "plan",
});

SubscriptionPlan.hasMany(Subscription, {
  foreignKey: "planId",
  as: "subscriptions",
});

module.exports = {
  User,
  Account,
  Subscription,
  SubscriptionPlan,
};
