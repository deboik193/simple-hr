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

  // 2. Verify the user is the employee's manager
  const employee = await User.findById(leaveRequest.employeeId);
  if (!employee.teamLeadId || !employee.teamLeadId.equals(user._id)) {
    throw new AppError('You are not assigned as team lead officer for this request', 403);
  }

  // 3. Verify the request is in correct status
  if (leaveRequest.status !== 'pending-team-lead') {
    throw new AppError('This leave request is not awaiting team lead officer approval', 400);
  }

  // 4. Update the leave request status
  const updatedRequest = await LeaveRequest.findByIdAndUpdate(
    id,
    {
      status: 'rejected',
      reliefStatus: 'declined',
      $push: {
        approvalHistory: {
          approvedBy: user._id,
          role: 'team-lead-officer',
          action: 'rejected',
          notes: value.notes || 'team lead officer declined the request',
          timestamp: new Date()
        }
      }
    },
    { new: true }
  ).populate('employeeId', 'fullName email employeeId')
    .populate('teamLeadId', 'fullName email');

  const manager = await User.findById(updatedRequest?.employeeId._id).populate('managerId');

  // 5. Notify the employee and manager
  await emailService.notifyDeclinedLeaveRequest(updatedRequest, value, manager, 'team lead');

  return ApiResponse.success(updatedRequest, 'Leave request declined successfully');
})