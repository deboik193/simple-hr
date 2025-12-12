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
      recentLeaveRequests
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
        // Helper function to format birthday for week display
        function formatBirthdayForWeek(birthDate, weekRange) {
          const now = new Date();
          const currentYear = now.getFullYear();
          const birthdayThisYear = new Date(currentYear, birthDate.getMonth(), birthDate.getDate());
          if (birthdayThisYear < weekRange.start) {
            return new Date(currentYear + 1, birthDate.getMonth(), birthDate.getDate());
          }
          return birthdayThisYear;
        }

        const now = new Date();
        const currentYear = now.getFullYear();

        // Calculate start and end of current week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay()); // Sunday
        startOfWeek.setHours(0, 0, 0, 0);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + (6 - now.getDay())); // Saturday
        endOfWeek.setHours(23, 59, 59, 999);

        // Process the results to add calculated fields
        birthdays.map((birthday, index) => {
          // Generate deterministic avatar color based on seed
          const colors = [
            'bg-pink-100 text-pink-600',
            'bg-purple-100 text-purple-600',
            'bg-indigo-100 text-indigo-600',
            'bg-blue-100 text-blue-600',
            'bg-cyan-100 text-cyan-600',
            'bg-teal-100 text-teal-600',
            'bg-green-100 text-green-600',
            'bg-yellow-100 text-yellow-600',
            'bg-orange-100 text-orange-600',
            'bg-red-100 text-red-600'
          ];

          // Create a simple hash from the seed string
          const seed = birthday.avatarColorSeed || birthday.employeeId || birthday.employeeName;
          let hash = 0;
          for (let i = 0; i < seed.length; i++) {
            hash = seed.charCodeAt(i) + ((hash << 5) - hash);
          }
          const colorIndex = Math.abs(hash) % colors.length;

          // Format birthday for week display
          const birthdayForWeek = formatBirthdayForWeek(birthday.birthDate, {
            start: startOfWeek,
            end: endOfWeek
          });

          return {
            id: birthday.id || birthday._id || index + 1,
            employeeName: birthday.employeeName,
            department: birthday.department || 'Not Assigned',
            birthDate: birthday.birthDate,
            birthday: birthdayForWeek, // This needs the formatBirthdayForWeek function
            age: birthday.age,
            avatarColor: colors[colorIndex],
            // Additional fields for your frontend
            employeeId: birthday.employeeId,
            email: birthday.email,
            position: birthday.position,
            nextBirthday: birthday.nextBirthday,
            daysUntilBirthday: birthday.daysUntilBirthday
          };
        });

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
              // Calculate age at next birthday
              birthYear: { $year: '$personalInfo.dateOfBirth' },
              nextBirthdayYear: { $year: '$nextBirthday' },
              age: {
                $subtract: ['$nextBirthdayYear', '$birthYear']
              },
              // Format date as YYYY-MM-DD
              birthDateFormatted: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: '$personalInfo.dateOfBirth'
                }
              },
              // Generate a consistent avatar color based on employee ID or name
              avatarColorSeed: {
                $cond: {
                  if: { $ne: ['$employeeId', null] },
                  then: '$employeeId',
                  else: '$fullName'
                }
              }
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
              age: 1,
              avatarColorSeed: 1,
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
      })(),

      // 9. Recent leave requests
      LeaveRequest.find().populate('employeeId', 'fullName').sort({ createdAt: -1 }).limit(5).lean()

    ]);

    console.log('Dashboard data fetched for user:', birthdayThisWeek);

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
      }

    }, 'Dashboard data fetched successfully');

  } catch (error) {
    console.error('Dashboard fetch error:', error);
    throw new AppError('Failed to fetch dashboard data', 500);
  }
});