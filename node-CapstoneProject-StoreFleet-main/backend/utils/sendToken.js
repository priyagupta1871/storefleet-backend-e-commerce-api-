// Generate JWT token and store it in an HTTP‑only cookie
export const sendToken = async (user, res, statusCode) => {
  const token = user.getJWTToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    httpOnly: true,
  };

  return res
    .status(statusCode)
    .cookie("token", token, cookieOptions)
    .json({ success: true, user, token });
};