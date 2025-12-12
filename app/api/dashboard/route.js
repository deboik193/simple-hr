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
      birthdayThisWeek,
      recentLeaveRequests,
      upcomingLeaves
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

        // Format dates for comparison
        const todayStr = now.toDateString();
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toDateString();

        return await User.aggregate([
          {
            $match: {
              isActive: true,
              'personalInfo.dateOfBirth': { $ne: null, $exists: true }
            }
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
            $unwind: {
              path: '$departmentInfo',
              preserveNullAndEmptyArrays: true
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
            $addFields: {
              // Calculate age
              age: {
                $subtract: [
                  { $year: '$nextBirthday' },
                  { $year: '$personalInfo.dateOfBirth' }
                ]
              },
              // Format date as YYYY-MM-DD
              birthDateFormatted: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: '$personalInfo.dateOfBirth'
                }
              },
              // Format next birthday for display
              nextBirthdayFormatted: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: '$nextBirthday'
                }
              },
              // Calculate days until birthday
              daysUntilBirthday: {
                $ceil: {
                  $divide: [
                    { $subtract: ['$nextBirthday', now] },
                    1000 * 60 * 60 * 24
                  ]
                }
              },
              // Get day of week and formatted date for display
              nextBirthdayDayOfWeek: {
                $dayOfWeek: '$nextBirthday'
              },
              nextBirthdayMonth: {
                $month: '$nextBirthday'
              },
              nextBirthdayDay: {
                $dayOfMonth: '$nextBirthday'
              },
              // Calculate age at next birthday
              birthYear: { $year: '$personalInfo.dateOfBirth' },
              nextBirthdayYear: { $year: '$nextBirthday' },
              // Generate a consistent avatar color based on employee ID or name
              avatarColorSeed: {
                $cond: {
                  if: { $ne: ['$employeeId', null] },
                  then: '$employeeId',
                  else: '$fullName'
                }
              },
            }
          },
          {
            $project: {
              employeeId: 1,
              fullName: 1,
              email: 1,
              position: 1,
              department: '$departmentInfo.name',
              dateOfBirth: '$personalInfo.dateOfBirth',
              birthDate: '$birthDateFormatted',
              // Create birthday display string
              birthday: {
                $let: {
                  vars: {
                    // Format date like "Tue, Dec 10"
                    formattedDate: {
                      $concat: [
                        {
                          $switch: {
                            branches: [
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 1] }, then: 'Sun' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 2] }, then: 'Mon' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 3] }, then: 'Tue' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 4] }, then: 'Wed' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 5] }, then: 'Thu' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 6] }, then: 'Fri' },
                              { case: { $eq: ['$nextBirthdayDayOfWeek', 7] }, then: 'Sat' }
                            ],
                            default: ''
                          }
                        },
                        ', ',
                        {
                          $switch: {
                            branches: [
                              { case: { $eq: ['$nextBirthdayMonth', 1] }, then: 'Jan' },
                              { case: { $eq: ['$nextBirthdayMonth', 2] }, then: 'Feb' },
                              { case: { $eq: ['$nextBirthdayMonth', 3] }, then: 'Mar' },
                              { case: { $eq: ['$nextBirthdayMonth', 4] }, then: 'Apr' },
                              { case: { $eq: ['$nextBirthdayMonth', 5] }, then: 'May' },
                              { case: { $eq: ['$nextBirthdayMonth', 6] }, then: 'Jun' },
                              { case: { $eq: ['$nextBirthdayMonth', 7] }, then: 'Jul' },
                              { case: { $eq: ['$nextBirthdayMonth', 8] }, then: 'Aug' },
                              { case: { $eq: ['$nextBirthdayMonth', 9] }, then: 'Sep' },
                              { case: { $eq: ['$nextBirthdayMonth', 10] }, then: 'Oct' },
                              { case: { $eq: ['$nextBirthdayMonth', 11] }, then: 'Nov' },
                              { case: { $eq: ['$nextBirthdayMonth', 12] }, then: 'Dec' }
                            ],
                            default: ''
                          }
                        },
                        ' ',
                        { $toString: '$nextBirthdayDay' }
                      ]
                    }
                  },
                  in: {
                    $switch: {
                      branches: [
                        // Check if today
                        {
                          case: {
                            $eq: [
                              '$nextBirthdayFormatted',
                              { $dateToString: { format: "%Y-%m-%d", date: now } }
                            ]
                          },
                          then: { $concat: ['Today (', '$$formattedDate', ')'] }
                        },
                        // Check if tomorrow
                        {
                          case: {
                            $eq: [
                              '$nextBirthdayFormatted',
                              { $dateToString: { format: "%Y-%m-%d", date: tomorrow } }
                            ]
                          },
                          then: { $concat: ['Tomorrow (', '$$formattedDate', ')'] }
                        },
                        // Default format
                        {
                          case: { $ne: ['$$formattedDate', ''] },
                          then: '$$formattedDate'
                        }
                      ],
                      default: 'Unknown'
                    }
                  }
                }
              },
              age: 1,
              avatarColorSeed: 1,
              nextBirthday: 1,
              daysUntilBirthday: 1,
              birthYear: 1,
              nextBirthdayYear: 1
            }
          },
          {
            $sort: { daysUntilBirthday: 1, fullName: 1 }
          }
        ]);
      })(),

      // 9. Recent leave requests
      LeaveRequest.find().populate('employeeId', 'fullName').sort({ createdAt: -1 }).limit(5).lean(),

      // 10. upcoming leaves can be added here
      LeaveRequest.find({ status: 'approved', startDate: { $gte: new Date() } }).sort({ startDate: 1 }).limit(5).lean().populate('employeeId', 'fullName employeeId position')

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

      recentLeaveRequests: recentLeaveRequests || [],

      // Role-based data
      teamLeaveRequests,
      departmentStats,

      // User info
      userInfo: {
        fullName: user.fullName,
        employeeId: user.employeeId,
        role: user.role,
        department: user.department
      },

      upcomingLeaves: upcomingLeaves || []

    }, 'Dashboard data fetched successfully');

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw new AppError('Failed to fetch dashboard data', 500);
  }
});