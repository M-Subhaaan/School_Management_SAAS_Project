const Stripe = require("stripe");
const env = require("../config/env");

const stripe = new Stripe(env.stripe.secretKey);

module.exports = stripe;
