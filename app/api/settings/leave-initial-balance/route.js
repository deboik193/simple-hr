// app/api/settings/leave-initial-balance/route.js
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import InitialBalance from '@/models/InitialLeaveBalance';
import dbConnect from '@/libs/mongodb';
import { getAuthUser } from '@/libs/middleware';

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const data = await InitialBalance.find();

  return ApiResponse.success(data, '');
});
