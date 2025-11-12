import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import { authValidation } from "@/libs/validator";

export const PATCH = withErrorHandler(async (req, { params }) => {
  await dbConnect();

  const id = params.id;

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

  if (!existingUser) {
    throw new AppError('User does not exist', 404);
  }

  //  Add employeeId to user data before saving
  const updatedNewUser = await User.findByIdAndUpdate(id, value, { new: true, runValidators: true });


  return ApiResponse.success(updatedNewUser, 'Employee updated successfully');
});

export const DELETE = withErrorHandler(async (req, { params }) => {
  await dbConnect();

  const id = params.id;

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  if (user.role !== 'admin' && user.role !== 'hr') {
    throw new AppError('Forbidden', 403);
  }

  const existingUser = await User.findOne({ _id: id });

  if (!existingUser) {
    throw new AppError('User does not exist', 404);
  }

  await User.findByIdAndDelete(id);

  return ApiResponse.success({}, 'Employee deleted successfully');
});