// app/api/leave-requests/[id]/hr-approve/route.js
import LeaveBalance from '@/models/LeaveBalance';
import { emailService } from '@/libs/emailService';
import { withErrorHandler, ApiResponse, AppError } from '@/libs/errorHandler';
import { getAuthUser } from '@/libs/middleware';
import dbConnect from '@/libs/mongodb';
import { authValidation } from '@/libs/validator';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';
import { LEAVETYPE } from '@/constant/constant';

export const PATCH = withErrorHandler(async (req, { params }) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  const body = await req.json();

  const { error, value } = authValidation.approvalHistory.validate(body);

  if (error) throw new AppError('Validation error: ' + error.details[0].message, 400);

  // Verify HR role
  if (!['hr', 'admin'].includes(user.role)) {
    throw new AppError('Only HR personnel can perform this action', 403);
  }

  // 1. Find the leave request
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    throw new AppError('Leave request not found', 404);
  }

  // 2. Verify the request is in correct status
  if (leaveRequest.status !== 'pending-hr') {
    throw new AppError('This leave request is not awaiting HR approval', 400);
  }

  // 3. Final approval - deduct leave balance
  await deductLeaveBalance(leaveRequest);

  // 4. Update the leave request status to approved
  const updatedRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    {
      status: 'approved',
      $push: {
        approvalHistory: {
          approvedBy: user._id,
          role: 'hr',
          action: 'approved',
          notes: value.notes || 'HR approved the request',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  ).populate('employeeId', 'fullName email employeeId')
    .populate('reliefOfficerId', 'fullName email')

  // 5. Notify all parties
  await emailService.notifyFinalApproval(updatedRequest);

  return ApiResponse.success(
    updatedRequest,
    'Leave request approved successfully'
  );
});

// Deduct leave balance from employee's account
async function deductLeaveBalance(leaveRequest) {
  const { employeeId, leaveType, totalDays } = leaveRequest;

  const session = await LeaveBalance.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(employeeId).session(session);
    // 1. Validate leave type exists in LEAVETYPE
    if (!LEAVETYPE.includes(leaveType)) {
      throw new AppError(`Invalid leave type: ${leaveType}`, 400);
    }

    // 2. Fetch current leave balance
    const leaveBalance = await LeaveBalance.findOne({
      userId: employeeId,
      leaveType: leaveType
    }).session(session);

    if (!leaveBalance) {
      throw new AppError('Leave balance not found for employee', 400);
    }

    // If no detailed record exists, create one based on User's current balance
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (leaveBalance.balance < totalDays) {
      throw new AppError('Insufficient leave balance for approval', 400);
    }

    // Deduct the days
    await LeaveBalance.findOneAndUpdate(
      { userId: employeeId, leaveType: leaveType },
      {
        $inc: { balance: -totalDays },
        $set: { lastUpdated: new Date() }
      },
      { session }
    );

    // Get current balance from User model
    const currentUserBalance = user.leaveBalance?.[leaveType] || 0;

    if (currentUserBalance < totalDays) {
      throw new AppError('Insufficient leave balance in user account', 400);
    }

    // Also update User's leave balance
    await User.findByIdAndUpdate(
      employeeId,
      {
        $inc: { [`leaveBalance.${leaveType}`]: -totalDays }
      },
      { session }
    );

    // 3. Commit transaction
    await session.commitTransaction();
  }
  catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  } finally {
    session.endSession();
  }
}