import { generateToken, verifyPassword } from "@/libs/auth";
import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import { authValidation } from "@/libs/validator";
import User from "@/models/User";

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const body = await req.json();

  // Validate input
  const { error, value } = authValidation.login.validate(body);

  if (error) throw new AppError('Validation error: ' + error.details[0].message, 400);

  const user = await User.findOne({ email: value.email });

  if (!user) throw new AppError('User does not exist', 404);

  const verifyPwd = await verifyPassword(value.password, user.password);

  if (!verifyPwd) throw new AppError('User Password is incorrect', 400);
  else if (user.isActive === false) throw new AppError('Your account has been deactivated', 403);

  const token = generateToken(user);

  return ApiResponse.success({ token });
})