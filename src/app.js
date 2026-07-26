const express = require("express");
const helmet = require("helmet");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(express.json());

app.use(helmet());

const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter");
app.use("/api/v1/subscription-plans", subscriptionPlanRouter);

app.use((req, res, next) => {
  return next(
    AppError(`Unable to find ${req.originalUrl} on this Server`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
