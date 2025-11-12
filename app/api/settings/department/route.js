// app/api/settings/branch/route.js
import { authValidation } from '@/libs/validator';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import dbConnect from '@/libs/mongodb';
import { getAuthUser } from '@/libs/middleware';
import Department from '@/models/Department';

// list all branch
export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const branch = await Department.find({ isActive: true });

  return ApiResponse.success(branch, '');
});

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();

  // Validate input
  const { error, value } = authValidation.registerDepartment.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }

  // Check for duplicates
  const existingUser = await Department.findOne({ name: value.name.toLowerCase() });

  if (existingUser) {
    throw new AppError('name already registered', 409);
  }

  // Use validatedData to create user
  const dept = await Department.create(value);

  return ApiResponse.created(dept, 'Department created successfully');
});
