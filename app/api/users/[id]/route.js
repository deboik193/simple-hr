import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler"
import dbConnect from "@/libs/mongodb"
import User from "@/models/User";
import { getAuthUser } from '@/libs/middleware';

// list all manager
export const GET = withErrorHandler(async (req, {params}) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  const role = params.role

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const userData = await User.find({ role, isActive: true }).select('fullName email position role');

  return ApiResponse.success(userData, '');
});