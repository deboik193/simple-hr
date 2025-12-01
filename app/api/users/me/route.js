import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler"
import dbConnect from "@/libs/mongodb"
import User from "@/models/User";
import { getAuthUser } from '@/libs/middleware';
import Department from "@/models/Department";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const userData = await User.findOne({ isActive: true, _id: user._id }).select('fullName email position role employeeId department').populate({ path: 'department' });

  return ApiResponse.success(userData, '');
});