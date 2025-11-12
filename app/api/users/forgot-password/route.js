import { ApiResponse, withErrorHandler } from "@/libs/errorHandler"
import dbConnect from "@/libs/mongodb";
import { authValidation } from "@/libs/validator";
import User from "@/models/User";
import { emailService } from '@/libs/emailService';
import crypto from 'crypto';

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const body = await req.json();
  const { error, value } = authValidation.forgotPassword.validate(body);

  if (error) throw new Error('Validation error: ' + error.details[0].message, 400);

  const token = crypto.randomBytes(20).toString('hex');
  const expires = new Date(Date.now() + 60 * 60 * 1000);

  // Use updateOne with strict: false to bypass schema validation
  const result = await User.updateOne(
    { email: value.email },
    {
      resetPasswordToken: token,
      resetPasswordExpires: expires
    },
    { strict: false } // This allows saving fields not in schema
  );

  if (result.matchedCount === 0) throw new Error('User does not exist', 404);

  // Fetch the updated user
  const user = await User.findOne({ email: value.email });

  await emailService.sendPasswordResetEmail(user, token);

  return ApiResponse.success({}, 'Password reset link has been sent to your email');
});