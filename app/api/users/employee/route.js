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
import mongoose from "mongoose";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const employees = await User.find().populate([{ path: 'department' }, { path: 'branch' }, { path: 'managerId' }, { path: 'teamLeadId' }]).lean().sort({ createdAt: -1 }).select('-password -resetPasswordToken -resetPasswordExpires');

  return ApiResponse.success(employees, '');
});

export const POST = withErrorHandler(async (req) => {
  await dbConnect();
  const session = await mongoose.startSession();

  try {
    return await session.withTransaction(async () => {
      const { user, errors } = await getAuthUser(req);
      if (errors) return errors;
      if (!user) throw new AppError('Unauthorized', 401);

      if (user.role !== 'admin' && user.role !== 'hr') {
        throw new AppError('Forbidden', 403);
      }

      const body = await req.json();
      const { error, value } = authValidation.registerUser.validate(body);

      if (error) {
        throw new AppError(`Validation error: ${error.details[0].message}`, 400);
      }

      // Sanitize inputs
      value.email = value.email.trim().toLowerCase();

      // Validate join date
      if (new Date(value.joinDate) > new Date()) {
        throw new AppError('Join date cannot be in the future', 400);
      }

      const INITIAL_BALANCE_ID = process.env.INITIAL_BALANCE_ID;
      const initialBalance = await InitialLeaveBalance.findOne({
        _id: INITIAL_BALANCE_ID
      }).session(session);

      if (!initialBalance) {
        throw new AppError('Initial leave balance configuration not found', 500);
      }

      const leaveBalance = LEAVETYPE.reduce((acc, type) => ({
        ...acc,
        [type]: initialBalance[type]
      }), {});

      let existingUser = await User.findOne({ email: value.email }).session(session);

      if (existingUser) {
        // Reactivate existing user
        const updatedUser = await User.findOneAndUpdate(
          { email: value.email },
          {
            isActive: true,
            ...value,
            leaveBalance,
            updatedAt: new Date()
          },
          { new: true, session }
        );

        await createLeaveBalances(updatedUser, session);
        return ApiResponse.success(updatedUser, 'User re-activated successfully');
      }

      // Create new user
      const employeeId = generateEmployeeId(value.fullName);
      const password = await generateTemporaryPassword();

      const newUser = await User.create([{
        ...value,
        employeeId,
        password: await hashPassword(password),
        leaveBalance
      }], { session });

      await createLeaveBalances(newUser[0], session);
      await emailService.sendWelcomeEmail(newUser[0], password);

      return ApiResponse.success(newUser[0], 'Employee created successfully');
    });
  } finally {
    session.endSession();
  }
});

// Helper functions defined outside
async function createLeaveBalances(user, session) {
  const leavePolicies = await LeavePolicy.find({
    isActive: true,
    'eligibility.employmentTypes': user.employmentType
  }).session(session);

  const currentYear = new Date().getFullYear();
  const balanceDocs = leavePolicies.map(policy => ({
    userId: user._id,
    leaveType: policy.leaveType,
    balance: calculateInitialBalance(policy, user),
    accrualRate: policy.accrual.rate,
    maxAccrual: policy.accrual.maxBalance,
    carryOverLimit: policy.carryOver.enabled ? policy.carryOver.maxDays : 0,
    carryOverUsed: 0,
    fiscalYear: currentYear
  }));

  if (balanceDocs.length > 0) {
    await LeaveBalance.insertMany(balanceDocs, { session });
  }
}

function calculateInitialBalance(policy, user) {
  const joinDate = new Date(user.joinDate);
  const today = new Date();

  // Ensure join date is valid
  if (isNaN(joinDate.getTime())) return 0;

  const monthsWorked = (today.getFullYear() - joinDate.getFullYear()) * 12 +
    (today.getMonth() - joinDate.getMonth());

  return monthsWorked <= 0
    ? 0
    : Math.min(monthsWorked * policy.accrual.rate, policy.accrual.maxBalance);
}

function generateEmployeeId(fullName) {
  const initials = (fullName || '')
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const uniqueId = Date.now().toString().slice(-4);
  return `${initials}${uniqueId}`;
}

async function generateTemporaryPassword() {
  // Generate secure temporary password
  return crypto.randomBytes(8).toString('hex');
}