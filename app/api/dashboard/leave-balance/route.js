import { LEAVETYPE } from "@/constant/constant";
import User from "@/models/User";
import LeaveRequest from "@/models/LeaveRequest";
import { withErrorHandler, ApiResponse, AppError } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import LeaveBalance from "@/models/LeaveBalance";
import InitialLeaveBalance from "@/models/InitialLeaveBalance";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req);
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  try {
    // 1. Get current user's leave balances
    const currentUserBalance = await LeaveBalance.find({ userId: user._id }).lean();

    // 2. Get current user's details
    const userDetails = await User.findById(user._id)
      .populate('department')
      .lean();

    const initialBalances = await InitialLeaveBalance.find().lean();

    if (!userDetails) {
      throw new AppError('User not found', 404);
    }

    // 3. Prepare currentUser leaveTypes array
    const leaveTypes = [];
    let totalRemaining = 0;

    // Process each leave type from settings
    for (const setting of LEAVETYPE) {
      // Find matching balance for this leave type
      const balance = currentUserBalance.find(b =>
        b.leaveType === setting
      );

      const remaining = balance ? balance.balance : 0;
      const used = initialBalances ? initialBalances[0][setting] - remaining : 0;

      totalRemaining += remaining;

      leaveTypes.push({
        name: setting,
        total: initialBalances[0][setting],
        used: used,
        remaining: remaining
      });
    }

    // 4. Get team members
    let teamMembers = [];

    if (userDetails.department) {
      const departmentUsers = await User.find({
        department: userDetails.department._id,
        _id: { $ne: user._id }
      }).lean();

      // Get all leave balances for department users
      const teamUserIds = departmentUsers.map(u => u._id);
      const teamMemberBalances = await LeaveBalance.find({
        userId: { $in: teamUserIds }
      }).lean();

      // Prepare team members array
      teamMembers = await Promise.all(departmentUsers.map(async (member) => {

        const activeLeave = await LeaveRequest.findOne({
          userId: member._id,
          status: 'approved',
          startDate: { $lte: new Date() },
          endDate: { $gte: new Date() }
        }).lean();


        const memberBalances = teamMemberBalances.filter(b =>
          b.userId.toString() === member._id.toString()
        );

        // Helper function to calculate remaining leave
        const getRemaining = (leaveTypeName) => {
          const setting = LEAVETYPE.find(s => s === leaveTypeName);
          if (!setting) return 0;

          const balance = memberBalances.find(b => b.leaveType === leaveTypeName);
          return (balance ? balance.balance : 0);
        };

        return {
          id: member._id.toString(),
          employeeId: member.employeeId || '',
          employeeName: `${member.fullName}`,
          department: member.department?.name || '',
          annualLeave: getRemaining('annual'),
          sickLeave: getRemaining('sick'),
          personalLeave: getRemaining('personal'),
          onLeave: !!activeLeave
        };
      }));
    }

    // 5. Construct the response
    const responseData = {
      currentUser: {
        employeeId: userDetails.employeeId || '',
        employeeName: `${userDetails.fullName}`,
        department: userDetails.department?.name || '',
        leaveTypes: leaveTypes,
        totalRemaining: totalRemaining
      },
      teamMembers: teamMembers
    };

    return ApiResponse.success(responseData, 'Dashboard data fetched successfully');

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw new AppError('Failed to fetch dashboard data', 500);
  }
});