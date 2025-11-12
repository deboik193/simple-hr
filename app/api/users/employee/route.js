import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import Department from "@/models/Department";
import Branch from "@/models/Branch";
import { authValidation } from "@/libs/validator";
import { hashPassword } from "@/libs/auth";
import InitialLeaveBalance from "@/models/InitialLeaveBalance";
import { LEAVETYPE } from "@/constant/constant";
import { emailService } from "@/libs/emailService";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const employees = await User.find().populate([{ path: 'department' }, { path: 'branch' }, {
    path: 'managerId'
  }]).lean().sort({ createdAt: -1 }).select('-password -resetPasswordToken -resetPasswordExpires');

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

  //  Count total users (or employees)
  const employeeCount = await User.countDocuments();

  //  Generate next employee ID
  const employeeId = `${value.fullName?.split(' ').map(n => n[0]).join('') }${String(employeeCount + 1).padStart(3, '0')}`;
  const password = await hashPassword(employeeId.toLocaleLowerCase());

  const InitialBalance = await InitialLeaveBalance.findOne({ _id: '68ff46338509515e3f0f46ac' }); // Replace with actual ID or criteria

  const leaveBalance = LEAVETYPE.reduce((acc, type) => {
    acc[type] = InitialBalance[type];
    return acc;
  }, {})
  
  //  Add employeeId to user data before saving
  const createNewUser = await User.create({
    ...value,
    employeeId,
    password,
    leaveBalance
  });
  
  await emailService.sendWelcomeEmail(createNewUser);

  return ApiResponse.success(createNewUser, 'Employee created successfully');
});