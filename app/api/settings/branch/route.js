// app/api/settings/branch/route.js
import { authValidation } from '@/libs/validator';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import Branch from '@/models/Branch';
import dbConnect from '@/libs/mongodb';
import { getAuthUser } from '@/libs/middleware';


// list all branch
export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const branch = await Branch.find({ isActive: true });

  return ApiResponse.success(branch, '');
});

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();

  // Validate input
  const { error, value } = authValidation.registerBranch.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }
  // Check for duplicates
  const existingUser = await Branch.findOne({ name: value.name.toLowerCase() });

  if (existingUser) {
    throw new AppError('name already registered', 409);
  }

  // Use validatedData to create user
  const branch = await Branch.create(value);

  return ApiResponse.created(branch, 'Branch created successfully');
});
