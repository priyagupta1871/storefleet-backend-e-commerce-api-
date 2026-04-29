import OrderModel from "./order.schema.js";
import mongoose from "mongoose";

export const createNewOrderRepo = async (data) => {
  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    // Update stock for each ordered item
    for (const item of data.orderedItems) {
      const product = item.product;

      product.stock -= item.quantity;

      if (product.stock < 0) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
      }

      await product.save({ session });
    }

    // Create the order record
    const order = new OrderModel(data);
    const savedOrder = await order.save({ session });

    await session.commitTransaction();
    return savedOrder;

  } catch (error) {
    await session.abortTransaction();
    throw new Error(error.message || error);

  } finally {
    session.endSession();
  }
};