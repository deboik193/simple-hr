// scripts/generateRealisticDummyData.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

require('module-alias/register');
// OR if you have custom aliases in package.json
require('module-alias').addAliases({
  '@': __dirname + '/..'
});

// Import constants using relative path
const { LEAVETYPE, ROLE, EMPLOYEETYPE } = require('../constant/constant');

// Import actual models
const User = require('../models/User');
const Department = require('../models/Department');
const Branch = require('../models/Branch');
const InitialLeaveBalance = require('../models/InitialLeaveBalance');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');

// Sample data that matches your actual schemas
const departmentsData = [
  {
    name: 'Engineering',
    contactEmail: 'engineering@company.com',
    leaveSettings: { maxConcurrentLeaves: 3, requiredCoverage: 70 }
  },
  {
    name: 'Sales',
    contactEmail: 'sales@company.com',
    leaveSettings: { maxConcurrentLeaves: 4, requiredCoverage: 60 }
  },
  {
    name: 'Marketing',
    contactEmail: 'marketing@company.com',
    leaveSettings: { maxConcurrentLeaves: 3, requiredCoverage: 65 }
  },
  {
    name: 'Human Resources',
    contactEmail: 'hr@company.com',
    leaveSettings: { maxConcurrentLeaves: 2, requiredCoverage: 75 }
  },
  {
    name: 'Finance',
    contactEmail: 'finance@company.com',
    leaveSettings: { maxConcurrentLeaves: 2, requiredCoverage: 80 }
  },
  {
    name: 'Operations',
    contactEmail: 'operations@company.com',
    leaveSettings: { maxConcurrentLeaves: 3, requiredCoverage: 70 }
  },
  {
    name: 'Customer Support',
    contactEmail: 'support@company.com',
    leaveSettings: { maxConcurrentLeaves: 5, requiredCoverage: 50 }
  },
  {
    name: 'Product',
    contactEmail: 'product@company.com',
    leaveSettings: { maxConcurrentLeaves: 2, requiredCoverage: 75 }
  }
];

const branchesData = [
  {
    name: 'Lagos Head Office',
    contactEmail: 'lagos@company.com',
    leaveSettings: { maxConcurrentLeaves: 10, requiredCoverage: 60 }
  },
  {
    name: 'Abuja Branch',
    contactEmail: 'abuja@company.com',
    leaveSettings: { maxConcurrentLeaves: 5, requiredCoverage: 70 }
  },
  {
    name: 'Port Harcourt',
    contactEmail: 'portharcourt@company.com',
    leaveSettings: { maxConcurrentLeaves: 4, requiredCoverage: 75 }
  },
  {
    name: 'Kano',
    contactEmail: 'kano@company.com',
    leaveSettings: { maxConcurrentLeaves: 3, requiredCoverage: 80 }
  },
  {
    name: 'Ibadan',
    contactEmail: 'ibadan@company.com',
    leaveSettings: { maxConcurrentLeaves: 3, requiredCoverage: 75 }
  }
];

// Nigerian names
const firstNames = [
  'Chinedu', 'Adebayo', 'Chiamaka', 'Oluwatobi', 'Ngozi', 'Emeka', 'Fatima',
  'Ibrahim', 'Aisha', 'Kunle', 'Bola', 'Tunde', 'Yemi', 'Funke', 'Segun',
  'Halima', 'Mohammed', 'Grace', 'Daniel', 'Jennifer', 'David', 'Sarah',
  'James', 'Elizabeth', 'Michael', 'Blessing', 'John', 'Patience', 'Peter'
];

const lastNames = [
  'Adeyemi', 'Okafor', 'Mohammed', 'Ibrahim', 'Okoro', 'Adebayo', 'Suleiman',
  'Chukwu', 'Bello', 'Musa', 'Ogunleye', 'Aliyu', 'Eze', 'Oladipo', 'Yusuf',
  'Nwosu', 'Abdullahi', 'Obi', 'Sani', 'Oluwaseun', 'Akinwumi', 'Balogun',
  'Okeke', 'Babatunde', 'Afolayan', 'Umar', 'Onyeka', 'Ismail', 'Ajayi'
];

// Department-specific positions
const positions = {
  'Engineering': ['Software Engineer', 'Senior Developer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer'],
  'Sales': ['Sales Executive', 'Sales Manager', 'Account Executive', 'Business Development'],
  'Marketing': ['Marketing Manager', 'Content Writer', 'SEO Specialist', 'Digital Marketer'],
  'Human Resources': ['HR Manager', 'Recruiter', 'HR Specialist', 'Talent Acquisition'],
  'Finance': ['Accountant', 'Financial Analyst', 'Finance Manager', 'Bookkeeper'],
  'Operations': ['Operations Manager', 'Logistics Coordinator', 'Operations Specialist'],
  'Customer Support': ['Support Agent', 'Support Manager', 'Customer Success'],
  'Product': ['Product Manager', 'Product Designer', 'UX Researcher']
};

const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

// Helper functions
function generatePhoneNumber() {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
}

function generateEmployeeId(fullName) {
  const initials = fullName
    .split(' ')
    .map(n => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 3);

  const uniqueId = Date.now().toString().slice(-6);
  return `${initials}${uniqueId}`;
}

async function generateTemporaryPassword() {
  return crypto.randomBytes(8).toString('hex');
}

async function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Function to temporarily disable pre-save hooks
function disablePreSaveHooks() {
  // Store original hooks
  const originalHooks = {
    user: User.schema._preSave,
    department: Department.schema._preSave,
    branch: Branch.schema._preSave,
    initialLeaveBalance: mongoose.models.InitialLeaveBalance?.schema?._preSave
  };

  // Remove hooks temporarily
  User.schema._preSave = [];
  Department.schema._preSave = [];
  Branch.schema._preSave = [];
  if (mongoose.models.InitialLeaveBalance) {
    mongoose.models.InitialLeaveBalance.schema._preSave = [];
  }

  return originalHooks;
}

// Function to restore pre-save hooks
function restorePreSaveHooks(originalHooks) {
  if (originalHooks.user) User.schema._preSave = originalHooks.user;
  if (originalHooks.department) Department.schema._preSave = originalHooks.department;
  if (originalHooks.branch) Branch.schema._preSave = originalHooks.branch;
  if (originalHooks.initialLeaveBalance && mongoose.models.InitialLeaveBalance) {
    mongoose.models.InitialLeaveBalance.schema._preSave = originalHooks.initialLeaveBalance;
  }
}

// Get initial leave balance from database using INITIAL_BALANCE_ID
async function getInitialLeaveBalance() {
  const INITIAL_BALANCE_ID = process.env.INITIAL_BALANCE_ID || '68ff46338509515e3f0f46ac';

  console.log(`Fetching initial leave balance with ID: ${INITIAL_BALANCE_ID}`);

  const initialBalance = await InitialLeaveBalance.findById(INITIAL_BALANCE_ID);

  if (!initialBalance) {
    console.error(`Initial leave balance with ID ${INITIAL_BALANCE_ID} not found!`);
    console.log('Creating default initial leave balance...');

    // Create default initial leave balance
    const defaultBalance = {
      annual: 21,
      sick: 10,
      personal: 5,
      maternity: 84,
      paternity: 14,
      compassionate: 5,
      unpaid: 0,
      emergency: 3
    };

    // Add defaults for all leave types
    LEAVETYPE.forEach(type => {
      if (!(type in defaultBalance)) {
        defaultBalance[type] = 0;
      }
    });

    const newBalance = await InitialLeaveBalance.create({
      ...defaultBalance,
      isActive: true
    });

    console.log(`Created new initial leave balance with ID: ${newBalance._id}`);
    return newBalance;
  }

  console.log('Found existing initial leave balance');
  return initialBalance;
}

// Create leave balance for a user based on initial balance configuration
function createUserLeaveBalanceFromInitial(initialBalance, employmentType) {
  const leaveBalance = {};

  // Start with initial balance values
  LEAVETYPE.forEach(type => {
    leaveBalance[type] = initialBalance[type] || 0;
  });

  // Adjust based on employment type
  if (employmentType === 'part-time') {
    // Part-time employees get half of full-time leave
    leaveBalance.annual = Math.floor(leaveBalance.annual / 2);
    leaveBalance.sick = Math.floor(leaveBalance.sick / 2);
    leaveBalance.personal = Math.floor(leaveBalance.personal / 2);
  } else if (employmentType === 'contract') {
    // Contract employees get minimal leave
    leaveBalance.annual = 0;
    leaveBalance.sick = 5;
    leaveBalance.personal = 0;
    leaveBalance.maternity = 0;
    leaveBalance.paternity = 0;
  }

  return leaveBalance;
}

// Create leave policies
async function createLeavePolicies() {
  const policies = [
    {
      leaveType: 'annual',
      name: 'Annual Leave',
      description: 'Paid time off for vacation',
      isActive: true,
      accrual: { rate: 1.75, frequency: 'monthly', maxBalance: 30 },
      carryOver: { enabled: true, maxDays: 10 },
      eligibility: {
        employmentTypes: ['full-time', 'part-time'],
        minServiceMonths: 3
      }
    },
    {
      leaveType: 'sick',
      name: 'Sick Leave',
      description: 'Paid time off for illness',
      isActive: true,
      accrual: { rate: 0.83, frequency: 'monthly', maxBalance: 15 },
      carryOver: { enabled: false, maxDays: 0 },
      eligibility: {
        employmentTypes: ['full-time', 'part-time'],
        minServiceMonths: 0
      }
    },
    {
      leaveType: 'maternity',
      name: 'Maternity Leave',
      description: 'Leave for childbirth',
      isActive: true,
      accrual: { rate: 0, frequency: 'none', maxBalance: 84 },
      carryOver: { enabled: false, maxDays: 0 },
      eligibility: {
        employmentTypes: ['full-time', 'part-time'],
        minServiceMonths: 12
      }
    }
  ];

  for (const policy of policies) {
    await LeavePolicy.findOneAndUpdate(
      { leaveType: policy.leaveType },
      policy,
      { upsert: true, new: true }
    );
    console.log(`Created/Updated leave policy: ${policy.name}`);
  }
}

// Create departments and branches
async function createDepartmentsAndBranches() {
  const departments = [];
  const branches = [];

  // Create departments
  for (const deptData of departmentsData) {
    const department = await Department.findOneAndUpdate(
      { name: deptData.name },
      {
        ...deptData,
        isActive: true,
        headCount: 0
      },
      { upsert: true, new: true }
    );
    departments.push(department);
    console.log(`Created/Updated department: ${department.name}`);
  }

  // Create branches
  for (const branchData of branchesData) {
    const branch = await Branch.findOneAndUpdate(
      { name: branchData.name },
      {
        ...branchData,
        isActive: true,
        headCount: 0
      },
      { upsert: true, new: true }
    );
    branches.push(branch);
    console.log(`Created/Updated branch: ${branch.name}`);
  }

  return { departments, branches };
}

// Check if HR user already exists, if not create one
async function getOrCreateHRUser(departments, branches, initialBalance) {
  // First, check if HR user already exists
  const existingHR = await User.findOne({ role: 'hr', isActive: true });

  if (existingHR) {
    console.log(`Using existing HR user: ${existingHR.fullName} (${existingHR.email})`);
    return existingHR;
  }

  // If no HR exists, create one
  const hrDepartment = departments.find(d => d.name === 'Human Resources');
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  const fullName = `${firstName} ${lastName}`;

  const hrData = {
    employeeId: generateEmployeeId(fullName),
    fullName,
    email: 'hr@company.com',
    password: await hashPassword('password123'),
    role: 'hr',
    department: hrDepartment._id,
    position: 'HR Manager',
    employmentType: 'full-time',
    joinDate: randomDate(new Date('2019-01-01'), new Date('2023-12-31')),
    branch: getRandomElement(branches)._id,
    levels: 'L5',
    isActive: true,
    personalInfo: {
      dateOfBirth: randomDate(new Date('1980-01-01'), new Date('1990-12-31')),
      phoneNumber: generatePhoneNumber(),
      emergencyContact: {
        name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
        relationship: getRandomElement(['Spouse', 'Parent', 'Sibling']),
        phone: generatePhoneNumber()
      }
    },
    preferences: {
      notifications: true,
      autoRelief: true
    }
  };

  // Add leave balance from initial configuration
  hrData.leaveBalance = createUserLeaveBalanceFromInitial(initialBalance, hrData.employmentType);

  const hrUser = await User.findOneAndUpdate(
    { email: hrData.email },
    hrData,
    { upsert: true, new: true }
  );

  console.log(`Created HR user: ${hrUser.fullName}`);
  return hrUser;
}

// Create admin user
async function createAdminUser(departments, branches, initialBalance) {
  const adminData = {
    employeeId: 'ADMIN001',
    fullName: 'System Administrator',
    email: 'admin@company.com',
    password: await hashPassword('admin123'),
    role: 'admin',
    department: departments.find(d => d.name === 'Human Resources')._id,
    position: 'System Administrator',
    employmentType: 'full-time',
    joinDate: new Date('2020-01-01'),
    branch: branches.find(b => b.name === 'Lagos Head Office')._id,
    levels: 'L6',
    isActive: true,
    personalInfo: {
      dateOfBirth: new Date('1985-01-01'),
      phoneNumber: generatePhoneNumber(),
      emergencyContact: {
        name: 'Emergency Contact',
        relationship: 'Spouse',
        phone: generatePhoneNumber()
      }
    },
    preferences: {
      notifications: true,
      autoRelief: false
    }
  };

  // Add leave balance from initial configuration
  adminData.leaveBalance = createUserLeaveBalanceFromInitial(initialBalance, adminData.employmentType);

  const adminUser = await User.findOneAndUpdate(
    { email: adminData.email },
    adminData,
    { upsert: true, new: true }
  );

  console.log(`Created/Updated admin user: ${adminUser.fullName}`);
  return adminUser;
}

// Create managers and their teams
async function createManagersAndTeams(departments, branches, initialBalance) {
  const allUsers = [];
  const managersMap = new Map(); // department._id -> manager user

  // First, create all managers (except HR department which might have HR as manager)
  for (const department of departments) {
    if (department.name === 'Human Resources') continue; // Skip HR department for now

    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const fullName = `${firstName} ${lastName}`;

    const managerData = {
      employeeId: generateEmployeeId(fullName),
      fullName,
      email: `${department.name.toLowerCase().replace(/\s+/g, '.')}.manager@company.com`,
      password: await hashPassword('password123'),
      role: 'manager',
      department: department._id,
      position: `${department.name} Manager`,
      employmentType: 'full-time',
      joinDate: randomDate(new Date('2018-01-01'), new Date('2023-06-30')),
      branch: getRandomElement(branches)._id,
      levels: 'L5',
      isActive: true,
      personalInfo: {
        dateOfBirth: randomDate(new Date('1975-01-01'), new Date('1985-12-31')),
        phoneNumber: generatePhoneNumber(),
        emergencyContact: {
          name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
          relationship: getRandomElement(['Spouse', 'Parent', 'Sibling']),
          phone: generatePhoneNumber()
        }
      },
      preferences: {
        notifications: true,
        autoRelief: Math.random() > 0.5
      }
    };

    // Add leave balance from initial configuration
    managerData.leaveBalance = createUserLeaveBalanceFromInitial(initialBalance, managerData.employmentType);

    const manager = await User.findOneAndUpdate(
      { email: managerData.email },
      managerData,
      { upsert: true, new: true }
    );

    managersMap.set(department._id.toString(), manager);
    allUsers.push(manager);
    console.log(`Created/Updated manager: ${manager.fullName} for ${department.name}`);
  }

  // Now create team members for each department
  for (const department of departments) {
    if (department.name === 'Human Resources') {
      // HR department only has HR users (already created)
      continue;
    }

    const manager = managersMap.get(department._id.toString());
    const employeeCount = Math.floor(Math.random() * 6) + 3; // 3-8 employees

    for (let i = 0; i < employeeCount; i++) {
      const firstName = getRandomElement(firstNames);
      const lastName = getRandomElement(lastNames);
      const fullName = `${firstName} ${lastName}`;

      const employmentType = getRandomElement(['full-time', 'full-time', 'full-time', 'part-time', 'contract']);

      const userData = {
        employeeId: generateEmployeeId(fullName),
        fullName,
        email: `employee.${department.name.toLowerCase().replace(/\s+/g, '')}${i + 1}@company.com`,
        password: await hashPassword('password123'),
        role: 'employee',
        department: department._id,
        managerId: manager._id,
        position: positions[department.name]
          ? getRandomElement(positions[department.name])
          : 'Team Member',
        employmentType,
        joinDate: randomDate(new Date('2020-01-01'), new Date('2024-06-30')),
        branch: getRandomElement(branches)._id,
        levels: getRandomElement(['L1', 'L2', 'L3']),
        isActive: Math.random() > 0.1, // 90% active
        personalInfo: {
          dateOfBirth: randomDate(new Date('1985-01-01'), new Date('2000-12-31')),
          phoneNumber: generatePhoneNumber(),
          emergencyContact: {
            name: `${getRandomElement(firstNames)} ${getRandomElement(lastNames)}`,
            relationship: getRandomElement(['Spouse', 'Parent', 'Sibling']),
            phone: generatePhoneNumber()
          }
        },
        preferences: {
          notifications: true,
          autoRelief: Math.random() > 0.5
        }
      };

      // Add leave balance from initial configuration
      userData.leaveBalance = createUserLeaveBalanceFromInitial(initialBalance, employmentType);

      const user = await User.findOneAndUpdate(
        { email: userData.email },
        userData,
        { upsert: true, new: true }
      );

      allUsers.push(user);
      console.log(`Created/Updated employee: ${user.fullName} in ${department.name}`);
    }
  }

  return { allUsers, managersMap };
}

// Update department/branch manager references and head counts
async function updateDepartmentAndBranchStats(departments, branches, managersMap, allUsers) {
  // Update department managers and head counts
  for (const department of departments) {
    const manager = managersMap.get(department._id.toString());
    const headCount = allUsers.filter(user =>
      user.department.toString() === department._id.toString()
    ).length;

    await Department.findByIdAndUpdate(department._id, {
      managerId: manager ? manager._id : null,
      headCount
    });

    console.log(`Updated department ${department.name}: headCount=${headCount}`);
  }

  // Update branch head counts
  for (const branch of branches) {
    const headCount = allUsers.filter(user =>
      user.branch.toString() === branch._id.toString()
    ).length;

    await Branch.findByIdAndUpdate(branch._id, {
      headCount
    });

    console.log(`Updated branch ${branch.name}: headCount=${headCount}`);
  }
}

// Create leave balance records for all users
async function createUserLeaveBalanceRecords(users) {
  const currentYear = new Date().getFullYear();

  for (const user of users) {
    const leavePolicies = await LeavePolicy.find({
      isActive: true,
      'eligibility.employmentTypes': user.employmentType
    });

    if (leavePolicies.length === 0) continue;

    // Delete existing leave balances for this user
    await LeaveBalance.deleteMany({ userId: user._id });

    const balanceDocs = leavePolicies.map(policy => {
      const joinDate = new Date(user.joinDate);
      const today = new Date();

      // Calculate initial balance based on months worked
      const monthsWorked = (today.getFullYear() - joinDate.getFullYear()) * 12 +
        (today.getMonth() - joinDate.getMonth());

      const initialBalance = monthsWorked <= 0
        ? 0
        : Math.min(monthsWorked * policy.accrual.rate, policy.accrual.maxBalance);

      return {
        userId: user._id,
        leaveType: policy.leaveType,
        balance: initialBalance,
        accrualRate: policy.accrual.rate,
        maxAccrual: policy.accrual.maxBalance,
        carryOverLimit: policy.carryOver.enabled ? policy.carryOver.maxDays : 0,
        carryOverUsed: 0,
        fiscalYear: currentYear,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    if (balanceDocs.length > 0) {
      await LeaveBalance.insertMany(balanceDocs);
      console.log(`Created leave balance records for: ${user.fullName}`);
    }
  }
}

// Main function
async function generateRealisticDummyData() {
  let originalHooks = null;

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Temporarily disable pre-save hooks to prevent lowercase conversion
    originalHooks = disablePreSaveHooks();
    console.log('Temporarily disabled pre-save hooks');

    // Get initial leave balance from your specified ID
    const initialBalance = await getInitialLeaveBalance();
    console.log('Initial leave balance configuration loaded');

    // Create leave policies
    await createLeavePolicies();

    // Create departments and branches
    const { departments, branches } = await createDepartmentsAndBranches();

    // Create admin user
    const adminUser = await createAdminUser(departments, branches, initialBalance);

    // Get or create HR user (only 1)
    const hrUser = await getOrCreateHRUser(departments, branches, initialBalance);

    // Create managers and teams
    const { allUsers, managersMap } = await createManagersAndTeams(departments, branches, initialBalance);

    // Combine all users
    const allCreatedUsers = [adminUser, hrUser, ...allUsers];

    // Update department and branch statistics
    await updateDepartmentAndBranchStats(departments, branches, managersMap, allCreatedUsers);

    // Create leave balance records for all users
    await createUserLeaveBalanceRecords(allCreatedUsers);

    // Display summary
    console.log('\n' + '='.repeat(50));
    console.log('DUMMY DATA GENERATION COMPLETE');
    console.log('='.repeat(50));
    console.log(`Total Departments: ${departments.length}`);
    console.log(`Total Branches: ${branches.length}`);
    console.log(`Total Users: ${allCreatedUsers.length}`);

    const roleCounts = allCreatedUsers.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    console.log('\nUser Distribution by Role:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`  ${role}: ${count}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('DEFAULT LOGIN CREDENTIALS');
    console.log('='.repeat(50));
    console.log('Admin: admin@company.com / admin123');
    console.log('HR: hr@company.com / password123');
    console.log('Managers: [department].manager@company.com / password123');
    console.log('Employees: employee.[department][number]@company.com / password123');
    console.log('\nAll employee passwords: "password123"');
    console.log('Admin password: "admin123"');

    console.log('\n' + '='.repeat(50));
    console.log('IMPORTANT NOTES');
    console.log('='.repeat(50));
    console.log('1. User leave balances are set from InitialLeaveBalance ID:', process.env.INITIAL_BALANCE_ID || '68ff46338509515e3f0f46ac');
    console.log('2. Leave balance records created in LeaveBalance collection');
    console.log('3. Department/Branch headCount fields updated');
    console.log('4. Existing HR user was preserved (only 1 HR user total)');

  } catch (error) {
    console.error('Error generating dummy data:', error);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Restore pre-save hooks
    if (originalHooks) {
      restorePreSaveHooks(originalHooks);
      console.log('\nRestored pre-save hooks');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
if (require.main === module) {
  generateRealisticDummyData();
}

module.exports = { generateRealisticDummyData };