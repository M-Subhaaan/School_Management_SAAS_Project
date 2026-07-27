const express = require("express");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(express.json());

app.use(helmet());

const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter");
app.use("/api/v1/subscription-plans", subscriptionPlanRouter);

const accountRouter = require("./routes/accountRouter");
app.use("/api/v1/accounts", accountRouter);

const authRouter = require("./routes/authRouter");
app.use("/api/v1/auth", authRouter);

const subscriptionRouter = require("./routes/subscriptionRouter");
app.use("/api/v1/subscriptions", subscriptionRouter);

app.use((req, res, next) => {
  return next(
    AppError(`Unable to find ${req.originalUrl} on this Server`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
