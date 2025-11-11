import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";
import Branch from "@/models/Branch";
import { authValidation } from "@/libs/validator";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const employees = await User.find().populate([{ path: 'department' }, { path: 'branch' }]).lean().select('-password');

  return ApiResponse.success(employees, '');
});

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  if (user.role !== 'admin' && user.role !== 'hr') {
    throw new AppError('Forbidden', 403);
  }

  const body = await req.json();

  const { error, value } = authValidation.registerUser.validate(body);

  if (error) throw new AppError('Validation error: ' + error.details[0].message, 400);

  const existingUser = await User.findOne({ email: value.email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // const employeeId = ,


  const createNewuser = await User.create(value);

  return ApiResponse.success(createNewuser, 'Employee created successfully');
});