import express from "express";
import { createNewOrder } from "../controllers/order.controller.js";
import { auth } from "../../../middlewares/auth.js";

const router = express.Router();

router.post("/new", auth, createNewOrder);

export default router;