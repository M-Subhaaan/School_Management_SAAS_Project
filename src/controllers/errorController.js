const AppError = require("../utils/appError");

const handleValidationErrorDB = (err) => {
  const errors = err.errors.map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return AppError(message, 400);
};

const handleUniqueConstraintErrorDB = (err) => {
  const detail = err.errors && err.errors[0];
  const field =
    (detail && detail.path) ||
    (Array.isArray(err.fields)
      ? err.fields[0]
      : Object.keys(err.fields || {})[0]) ||
    "field";
  const value = detail && detail.value !== undefined ? detail.value : "";

  const message = `Duplicate field value: ${field} = '${value}'. Please use another value!`;
  return AppError(message, 400);
};

const handleForeignKeyConstraintErrorDB = (err) => {
  const code =
    (err.original && err.original.code) || (err.parent && err.parent.code);
  const table = err.table ? ` in "${err.table}"` : "";

  if (code === "ER_NO_REFERENCED_ROW_2" || code === "ER_NO_REFERENCED_ROW") {
    return AppError(
      `Invalid reference${table}: the related record does not exist.`,
      400,
    );
  }

  if (code === "ER_ROW_IS_REFERENCED_2" || code === "ER_ROW_IS_REFERENCED") {
    return AppError(
      `Cannot complete this action: the record is still referenced by other data${table}.`,
      400,
    );
  }

  return AppError(
    `Invalid reference${table}: a related record constraint was violated.`,
    400,
  );
};

const handleDatabaseErrorDB = (err) => {
  const code =
    (err.original && err.original.code) || (err.parent && err.parent.code);

  switch (code) {
    case "ER_DATA_TOO_LONG":
      return AppError(
        "One of the provided values is too long for its field.",
        400,
      );
    case "ER_BAD_NULL_ERROR":
      return AppError("A required field is missing.", 400);
    case "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD":
    case "WARN_DATA_TRUNCATED":
      return AppError("One of the provided values has an invalid format.", 400);
    case "ER_NO_DEFAULT_FOR_FIELD":
      return AppError("A required field was not provided.", 400);
    default:
      return err;
  }
};

const handleTimeoutErrorDB = () =>
  AppError("The database operation timed out. Please try again.", 503);

const handleOptimisticLockErrorDB = () =>
  AppError(
    "This record was changed by someone else before your update. Please refresh and try again.",
    409,
  );

const handleEmptyResultErrorDB = () =>
  AppError("No record found with the given criteria.", 404);

const CONNECTION_ERROR_NAMES = [
  "SequelizeConnectionError",
  "SequelizeConnectionRefusedError",
  "SequelizeAccessDeniedError",
  "SequelizeHostNotFoundError",
  "SequelizeHostNotReachableError",
  "SequelizeInvalidConnectionError",
  "SequelizeConnectionTimedOutError",
  "SequelizeConnectionAcquireTimeoutError",
];

const handleConnectionErrorDB = () =>
  AppError(
    "Unable to connect to the database right now. Please try again shortly.",
    503,
  );

const handleJWTError = () =>
  AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  AppError("Your token has expired! Please log in again.", 401);

const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return AppError("File is too large! Maximum size 5MB.", 400);
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return AppError("Too many files! Maximum 5 files allowed.", 400);
  }
  return AppError(err.message, 400);
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR 💥", err);
    res.status(500).json({
      status: "error",
      message: "Something went wrong!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "ERROR";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    let error = { ...err, message: err.message };

    if (error.name === "SequelizeValidationError")
      error = handleValidationErrorDB(error);
    if (error.name === "SequelizeUniqueConstraintError")
      error = handleUniqueConstraintErrorDB(error);
    if (error.name === "SequelizeForeignKeyConstraintError")
      error = handleForeignKeyConstraintErrorDB(error);
    if (error.name === "SequelizeDatabaseError")
      error = handleDatabaseErrorDB(error);
    if (error.name === "SequelizeTimeoutError") error = handleTimeoutErrorDB();
    if (error.name === "SequelizeOptimisticLockError")
      error = handleOptimisticLockErrorDB();
    if (error.name === "SequelizeEmptyResultError")
      error = handleEmptyResultErrorDB();
    if (CONNECTION_ERROR_NAMES.includes(error.name))
      error = handleConnectionErrorDB();
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (error.name === "MulterError") error = handleMulterError(error);

    sendErrorProd(error, res);
  }
};
