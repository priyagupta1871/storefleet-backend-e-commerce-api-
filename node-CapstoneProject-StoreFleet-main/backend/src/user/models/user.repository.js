import UserModel from "./user.schema.js";

// Create new user with duplicate email handling
export const createNewUserRepo = async (user) => {
  try {
    return await new UserModel(user).save();
  } catch (err) {
    if (err.code === 11000) {
      throw new Error("email already registered");
    }
    throw err;
  }
};

// Find user (optional password selection)
export const findUserRepo = async (filter, withPassword = false) => {
  return withPassword
    ? await UserModel.findOne(filter).select("+password")
    : await UserModel.findOne(filter);
};

// Find user for password reset
export const findUserForPasswordResetRepo = async (hashToken) => {
  return await UserModel.findOne({
    resetPasswordToken: hashToken.resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
};

// Update user profile
export const updateUserProfileRepo = async (_id, data) => {
  return await UserModel.findOneAndUpdate(_id, data, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
};

// Get all users
export const getAllUsersRepo = async () => {
  return await UserModel.find({});
};

// Delete user
export const deleteUserRepo = async (_id) => {
  return await UserModel.findByIdAndDelete(_id);
};

// Admin: Update user role & other fields
export const updateUserRoleAndProfileRepo = async (_id, data) => {
  try {
    return await UserModel.findOneAndUpdate(
      _id,
      { role: data.role },
      {
        new: true,
        runValidators: true,
        useFindAndModify: false,
      }
    );
  } catch (err) {
    throw new Error(err);
  }
};