// app/api/leave-policies/route.js
import LeavePolicy from '@/models/LeavePolicy';
import dbConnect from '@/libs/mongodb';
import { ApiResponse, AppError, withErrorHandler } from '@/libs/errorHandler';
import { getAuthUser } from '@/libs/middleware';
import { authValidation } from '@/libs/validator';

export const GET = withErrorHandler(async (req) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const isActive = searchParams.get('isActive');
  const leaveType = searchParams.get('leaveType');
  const search = searchParams.get('search')

  const filter = {};
  if (isActive !== null) filter.isActive = isActive === 'true';
  if (leaveType) filter.leaveType = leaveType;
  if (search) filter.search = search;

  const data = await LeavePolicy.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return ApiResponse.success(data, '');
})

// app/api/leave-policies/route.js
export const POST = withErrorHandler(async (req) => {

  await dbConnect();

  const { user, errors } = await getAuthUser(req)

  if (errors) return errors;
  if (!user) throw new AppError('Unauthorized', 401);

  const body = await req.json();

  // Validate input
  const { error, value } = authValidation.registerLeavePolicy.validate(body);

  if (error) {
    throw new AppError(`Validation error: ${error.details[0].message}`, 400);
  }

  // Check for duplicate policy name
  const existingPolicy = await LeavePolicy.findOne({
    policyName: new RegExp(`^${value.policyName}$`, 'i'),
  });


  if (existingPolicy) {
    throw new AppError('Policy name already exists', 409);
  }
  
  const existingPolicyType = await LeavePolicy.findOne({
    leaveType: new RegExp(`^${value.leaveType}$`, 'i')
  });


  if (existingPolicyType) {
    throw new AppError('Policy type already exists', 409);
  }

  const policy = await LeavePolicy.create(value)

  return ApiResponse.created(policy, 'Policy created successfully');
})