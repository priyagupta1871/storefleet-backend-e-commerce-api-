import { createNewOrderRepo } from "../model/order.repository.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";

export const createNewOrder = async (req, res, next) => {
  try {
    const orderData = {
      ...req.body,
      user: req.user._id,
      paidAt: new Date(),
    };

    const response = createNewOrderRepo(orderData);

    res.status(201).json({
      success: true,
      msg: "Order created successfully.",
      response,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};