import express from "express";
import dotenv from "dotenv";
import path from "path";
import cookieParser from "cookie-parser";

import productRoutes from "./src/product/routes/product.routes.js";
import userRoutes from "./src/user/routes/user.routes.js";
import orderRoutes from "./src/order/routes/order.routes.js";

import {
  errorHandlerMiddleware,
} from "./middlewares/errorHandlerMiddleware.js";

const envPath = path.resolve("backend", "config", "uat.env");
dotenv.config({ path: envPath });

const app = express();

app.use(express.json());
app.use(cookieParser());

// Route bindings
app.use("/api/storefleet/product", productRoutes);
app.use("/api/storefleet/user", userRoutes);
app.use("/api/storefleet/order", orderRoutes);

// Error middleware
app.use(errorHandlerMiddleware);

export default app;