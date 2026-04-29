import express from "express";
import {
  addNewProduct,
  deleteProduct,
  deleteReview,
  getAllProducts,
  getAllReviewsOfAProduct,
  getProductDetails,
  rateProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

const router = express.Router();

// Public Routes
router.get("/products", getAllProducts);
router.get("/details/:id", getProductDetails);
router.get("/reviews/:id", getAllReviewsOfAProduct);

// Admin: Add & Update
router.post("/add", auth, authByUserRole("admin"), addNewProduct);
router.put("/update/:id", auth, authByUserRole("admin"), updateProduct);

// Admin: Delete Product
router.delete("/delete/:id", auth, authByUserRole("admin"), deleteProduct);

// User: Rate & Delete Review
router.put("/rate/:id", auth, rateProduct);
router.delete("/review/delete", auth, deleteReview);

export default router;