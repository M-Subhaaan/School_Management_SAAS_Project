const express = require("express");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: {
    status: "fail",
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const webhookRouter = require("./routes/webhookRouter");
app.use("/api/v1/webhooks", webhookRouter);

app.use(express.json());

const subscriptionPlanRouter = require("./routes/subscriptionPlanRouter");
app.use("/api/v1/subscription-plans", subscriptionPlanRouter);

const accountRouter = require("./routes/accountRouter");
app.use("/api/v1/accounts", accountRouter);

const authRouter = require("./routes/authRouter");
app.use("/api/v1/auth", authLimiter, authRouter);

const subscriptionRouter = require("./routes/subscriptionRouter");
app.use("/api/v1/subscriptions", subscriptionRouter);

const schoolRouter = require("./routes/schoolRouter");
app.use("/api/v1/schools", schoolRouter);

const teacherRouter = require("./routes/teacherRouter");
app.use("/api/v1/teachers", teacherRouter);

const studentRouter = require("./routes/studentRouter");
app.use("/api/v1/students", studentRouter);

const academicYearRouter = require("./routes/academicYearRouter");
app.use("/api/v1/academic-years", academicYearRouter);

const academicTermRouter = require("./routes/academicTermRouter");
app.use("/api/v1/academic-terms", academicTermRouter);

app.use((req, res, next) => {
  return next(
    AppError(`Unable to find ${req.originalUrl} on this Server`, 404),
  );
});

app.use(globalErrorHandler);

module.exports = app;
