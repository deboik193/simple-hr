import { ApiResponse, withErrorHandler, AppError } from "@/libs/errorHandler";
import dbConnect from "@/libs/mongodb";
import User from "@/models/User"; // Import directly, not dynamically
import { emailService } from "@/libs/emailService";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  // Prevent unauthorized access by adding the CRON_SECRET environment variable to your project and check incoming requests. Vercel will add it to all cron job invocations as part of the Authorization header, allowing you to specify any value you'd like for authorization.
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('Authorization');

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    throw new AppError('Unauthorized', 401);
  }

  try {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Calculate the date range for next 7 days
    const startDate = new Date(now);
    const endDate = new Date(now);
    endDate.setDate(now.getDate() + 7);
    endDate.setHours(23, 59, 59, 999);

    // Get users with birthdays in the next 7 days
    const usersWithBirthdays = await User.aggregate([
      {
        $match: {
          isActive: true,
          'personalInfo.dateOfBirth': { $exists: true, $ne: null },
          'preferences.notifications': true
        }
      },
      {
        $addFields: {
          // Get birthday for current year
          birthdayThisYear: {
            $dateFromParts: {
              year: currentYear,
              month: { $month: '$personalInfo.dateOfBirth' },
              day: { $dayOfMonth: '$personalInfo.dateOfBirth' }
            }
          }
        }
      },
      {
        $addFields: {
          // If birthday this year has passed, use next year
          nextBirthday: {
            $cond: {
              if: { $lt: ['$birthdayThisYear', now] },
              then: {
                $dateFromParts: {
                  year: currentYear + 1,
                  month: { $month: '$personalInfo.dateOfBirth' },
                  day: { $dayOfMonth: '$personalInfo.dateOfBirth' }
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
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department',
          foreignField: '_id',
          as: 'department'
        }
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $addFields: {
          daysUntilBirthday: {
            $ceil: {
              $divide: [
                { $subtract: ['$nextBirthday', now] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $project: {
          employeeId: 1,
          fullName: 1,
          email: 1,
          'department.name': 1,
          'personalInfo.dateOfBirth': 1,
          nextBirthday: 1,
          daysUntilBirthday: 1
        }
      }
    ]);

    if (usersWithBirthdays.length === 0) {
      return ApiResponse.success({}, 'No upcoming birthdays found');
    }

    // Get HR users (only once, not per birthday user)
    const hrUsers = await User.find({
      role: 'hr',
      isActive: true,
      'preferences.notifications': true
    }).select('email fullName');

    if (hrUsers.length === 0) {
      return ApiResponse.success({}, 'No HR users found to notify');
    }

    // Send notifications efficiently
    const emailPromises = [];
    const notificationResults = {
      sent: 0,
      failed: 0,
      details: []
    };

    // Send one email to each HR with all birthdays listed
    for (const hr of hrUsers) {
      emailPromises.push(
        emailService.birthdayNotification(hr, usersWithBirthdays)
          .then(result => {
            notificationResults.sent++;
            notificationResults.details.push({
              hrEmail: hr.email,
              status: 'success',
              timestamp: new Date()
            });
            return result;
          })
          .catch(error => {
            notificationResults.failed++;
            notificationResults.details.push({
              hrEmail: hr.email,
              status: 'failed',
              error: error.message,
              timestamp: new Date()
            });
            // Log error but don't fail the whole process
            console.error(`Failed to send email to ${hr.email}:`, error);
          })
      );
    }

    // Wait for all emails to be sent (successfully or not)
    await Promise.allSettled(emailPromises);

    return ApiResponse.success({
      birthdaysFound: usersWithBirthdays.length,
      hrNotified: hrUsers.length,
      notifications: notificationResults,
      upcomingBirthdays: usersWithBirthdays.map(user => ({
        name: user.fullName,
        department: user.department?.name || 'Unknown',
        birthday: user.nextBirthday,
        daysUntil: user.daysUntilBirthday
      }))
    }, 'Birthday notifications processed');

  } catch (error) {
    console.error('Birthday notification job failed:', error);
    throw new AppError('Failed to process birthday notifications', 500);
  }
});