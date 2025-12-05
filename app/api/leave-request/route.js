// app/api/leave-requests/route.js
import LeavePolicy from "../../../models/LeavePolicy";
import User from "../../../models/User";
import LeaveRequest from "../../../models/LeaveRequest";
import LeaveBalance from "../../../models/LeaveBalance";
import Department from "../../../models/Department";
import Branch from "../../../models/Branch"

import { withErrorHandler, ApiResponse, AppError } from "@/libs/errorHandler";
import { getAuthUser } from "@/libs/middleware";
import dbConnect from "@/libs/mongodb";
import { authValidation } from "@/libs/validator";
import { emailService } from "@/libs/emailService";
import mongoose from "mongoose";

export const GET = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req)
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);


  let filter = {};

  // =============================
  // 1️⃣ ADMIN / SUPER-ADMIN / HR
  // =============================
  if (["admin", "hr"].includes(user.role)) {
    filter = {}; // full access
  }

  // -----------------------------------------
  // 2️⃣ MANAGER → Department + Relief
  // -----------------------------------------
  else if (user.role === "manager") {
    // First, find employees in the manager's department
    const departmentEmployees = await mongoose.model('User').find(
      { department: user.department },
      '_id'
    );

    const employeeIds = departmentEmployees.map(emp => emp._id);

    filter = {
      $or: [
        { employeeId: { $in: employeeIds } }, // Leave requests from department employees
        { reliefOfficerId: user._id } // Leave requests where manager is relief officer
      ],
    }
  }

  // -----------------------------------------
  // 3️⃣ EMPLOYEE → Own + Relief
  // -----------------------------------------
  else if (user.role === "employee") {
    filter = {
      $or: [
        { employeeId: user._id },
        { reliefOfficerId: user._id }
      ],
    };
  }

  const leaveRequest = await LeaveRequest.find(filter).sort({ createdAt: -1 })
    .populate([{ path: 'employeeId', populate: { path: 'department' } }, { path: 'reliefOfficerId' }, { path: 'approvalHistory.approvedBy' }]);

  return ApiResponse.success(leaveRequest, 'success');
});

export const POST = withErrorHandler(async (req) => {
  await dbConnect();

  const { user, errors } = await getAuthUser(req);
  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();
  const { error, value } = authValidation.leaveRequest.validate(body);
  if (error) throw new AppError('Validation error: ' + error.details[0].message, 400);

  // Get user details
  const userDetails = await User.findOne({ _id: user._id }).select('employeeId employmentType joinDate department branch email fullName').populate('department').populate('branch');
  if (!userDetails) throw new AppError('User details not found', 404);

  const { employmentType, joinDate, department, branch, _id } = userDetails;
  // Check if user's department is active
  if (!department || !department.isActive) {
    throw new AppError('Your department is not active. Cannot apply for leave.', 400);
  }

  // Check if user's branch is active
  if (!branch || !branch.isActive) {
    throw new AppError('Your branch is not active. Cannot apply for leave.', 400);
  }

  // Check department's max concurrent leaves
  if (department.leaveSettings?.maxConcurrentLeaves) {
    const currentDepartmentLeaves = await LeaveRequest.countDocuments({
      'employeeId': {
        $in: await User.find({ department: department._id }).distinct('_id')
      },
      status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] },
      $or: [
        {
          startDate: { $lte: value.endDate },
          endDate: { $gte: value.startDate }
        }
      ]
    });

    if (currentDepartmentLeaves >= department.leaveSettings.maxConcurrentLeaves) {
      throw new AppError(
        `Department limit reached. Maximum ${department.leaveSettings.maxConcurrentLeaves} employees can be on leave simultaneously in ${department.name}`,
        400
      );
    }
  }

  // Check branch's max concurrent leaves
  if (branch.leaveSettings?.maxConcurrentLeaves) {
    const currentBranchLeaves = await LeaveRequest.countDocuments({
      'employeeId': {
        $in: await User.find({ branch: branch._id }).distinct('_id')
      },
      status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] },
      $or: [
        {
          startDate: { $lte: value.endDate },
          endDate: { $gte: value.startDate }
        }
      ]
    });

    if (currentBranchLeaves >= branch.leaveSettings.maxConcurrentLeaves) {
      throw new AppError(
        `Branch limit reached. Maximum ${branch.leaveSettings.maxConcurrentLeaves} employees can be on leave simultaneously in ${branch.name}`,
        400
      );
    }
  }

  // Check department minimum coverage percentage
  if (department.leaveSettings?.requiredCoverage) {
    const totalDepartmentEmployees = await User.countDocuments({
      department: department._id,
      isActive: true,
      employmentType: { $in: ['full-time', 'part-time'] } // Only count active workforce
    });

    const employeesOnLeave = await LeaveRequest.countDocuments({
      'employeeId': {
        $in: await User.find({ department: department._id }).distinct('_id')
      },
      status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] },
      $or: [
        {
          startDate: { $lte: value.endDate },
          endDate: { $gte: value.startDate }
        }
      ]
    });

    // Include the current request in calculation
    const wouldBeOnLeave = employeesOnLeave + 1;
    const coveragePercentage = ((totalDepartmentEmployees - wouldBeOnLeave) / totalDepartmentEmployees) * 100;

    if (coveragePercentage < department.leaveSettings.requiredCoverage) {
      throw new AppError(
        `Insufficient department coverage. Minimum ${department.leaveSettings.requiredCoverage}% required. Current coverage would be ${coveragePercentage.toFixed(1)}%`,
        400
      );
    }
  }

  // Check branch minimum coverage percentage
  if (branch.leaveSettings?.requiredCoverage) {
    const totalBranchEmployees = await User.countDocuments({
      branch: branch._id,
      isActive: true,
      employmentType: { $in: ['full-time', 'part-time'] }
    });

    const employeesOnLeave = await LeaveRequest.countDocuments({
      'employeeId': {
        $in: await User.find({ branch: branch._id }).distinct('_id')
      },
      status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] },
      $or: [
        {
          startDate: { $lte: value.endDate },
          endDate: { $gte: value.startDate }
        }
      ]
    });

    const wouldBeOnLeave = employeesOnLeave + 1;
    const coveragePercentage = ((totalBranchEmployees - wouldBeOnLeave) / totalBranchEmployees) * 100;

    if (coveragePercentage < branch.leaveSettings.requiredCoverage) {
      throw new AppError(
        `Insufficient branch coverage. Minimum ${branch.leaveSettings.requiredCoverage}% required. Current coverage would be ${coveragePercentage.toFixed(1)}%`,
        400
      );
    }
  }

  // Ensure relief officer is in the same department (optional but recommended)
  const reliefOfficerDetails = await User.findOne({ _id: value.reliefOfficerId })
    .select('department')
    .populate('department', 'name');

  if (!reliefOfficerDetails.department._id.equals(department._id)) {
    throw new AppError('Relief officer must be from the same department', 400);
  }

  // Validate relief officer exists
  const reliefOfficer = await User.findOne({ _id: value.reliefOfficerId, isActive: true });
  if (!reliefOfficer) {
    throw new AppError('Relief officer not found or inactive', 400);
  }

  // Get applicable leave policy
  const leavePolicy = await LeavePolicy.findOne({
    leaveType: value.leaveType,
    isActive: true,
    'eligibility.employmentTypes': employmentType
  });

  if (!leavePolicy) {
    throw new AppError(`No active leave policy found for ${value.leaveType} leave and your employment type`, 400);
  }

  // 1. Check minimum service days eligibility
  const serviceDays = Math.floor((new Date() - new Date(joinDate)) / (1000 * 60 * 60 * 24));
  if (serviceDays < leavePolicy.eligibility.minServiceDays) {
    throw new AppError(
      `Not eligible for leave. Minimum service requirement: ${leavePolicy.eligibility.minServiceDays} days. Your service: ${serviceDays} days.`,
      400
    );
  }

  // 2. Check blackout dates
  if (leavePolicy.restrictions.blackoutDates && leavePolicy.restrictions.blackoutDates.length > 0) {
    const leaveStart = new Date(value.startDate);
    const leaveEnd = new Date(value.endDate);

    const isBlackoutPeriod = leavePolicy.restrictions.blackoutDates.some(blackoutDate => {
      const blackout = new Date(blackoutDate);
      return leaveStart <= blackout && leaveEnd >= blackout;
    });

    if (isBlackoutPeriod) {
      throw new AppError('Leave cannot be applied during blackout periods', 400);
    }
  }

  // 3. Check minimum notice period
  if (leavePolicy.restrictions.minNoticeDays) {
    const leaveStart = new Date(value.startDate);
    const today = new Date();
    const noticeDays = Math.floor((leaveStart - today) / (1000 * 60 * 60 * 24));

    if (noticeDays < leavePolicy.restrictions.minNoticeDays) {
      throw new AppError(
        `Minimum notice period required: ${leavePolicy.restrictions.minNoticeDays} days before leave start date`,
        400
      );
    }
  }

  // 4. Check maximum consecutive days
  if (leavePolicy.restrictions.maxConsecutiveDays) {
    const leaveStart = new Date(value.startDate);
    const leaveEnd = new Date(value.endDate);
    const consecutiveDays = Math.floor((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;

    if (consecutiveDays > leavePolicy.restrictions.maxConsecutiveDays) {
      throw new AppError(
        `Maximum consecutive leave days allowed: ${leavePolicy.restrictions.maxConsecutiveDays}`,
        400
      );
    }
  }

  // 5. Calculate total days excluding weekends (respecting your schema's totalDays field)
  const calculateWorkingDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      // Monday (1) to Friday (5) are weekdays
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        totalDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    return totalDays;
  };

  const totalDays = calculateWorkingDays(value.startDate, value.endDate);

  // 6. Check leave balance
  const leaveBalance = await LeaveBalance.findOne({
    userId: user._id,
    leaveType: value.leaveType
  });

  if (!leaveBalance || leaveBalance.balance < totalDays) {
    const availableBalance = leaveBalance ? leaveBalance.balance : 0;
    throw new AppError(
      `Insufficient leave balance. Requested: ${totalDays} days, Available: ${availableBalance} days`,
      400
    );
  }

  // 7. Check for overlapping leave requests
  const overlappingLeave = await LeaveRequest.findOne({
    employeeId: user._id,
    status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] }, // Using your STATUS enum values
    $or: [
      {
        startDate: { $lte: value.endDate },
        endDate: { $gte: value.startDate }
      }
    ]
  });

  if (overlappingLeave) {
    throw new AppError('You have an overlapping leave request during this period', 400);
  }

  // 8. Check if relief officer is available during the requested period
  const reliefOfficerBusy = await LeaveRequest.findOne({
    $or: [
      { employeeId: value.reliefOfficerId },
      { reliefOfficerId: value.reliefOfficerId }
    ],
    status: { $in: ['pending-relief', 'pending-manager', 'pending-hr', 'approved'] },
    $or: [
      {
        startDate: { $lte: value.endDate },
        endDate: { $gte: value.startDate }
      }
    ]
  });

  if (reliefOfficerBusy) {
    throw new AppError('Relief officer is not available during the requested leave period', 400);
  }

  // 9. Determine status based on policy requirements
  let status = 'pending-manager';
  let reliefStatus = 'approved';

  // If policy requires relief officer approval
  if (leavePolicy.approvalWorkflow.requireReliefOfficer) {
    reliefStatus = 'pending';
    status = 'pending-relief'; // or 'pending-relief' based on your STATUS enum
  }

  // Create approval history initial entry
  const approvalHistory = [{
    approvedBy: user._id,
    role: 'applicant',
    action: 'submitted',
    notes: 'Leave request submitted',
    timestamp: new Date()
  }];

  const payload = {
    ...value,
    employeeId: _id,
    totalDays,
    status,
    reliefStatus,
    approvalHistory,
    // Include policy reference for tracking
    policyId: leavePolicy._id
  };

  // Create leave request
  const leaveRequest = await LeaveRequest.create(payload);

  // Populate the response with user details
  await leaveRequest.populate('employeeId', 'fullName email employeeId');
  await leaveRequest.populate('reliefOfficerId', 'fullName email employeeId');

  await emailService.notifyReliefOfficer(userDetails, reliefOfficer);

  return ApiResponse.success(leaveRequest, 'Leave request submitted successfully');
});