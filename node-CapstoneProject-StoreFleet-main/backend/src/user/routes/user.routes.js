// Please don't change the pre-written code

import express from "express";
import {
  createNewUser,
  deleteUser,
  forgetPassword,
  getAllUsers,
  getUserDetails,
  getUserDetailsForAdmin,
  logoutUser,
  resetUserPassword,
  updatePassword,
  updateUserProfile,
  updateUserProfileAndRole,
  userLogin,
} from "../controller/user.controller.js";
import { auth, authByUserRole } from "../../../middlewares/auth.js";

const router = express.Router();

// User Auth Routes
router.post("/signup", createNewUser);
router.post("/login", userLogin);
router.post("/password/forget", forgetPassword);

router.put("/password/reset/:token", resetUserPassword);
router.put("/password/update", auth, updatePassword);
router.put("/profile/update", auth, updateUserProfile);

// User Details
router.get("/details", auth, getUserDetails);
router.get("/logout", auth, logoutUser);

// Admin: Users List + Details
router.get("/admin/allusers", auth, authByUserRole("admin"), getAllUsers);
router.get(
  "/admin/details/:id",
  auth,
  authByUserRole("admin"),
  getUserDetailsForAdmin
);

// Admin: Delete User
router.delete(
  "/admin/delete/:id",
  auth,
  authByUserRole("admin"),
  deleteUser
);

// Admin: Update User Role and Profile
router.put(
  "/admin/update/:id",
  auth,
  authByUserRole("admin"),
  updateUserProfileAndRole
);

export default router;