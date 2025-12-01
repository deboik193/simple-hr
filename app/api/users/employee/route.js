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
import LeaveBalance from "@/models/LeaveBalance";
import LeavePolicy from "@/models/LeavePolicy";

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
  const employeeId = `${value.fullName?.split(' ').map(n => n[0]).join('')}${String(employeeCount + 1).padStart(3, '0')}`;
  const password = await hashPassword(employeeId.toLocaleLowerCase());

  const InitialBalance = await InitialLeaveBalance.findOne({ _id: '68ff46338509515e3f0f46ac' }); // Replace with actual ID or criteria

  const leaveBalance = LEAVETYPE.reduce((acc, type) => {
    acc[type] = InitialBalance[type];
    return acc;
  }, {})

  //  1. Add employeeId to user data before saving
  const createNewUser = await User.create({
    ...value,
    employeeId,
    password,
    leaveBalance
  });

  // 2. Get active leave policies for this employment type
  const leavePolicies = await LeavePolicy.find({
    isActive: true,
    'eligibility.employmentTypes': createNewUser.employmentType
  });

  // 3. Create leave balance records for each applicable policy
  const currentYear = new Date().getFullYear();

  for (const policy of leavePolicies) {
    await LeaveBalance.create({
      userId: createNewUser._id,
      leaveType: policy.leaveType,
      balance: calculateInitialBalance(policy) || 0, // Initial balance
      accrualRate: policy.accrual.rate,
      maxAccrual: policy.accrual.maxBalance,
      carryOverLimit: policy.carryOver.enabled ? policy.carryOver.maxDays : 0,
      carryOverUsed: 0,
      fiscalYear: currentYear
    });
  }

  function calculateInitialBalance(policy) {
    // Pro-rate based on join date, or use policy default
    const joinDate = new Date(createNewUser.joinDate);
    const today = new Date();
    const monthsWorked = (today.getFullYear() - joinDate.getFullYear()) * 12 +
      (today.getMonth() - joinDate.getMonth());

    if (monthsWorked <= 0) return 0;

    return Math.min(
      monthsWorked * policy.accrual.rate,
      policy.accrual.maxBalance
    );
  }

  await emailService.sendWelcomeEmail(createNewUser);

  return ApiResponse.success(createNewUser, 'Employee created successfully');
});