import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler"
import dbConnect from "@/libs/mongodb"
import User from "@/models/User";
import { getAuthUser } from '@/libs/middleware';
import Department from "@/models/Department";
import Branch from "@/models/Branch";
import path from "path";
import { authValidation } from "@/libs/validator";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const userData = await User.findOne({ isActive: true, _id: user._id }).select('fullName email position role employeeId department employmentType branch levels joinDate managerId teamLeadId personalInfo').populate([{ path: 'department' }, path.join('branch'), path.join('managerId'), path.join('teamLeadId')]);

  return ApiResponse.success(userData, '');
});

export const PATCH = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const { error, value } = authValidation.updateProfile.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  } 

  const updatedUser = await User.findByIdAndUpdate(user._id, { $set: value }, { new: true }).select('fullName email position role employeeId department employmentType branch levels joinDate managerId teamLeadId personalInfo').populate([{ path: 'department' }, path.join('branch'), path.join('managerId'), path.join('teamLeadId')]);

  return ApiResponse.success(updatedUser, 'Profile updated successfully');
});
