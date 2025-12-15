import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import LeaveBalance from "@/models/LeaveBalance";
import LeavePolicy from "@/models/LeavePolicy";

export const GET = withErrorHandler(async () => {

  await dbConnect();

  // Prevent unauthorized access by adding the CRON_SECRET environment variable to your project and check incoming requests. Vercel will add it to all cron job invocations as part of the Authorization header, allowing you to specify any value you'd like for authorization.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw new AppError('Unauthorized', 401);
  }

  const newYear = new Date().getFullYear();
  const previousYear = newYear - 1;
  const users = await User.find({ isActive: true });

  for (const user of users) {
    const previousBalances = await LeaveBalance.find({
      userId: user._id,
      fiscalYear: previousYear
    });

    const currentPolicies = await LeavePolicy.find({
      isActive: true,
      'eligibility.employmentTypes': user.employmentType
    });

    for (const policy of currentPolicies) {
      const previousBalance = previousBalances.find(b => b.leaveType === policy.leaveType);

      let carryOverBalance = 0;
      if (previousBalance && policy.carryOver.enabled) {
        carryOverBalance = Math.min(
          previousBalance.balance,
          policy.carryOver.maxDays
        );
      }

      // Check if a balance record already exists for the new fiscal year
      const existingBalance = await LeaveBalance.findOne({
        userId: user._id,
        leaveType: policy.leaveType,
        fiscalYear: newYear
      });

      if (existingBalance) {
        // Update existing record with carried-over balance
        await LeaveBalance.findByIdAndUpdate(existingBalance._id, {
          balance: carryOverBalance,
          accrualRate: policy.accrual.rate,
          maxAccrual: policy.accrual.maxBalance,
          carryOverLimit: policy.carryOver.enabled ? policy.carryOver.maxDays : 0,
          updatedAt: new Date()
        });
      } else {
        // Create new record
        await LeaveBalance.create({
          userId: user._id,
          leaveType: policy.leaveType,
          balance: carryOverBalance, // Start with carried-over amount
          accrualRate: policy.accrual.rate,
          maxAccrual: policy.accrual.maxBalance,
          carryOverLimit: policy.carryOver.enabled ? policy.carryOver.maxDays : 0,
          carryOverUsed: 0,
          fiscalYear: newYear,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
  }

  return ApiResponse.success({}, 'Fiscal year rollover completed successfully');
});