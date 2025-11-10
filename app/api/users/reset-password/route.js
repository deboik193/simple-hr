
import { hashPassword } from "@/libs/auth";
import { ApiResponse, withErrorHandler } from "@/libs/errorHandler"
import dbConnect from "@/libs/mongodb";
import { authValidation } from "@/libs/validator";
import User from "@/models/User";

export const POST = withErrorHandler(async (req) => {

  await dbConnect();
  const body = await req.json();

  const { error, value } = authValidation.resetPassword.validate(body);
  if (error) throw new Error('Validation error: ' + error.details[0].message, 400);

  const user = await User.findOne({ resetPasswordToken: value.token });

  if (!user) throw new Error('Invalid or expired password reset token', 400);

  if (user.resetPasswordExpires < Date.now()) {
    // Clear the token and expiry if the token is expired
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save(); // Ensure you save the changes to the database
    throw new Error('Token has expired', 400)
  }

  const hashedPassword = await hashPassword(value.newPassword);

  user.password = hashedPassword;
  user.resetPasswordToken = undefined;
  await user.save();

  return ApiResponse.success({}, 'Password has been reset successfully');
});
