// Please don't change the pre-written code

import { sendPasswordResetEmail } from "../../../utils/emails/passwordReset.js";
import { sendWelcomeEmail } from "../../../utils/emails/welcomeMail.js";
import { ErrorHandler } from "../../../utils/errorHandler.js";
import { sendToken } from "../../../utils/sendToken.js";
import UserModel from "../models/user.schema.js";

import {
  createNewUserRepo,
  deleteUserRepo,
  findUserForPasswordResetRepo,
  findUserRepo,
  getAllUsersRepo,
  updateUserProfileRepo,
  updateUserRoleAndProfileRepo,
} from "../models/user.repository.js";

import crypto from "crypto";
import mongoose from "mongoose";

// Create User
export const createNewUser = async (req, res, next) => {
  try {
    const newUser = await createNewUserRepo(req.body);
    await sendToken(newUser, res, 200);
    await sendWelcomeEmail(newUser);
  } catch (err) {
    return next(new ErrorHandler(400, err.message || err));
  }
};

// Login
export const userLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new ErrorHandler(400, "please enter email/password"));
    }

    const user = await findUserRepo({ email }, true);
    if (!user) {
      return next(new ErrorHandler(401, "user not found! register yourself now!!"));
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Invalid email or passswor!"));
    }

    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Logout
export const logoutUser = async (req, res) => {
  res
    .status(200)
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .json({ success: true, msg: "logout successful" });
};

// Forgot Password
export const forgetPassword = async (req, res, next) => {
  try {
    const user = await findUserRepo({ email: req.body.email });
    if (!user) {
      return next(new ErrorHandler(404, "User not found!"));
    }

    const resetToken = await user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:3000/api/storefleet/user/password/reset/${resetToken}`;

    await sendPasswordResetEmail(user, resetUrl);

    res.status(200).json({
      success: true,
      msg: "password reset link sent to your email",
    });
  } catch (err) {
    return next(new ErrorHandler(400, err.message || err));
  }
};

// Reset Password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { token } = req.params;

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await findUserForPasswordResetRepo({ resetPasswordToken }, true);

    if (!user) {
      return next(new ErrorHandler(400, "Invalid token"));
    }
    if (user.resetPasswordExpire < Date.now()) {
      return next(new ErrorHandler(400, "Token has expired"));
    }
    if (req.body.password !== req.body.confirmPassword) {
      return next(new ErrorHandler(400, "Passwords don't match"));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, msg: "Password updated" });
  } catch (err) {
    return next(new ErrorHandler(500, err.message));
  }
};

// Logged‑in User Details
export const getUserDetails = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.user._id });
    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

// Update Password
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword) {
      return next(new ErrorHandler(401, "pls enter current password"));
    }

    const user = await findUserRepo({ _id: req.user._id }, true);
    const passwordMatch = await user.comparePassword(currentPassword);

    if (!passwordMatch) {
      return next(new ErrorHandler(401, "Incorrect current password!"));
    }

    if (!newPassword || newPassword !== confirmPassword) {
      return next(
        new ErrorHandler(401, "mismatch new password and confirm password!")
      );
    }

    user.password = newPassword;
    await user.save();
    await sendToken(user, res, 200);
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Update Profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const updatedUserDetails = await updateUserProfileRepo(req.user._id, {
      name: req.body.name,
      email: req.body.email,
    });

    res.status(201).json({
      success: true,
      updatedUserDetails,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};

// Admin: List All Users
export const getAllUsers = async (req, res, next) => {
  try {
    const allUsers = await getAllUsersRepo();
    res.status(200).json({ success: true, allUsers });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

// Admin: Get User Details
export const getUserDetailsForAdmin = async (req, res, next) => {
  try {
    const userDetails = await findUserRepo({ _id: req.params.id });

    if (!userDetails) {
      return res.status(400).json({
        success: false,
        msg: "no user found with provided id",
      });
    }

    res.status(200).json({ success: true, userDetails });
  } catch (error) {
    return next(new ErrorHandler(500, error));
  }
};

// Admin: Delete User
export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await deleteUserRepo(req.params.id);

    if (!deletedUser) {
      return res.status(400).json({
        success: false,
        msg: "no user found with provided id",
      });
    }

    res.status(200).json({
      success: true,
      msg: "user deleted successfully",
      deletedUser,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error));
  }
};

// Admin: Update role & profile
export const updateUserProfileAndRole = async (req, res, next) => {
  try {
    const { name, email, role } = req.body;
    const { id } = req.params;

    const objectId = new mongoose.Types.ObjectId(id);

    const updatedUserDetails = await updateUserRoleAndProfileRepo(objectId, {
      name,
      email,
      role,
    });

    res.status(200).json({
      success: true,
      msg: "role updated successfully",
      updatedUserDetails,
    });
  } catch (error) {
    return next(new ErrorHandler(400, error.message || error));
  }
};