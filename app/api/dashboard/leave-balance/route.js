import User from "@/models/User";
import LeaveRequest from "@/models/LeaveRequest";

import { withErrorHandler, ApiResponse, AppError } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req);
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  try {
    // Fetch dashboard data in parallel for better performance
    const [
      yourLeaveBalance
    ] = await Promise.all([

      // 6. User's leave balance
      LeaveBalance.find({ userId: user._id }).lean(),
    ]);

    // Additional dashboard data based on user role
    let teamLeaveRequests = [];

    if (user.role === 'manager' || user.role === 'hr' || user.role === 'admin') {
      // Get team/department leave requests if user is manager/hr/admin
      teamLeaveRequests = await LeaveBalance.find({
        // status: { $in: ['pending-manager', 'pending-hr'] }
      })
        .populate('employeeId', 'fullName employeeId position')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    console.log(yourLeaveBalance)
    return ApiResponse.success({ yourLeaveBalance }, 'Dashboard data fetched successfully');

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw new AppError('Failed to fetch dashboard data', 500);
  }
});