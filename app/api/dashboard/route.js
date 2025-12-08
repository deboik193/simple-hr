import User from "../../../models/User";
import LeaveRequest from "../../../models/LeaveRequest";
import LeaveBalance from "../../../models/LeaveBalance";

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
      totalEmployees,
      totalLeaveRequests,
      pendingLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,
      yourLeaveBalance,
      onLeaveToday,
      birthdayThisWeek
    ] = await Promise.all([
      // 1. Total employees (active only)
      User.countDocuments({ isActive: true }),

      // 2. Total leave requests
      LeaveRequest.countDocuments(),

      // 3. Pending leave requests
      LeaveRequest.countDocuments({
        status: { $in: ['pending-manager', 'pending-hr', 'pending-relief'] }
      }),

      // 4. Approved leave requests
      LeaveRequest.countDocuments({ status: 'approved' }),

      // 5. Rejected leave requests
      LeaveRequest.countDocuments({ status: 'rejected' }),

      // 6. User's leave balance
      LeaveBalance.findOne({ userId: user._id, leaveType: 'annual' }).lean(),

      // 7. User's leaves today
      LeaveRequest.find({
        employeeId: user._id,
        status: 'approved',
        startDate: { $lte: new Date() },
        endDate: { $gte: new Date() }
      }).lean(),

      // 8. Birthdays this week - FIXED VERSION
      (async () => {
        const now = new Date();
        const currentYear = now.getFullYear();

        // Calculate start and end of current week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        return await User.aggregate([
          {
            $match: {
              isActive: true,
              'personalInfo.dateOfBirth': { $ne: null, $exists: true }
            }
          },
          {
            $addFields: {
              // Get birthday for current year
              birthdayThisYear: {
                $dateFromParts: {
                  'year': currentYear,
                  'month': { $month: '$personalInfo.dateOfBirth' },
                  'day': { $dayOfMonth: '$personalInfo.dateOfBirth' }
                }
              }
            }
          },
          {
            $addFields: {
              // If birthday this year has passed, use next year
              nextBirthday: {
                $cond: {
                  if: { $lt: ['$birthdayThisYear', startOfWeek] },
                  then: {
                    $dateFromParts: {
                      'year': currentYear + 1,
                      'month': { $month: '$personalInfo.dateOfBirth' },
                      'day': { $dayOfMonth: '$personalInfo.dateOfBirth' }
                    }
                  },
                  else: '$birthdayThisYear'
                }
              }
            }
          },
          {
            $match: {
              nextBirthday: {
                $gte: startOfWeek,
                $lte: endOfWeek
              }
            }
          },
          {
            $project: {
              employeeId: 1,
              fullName: 1,
              email: 1,
              position: 1,
              department: 1,
              dateOfBirth: '$personalInfo.dateOfBirth',
              nextBirthday: 1,
              daysUntilBirthday: {
                $ceil: {
                  $divide: [
                    { $subtract: ['$nextBirthday', now] },
                    1000 * 60 * 60 * 24 // Convert milliseconds to days
                  ]
                }
              }
            }
          },
          {
            $sort: { daysUntilBirthday: 1, fullName: 1 }
          }
        ]);
      })()
    ]);

    // Additional dashboard data based on user role
    let teamLeaveRequests = [];
    let departmentStats = null;

    if (user.role === 'manager' || user.role === 'hr' || user.role === 'admin') {
      // Get team/department leave requests if user is manager/hr/admin
      teamLeaveRequests = await LeaveRequest.find({
        status: { $in: ['pending-manager', 'pending-hr'] }
      })
        .populate('employeeId', 'fullName employeeId position')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();
    }

    if (user.role === 'admin') {
      // Get department stats for admin
      departmentStats = await User.aggregate([
        {
          $match: { isActive: true }
        },
        {
          $lookup: {
            from: 'departments',
            localField: 'department',
            foreignField: '_id',
            as: 'departmentInfo'
          }
        },
        {
          $unwind: '$departmentInfo'
        },
        {
          $group: {
            _id: '$departmentInfo.name',
            count: { $sum: 1 }
          }
        },
        {
          $sort: { count: -1 }
        }
      ]);
    }

    return ApiResponse.success({
      // Main dashboard stats
      totalEmployees,
      totalLeaveRequests,
      pendingLeaveRequests,
      approvedLeaveRequests,
      rejectedLeaveRequests,

      // User-specific data
      yourLeaveBalance: yourLeaveBalance || {},
      onLeaveToday: onLeaveToday || [],
      birthdayThisWeek: birthdayThisWeek || [],

      // Role-based data
      teamLeaveRequests,
      departmentStats,

      // User info
      userInfo: {
        fullName: user.fullName,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department
      }

    }, 'Dashboard data fetched successfully');

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw new AppError('Failed to fetch dashboard data', 500);
  }
});