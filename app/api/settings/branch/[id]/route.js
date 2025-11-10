// app/api/settings/branch/route.js
import { authValidation } from '@/libs/validator';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import Branch from '@/models/Branch';
import dbConnect from '@/libs/mongodb';
import { getAuthUser } from '@/libs/middleware';

export const PATCH = withErrorHandler(async (req, { params }) => {
  await dbConnect();

  // const { user, errors } = await getAuthUser(req)

  // if (errors) return errors;
  // if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  if (!id) {
    throw new AppError('Branch ID is required', 400);
  }

  const body = await req.json();

  // Validate input
  const { error, value } = authValidation.registerBranch.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }

  // Check if branch exists
  const existingBranch = await Branch.findById(id);
  if (!existingBranch) {
    throw new AppError('Branch not found', 404);
  }

  // Update the branch
  const updatedBranch = await Branch.findByIdAndUpdate(
    id,
    value,
    { new: true, runValidators: true } // Return updated document
  );

  return ApiResponse.created(updatedBranch, 'Branch updated successfully');
});