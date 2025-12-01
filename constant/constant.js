const LEAVETYPE = ['annual', 'sick', 'personal', 'maternity', 'paternity', 'compassionate', 'unpaid', 'emergency']
const ROLE = ['employee', 'manager', 'hr', 'admin']
const EMPLOYEETYPE = ['full-time', 'part-time', 'contract']
const ACCRUAL = ['monthly', 'annual', 'none']
const STATUS = ['draft', 'pending-relief', 'pending-manager', 'pending-hr', 'approved', 'rejected', 'cancelled', 'revoked', 'pending', 'accepted', 'declined']
const APPROVALHISTORY = ['submitted', 'accepted-relief', 'declined-relief', 'approved', 'rejected', 'recalled']
const APPROVALLEVEL = ['applicant', 'relief-officer', 'manager', 'hr']

module.exports = {
  LEAVETYPE,
  ROLE,
  EMPLOYEETYPE,
  ACCRUAL,
  STATUS,
  APPROVALHISTORY,
  APPROVALLEVEL
} 