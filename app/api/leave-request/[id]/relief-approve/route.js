import { emailService } from "@/libs/emailService";
import { ApiResponse, AppError, withErrorHandler } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import { authValidation } from "@/libs/validator";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";

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

  // 2. Verify the user is the assigned relief officer
  if (!leaveRequest.reliefOfficerId.equals(user._id)) {
    throw new AppError('You are not assigned as the relief officer for this request', 403);
  }

  // 3. Verify the request is in correct status
  if (leaveRequest.status !== 'pending-relief') {
    throw new AppError('This leave request is not awaiting relief officer approval', 400);
  }

  // 4. Determine next status based on approval workflow
  let nextStatus = 'pending-manager';
  let nextReliefStatus = 'approved';

  // Check if manager approval is required
  const employee = await User.findById(leaveRequest.employeeId).populate('managerId');

  if (employee.managerId) {
    nextStatus = 'pending-manager';
  } else {
    // If no manager, go to HR or directly to approved
    nextStatus = 'pending-hr'; // or 'approved' based on your workflow
  }

  // 5. Update the leave request status
  const updatedRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    {
      status: nextStatus,
      reliefStatus: nextReliefStatus,
      $push: {
        approvalHistory: {
          approvedBy: user._id,
          role: 'relief-officer',
          action: 'approved',
          notes: value.notes || 'Relief officer approved the request',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  ).populate('employeeId', 'fullName email employeeId')
    .populate('reliefOfficerId', 'fullName email')

  const manager = await User.findById(updatedRequest?.employeeId._id).populate('managerId');

  // 6. Notify the employee and manager
  await emailService.notifyManagerApproval(updatedRequest, manager);

  return ApiResponse.success(updatedRequest, 'Leave request approved successfully');
})