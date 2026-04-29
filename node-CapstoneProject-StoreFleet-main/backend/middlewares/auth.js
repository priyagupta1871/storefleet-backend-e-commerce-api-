import jwt from "jsonwebtoken";
import { ErrorHandler } from "../utils/errorHandler.js";
import UserModel from "../src/user/models/user.schema.js";

export const auth = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return next(new ErrorHandler(401, "Authentication required to access this route."));
  }

  try {
    const decoded = jwt.verify(token, "storefleetbyvivek");
    req.user = await UserModel.findById(decoded.id);
    next();
  } catch (err) {
    return next(new ErrorHandler(401, "Invalid or expired authentication token."));
  }
};

export const authByUserRole = (...roles) => {
  return async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorHandler(
          403,
          `Access denied: Your role (${req.user.role}) does not have permission.`
        )
      );
    }
    next();
  };
};