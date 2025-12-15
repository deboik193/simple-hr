import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import LeaveBalance from "@/models/LeaveBalance";
import LeavePolicy from "@/models/LeavePolicy";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  // Prevent unauthorized access by adding the CRON_SECRET environment variable to your project and check incoming requests. Vercel will add it to all cron job invocations as part of the Authorization header, allowing you to specify any value you'd like for authorization.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw new AppError('Unauthorized', 401);
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const balances = await LeaveBalance.find({ fiscalYear: currentYear });

  for (const balance of balances) {

    // Prevent duplicate monthly accrual
    if (balance.lastAccruedMonth === currentMonth) {
      continue;
    }

    const newBalance = Math.min(
      balance.balance + balance.accrualRate,
      balance.maxAccrual
    );

    balance.balance = newBalance;
    balance.lastAccruedMonth = currentMonth;

    await balance.save();
  }

  return ApiResponse.success({}, 'Accrual process job completed');
});