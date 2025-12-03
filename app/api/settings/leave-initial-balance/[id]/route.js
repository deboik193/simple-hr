// app/api/settings/leave-initial-balance/route.js
import { authValidation } from '@/libs/validator';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import InitialBalance from '@/models/InitialLeaveBalance';
import dbConnect from '@/libs/mongodb';
import { getAuthUser } from '@/libs/middleware';

export const PATCH = withErrorHandler(async (req, { params }) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  if (!id) {
    throw new AppError('initial balance ID is required', 400);
  }

  const body = await req.json();

  const { error, value } = authValidation.registerLeaveInitialBalance.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }

  // Check if branch exists
  const existingInitialBalance = await InitialBalance.findById(id);
  if (!existingInitialBalance) {
    throw new AppError('Initial balance not found', 404);
  }

  // Use validatedData to initial balance
  const initialBalance = await InitialBalance.findByIdAndUpdate(
    id,
    value,
    { new: true, runValidators: true } // Return updated document
  );

  return ApiResponse.success(initialBalance, 'leave initial balance updated successfully');
});