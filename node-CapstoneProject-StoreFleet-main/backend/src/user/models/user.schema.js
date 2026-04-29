import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "user name is required"],
    maxLength: [30, "user name cannot exceed 30 characters"],
    minLength: [2, "name should have at least 2 characters"],
  },

  email: {
    type: String,
    required: [true, "user email is required"],
    unique: true,
    validate: [validator.isEmail, "please enter a valid email"],
  },

  password: {
    type: String,
    required: [true, "please enter your password"],
    select: false,
  },

  profileImg: {
    public_id: {
      type: String,
      required: true,
      default: "1234567890",
    },
    url: {
      type: String,
      required: true,
      default: "this is dummy avatar url",
    },
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Generate JWT Token
userSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, "storefleetbyvivek", {
    expiresIn: "1d",
  });
};

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate Password Reset Token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

const UserModel = mongoose.model("User", userSchema);
export default UserModel;