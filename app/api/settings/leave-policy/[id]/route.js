// app/api/leave-policies/[id]/route.js
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import { getAuthUser } from '@/libs/middleware';
import dbConnect from '@/libs/mongodb';
import { authValidation } from '@/libs/validator';
import LeavePolicy from '@/models/LeavePolicy';

export const GET = withErrorHandler(async (req, { params }) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  if (!id) {
    throw new AppError('Policy ID is required', 400);
  }

  const policy = await LeavePolicy.findById(id);

  if (!policy) {
    throw new AppError('Leave policy not found', 404);
  }

  return ApiResponse.success(policy, '');
})

// app/api/leave-policies/[id]/route.js
export const PATCH = withErrorHandler(async (req, { params }) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;
  const body = await req.json();

  if (!id) {
    throw new AppError('Policy ID is required', 400);
  }

  const { error, value } = authValidation.registerLeavePolicy.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }

  // Check if branch exists
  const existingPolicy = await LeavePolicy.findById(id);

  if (!existingPolicy) {
    throw new AppError('Policy does not exists', 404);
  }

  const policy = await LeavePolicy.findByIdAndUpdate(
    id,
    { $set: value },
    { new: true, runValidators: true }
  );

  return ApiResponse.created(policy, 'Leave Policy updated successfully');
})

// app/api/leave-policies/[id]/route.js
export const DELETE = withErrorHandler(async (req, { params }) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  if (!id) {
    throw new AppError('Policy ID is required', 400);
  }

  const policy = await LeavePolicy.findByIdAndDelete(id);

  if (!policy) {
    throw new AppError('Leave policy not found', 404);
  }

  return ApiResponse.success(policy, '');
})