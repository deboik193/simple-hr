// app/api/leave-requests/[id]/manager-approve/route.js
import { emailService } from '@/libs/emailService';
import { withErrorHandler, ApiResponse, AppError } from '@/libs/errorHandler';
import { getAuthUser } from '@/libs/middleware';
import dbConnect from '@/libs/mongodb';
import { authValidation } from '@/libs/validator';
import LeaveRequest from '@/models/LeaveRequest';
import User from '@/models/User';

export const PATCH = withErrorHandler(async (req, { params }) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const { id } = await params;

  const body = await req.json();

  const { error, value } = authValidation.approvalHistory.validate(body);

  if (error) throw new AppError('Validation error: ' + error.details[0].message, 400);

  // 1. Find the leave request
  const leaveRequest = await LeaveRequest.findById(id);
  if (!leaveRequest) {
    throw new AppError('Leave request not found', 404);
  }

  // 2. Verify the user is the employee's manager
  const employee = await User.findById(leaveRequest.employeeId);
  if (!employee.managerId || !employee.managerId.equals(user._id)) {
    throw new AppError('You are not the manager for this employee', 403);
  }

  // 3. Verify the request is in correct status
  if (leaveRequest.status !== 'pending-manager') {
    throw new AppError('This leave request is not awaiting manager approval', 400);
  }

  // 4. Determine next status
  let nextStatus = 'pending-hr'; // or 'approved' based on your workflow

  // 5. Update the leave request status
  const updatedRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    {
      status: nextStatus,
      reliefStatus: 'approved',
      $push: {
        approvalHistory: {
          approvedBy: user._id,
          role: 'manager',
          action: 'approved',
          notes: value.notes || 'Manager approved the request',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  ).populate('employeeId', 'fullName email employeeId')
    .populate('reliefOfficerId', 'fullName email')

  const hr = await User.findOne({ role: "hr" });

  // 6. Notify the employee and HR
  await emailService.notifyManagerApproval(updatedRequest, hr);

  return ApiResponse.success(
    updatedRequest,
    'Leave request approved by manager'
  );
});