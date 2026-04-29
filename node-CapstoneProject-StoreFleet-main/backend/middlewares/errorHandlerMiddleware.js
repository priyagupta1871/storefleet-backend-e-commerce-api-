import { ErrorHandler } from "../utils/errorHandler.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  const message = err.message || "An unexpected server error occurred.";
  const status = err.statusCode || 500;

  res.status(status).json({
    success: false,
    error: message,
  });

  next();
};

export const handleUncaughtError = () => {
  process.on("uncaughtException", (err) => {
    console.error(`Unexpected Error: ${err}`);
    console.error("Server shutting down due to an unhandled exception.");
  });
};