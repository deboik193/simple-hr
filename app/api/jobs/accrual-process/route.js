import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User";
import LeaveBalance from "@/models/LeaveBalance";
import LeavePolicy from "@/models/LeavePolicy";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

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