import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import LeaveBalance from "@/models/LeaveBalance";
import LeavePolicy from "@/models/LeavePolicy";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw new AppError('Unauthorized', 401);
  }

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  // Single bulk update operation
  const result = await LeaveBalance.updateMany(
    {
      fiscalYear: currentYear,
      $or: [
        { lastAccruedMonth: { $exists: false } },
        { lastAccruedMonth: { $ne: currentMonth } }
      ]
    },
    [
      {
        $set: {
          balance: {
            $min: [
              { $add: ["$balance", "$accrualRate"] },
              "$maxAccrual"
            ]
          },
          lastAccruedMonth: currentMonth
        }
      }
    ]
  );

  console.log(`Accrual completed: ${result.modifiedCount} balances updated`);

  return ApiResponse.success(
    { updatedCount: result.modifiedCount },
    'Accrual process job completed'
  );
});