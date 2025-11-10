// scripts/generateDummyUsers.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config();

// Import constants directly
const { LEAVETYPE, ROLE, EMPLOYEETYPE } = require('../constant/constant');

// Sample data
const departments = [
  { name: 'Engineering', code: 'ENG' },
  { name: 'Sales', code: 'SAL' },
  { name: 'Marketing', code: 'MKT' },
  { name: 'Human Resources', code: 'HR' },
  { name: 'Finance', code: 'FIN' },
  { name: 'Operations', code: 'OPS' },
  { name: 'Customer Support', code: 'CS' },
  { name: 'Product', code: 'PROD' }
];

const branches = [
  { name: 'Lagos Head Office', code: 'LOS' },
  { name: 'Abuja Branch', code: 'ABJ' },
  { name: 'Port Harcourt', code: 'PHC' },
  { name: 'Kano', code: 'KAN' },
  { name: 'Ibadan', code: 'IBD' }
];

const positions = {
  Engineering: ['Software Engineer', 'Senior Developer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer', 'Frontend Developer', 'Backend Developer'],
  Sales: ['Sales Executive', 'Sales Manager', 'Account Executive', 'Business Development', 'Sales Representative'],
  Marketing: ['Marketing Manager', 'Content Writer', 'SEO Specialist', 'Digital Marketer', 'Social Media Manager'],
  'Human Resources': ['HR Manager', 'Recruiter', 'HR Specialist', 'Talent Acquisition'],
  Finance: ['Accountant', 'Financial Analyst', 'Finance Manager', 'Bookkeeper'],
  Operations: ['Operations Manager', 'Logistics Coordinator', 'Operations Specialist'],
  'Customer Support': ['Support Agent', 'Support Manager', 'Customer Success'],
  Product: ['Product Manager', 'Product Designer', 'UX Researcher']
};

const levels = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

// Generate random Nigerian names
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

// Generate random phone numbers
function generatePhoneNumber() {
  const prefixes = ['080', '081', '070', '090', '091'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(10000000 + Math.random() * 90000000);
  return `${prefix}${number}`;
}

// Generate employee ID
function generateEmployeeId(departmentCode, index) {
  const year = new Date().getFullYear();
  const seq = (index + 1).toString().padStart(3, '0');
  return `${departmentCode}${year}${seq}`;
}

// Generate leave balance based on employment type
function generateLeaveBalance(employmentType) {
  const baseBalance = {
    annual: employmentType === 'full-time' ? 21 : employmentType === 'part-time' ? 10 : 0,
    sick: employmentType === 'full-time' ? 10 : employmentType === 'part-time' ? 5 : 0,
    personal: employmentType === 'full-time' ? 5 : employmentType === 'part-time' ? 3 : 0,
    maternity: 84,
    paternity: 14,
    compassionate: 5,
    unpaid: 0,
    emergency: 3
  };

  // Create the full leave balance object with all types
  const leaveBalance = {};
  LEAVETYPE.forEach(type => {
    leaveBalance[type] = baseBalance[type] || 0;
  });

  return leaveBalance;
}

// Generate random date within range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Create a simple User schema for this script
function createUserSchema() {
  const leaveBalanceSchemaFields = {};
  LEAVETYPE.forEach(type => {
    leaveBalanceSchemaFields[type] = { type: Number, default: 0 };
  });

  return new mongoose.Schema({
    employeeId: {
      type: String,
      required: true,
      unique: true
    },
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ROLE,
      default: 'employee'
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    position: String,
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    employmentType: {
      type: String,
      enum: EMPLOYEETYPE,
      default: 'full-time'
    },
    joinDate: {
      type: Date,
      required: true
    },
    branch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: true
    },
    levels: {
      type: String,
    },
    leaveBalance: leaveBalanceSchemaFields,
    isActive: {
      type: Boolean,
      default: true
    },
    personalInfo: {
      dateOfBirth: {
        type: Date,
        required: true
      },
      phoneNumber: String,
      emergencyContact: {
        emergencyName: String,
        emergencyRelationship: String,
        emergencyPhone: String
      }
    },
    preferences: {
      notifications: { type: Boolean, default: true },
      autoRelief: { type: Boolean, default: false }
    }
  }, {
    timestamps: true
  });
}

// Create simple Department schema
const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  contactEmail: String,
  headCount: {
    type: Number,
    default: 0
  },
  leaveSettings: {
    maxConcurrentLeaves: Number,
    requiredCoverage: { type: Number, default: 70 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create simple Branch schema
const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  contactEmail: String,
  headCount: {
    type: Number,
    default: 0
  },
  leaveSettings: {
    maxConcurrentLeaves: Number,
    requiredCoverage: { type: Number, default: 70 }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate dummy users
async function generateDummyUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB');

    // Register models
    const User = mongoose.model('User', createUserSchema());
    const Department = mongoose.model('Department', departmentSchema);
    const Branch = mongoose.model('Branch', branchSchema);

    // Clear existing data (optional - uncomment if you want fresh data)
    // await User.deleteMany({});
    // await Department.deleteMany({});
    // await Branch.deleteMany({});
    // console.log('Cleared existing data');

    // Create departments
    const createdDepartments = [];
    for (const dept of departments) {
      const department = await Department.findOneAndUpdate(
        { code: dept.code },
        {
          name: dept.name,
          code: dept.code,
          contactEmail: `${dept.code.toLowerCase()}@company.com`,
          headCount: 0,
          isActive: true
        },
        { upsert: true, new: true }
      );
      createdDepartments.push(department);
      console.log(`Created/Updated department: ${dept.name}`);
    }

    // Create branches
    const createdBranches = [];
    for (const branch of branches) {
      const newBranch = await Branch.findOneAndUpdate(
        { code: branch.code },
        {
          name: branch.name,
          code: branch.code,
          contactEmail: `${branch.code.toLowerCase()}@company.com`,
          headCount: 0,
          isActive: true
        },
        { upsert: true, new: true }
      );
      createdBranches.push(newBranch);
      console.log(`Created/Updated branch: ${branch.name}`);
    }

    // Generate users
    const users = [];
    let userIndex = 0;

    // Create admin user
    const adminUser = {
      employeeId: 'ADMIN001',
      fullName: 'System Administrator',
      email: 'admin@company.com',
      password: await bcrypt.hash('admin123', 12),
      role: 'admin',
      department: createdDepartments.find(d => d.code === 'HR')._id,
      position: 'System Administrator',
      employmentType: 'full-time',
      joinDate: new Date('2020-01-01'),
      branch: createdBranches.find(b => b.code === 'LOS')._id,
      levels: 'L6',
      leaveBalance: generateLeaveBalance('full-time'),
      isActive: true,
      personalInfo: {
        dateOfBirth: new Date('1985-01-01'),
        phoneNumber: generatePhoneNumber(),
        emergencyContact: {
          emergencyName: 'Emergency Contact',
          emergencyRelationship: 'Spouse',
          emergencyPhone: generatePhoneNumber()
        }
      },
      preferences: {
        notifications: true,
        autoRelief: false
      }
    };
    users.push(adminUser);

    // Create HR users
    for (let i = 0; i < 2; i++) {
      const hrDept = createdDepartments.find(d => d.code === 'HR');
      const user = {
        employeeId: generateEmployeeId('HR', userIndex),
        fullName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        email: `hr${i + 1}@company.com`,
        password: await bcrypt.hash('password123', 12),
        role: 'hr',
        department: hrDept._id,
        position: positions['Human Resources'][Math.floor(Math.random() * positions['Human Resources'].length)],
        employmentType: 'full-time',
        joinDate: randomDate(new Date('2019-01-01'), new Date('2023-12-31')),
        branch: createdBranches[Math.floor(Math.random() * createdBranches.length)]._id,
        levels: levels[Math.floor(Math.random() * levels.length)],
        leaveBalance: generateLeaveBalance('full-time'),
        isActive: true,
        personalInfo: {
          dateOfBirth: randomDate(new Date('1970-01-01'), new Date('1995-12-31')),
          phoneNumber: generatePhoneNumber(),
          emergencyContact: {
            emergencyName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            emergencyRelationship: ['Spouse', 'Parent', 'Sibling'][Math.floor(Math.random() * 3)],
            emergencyPhone: generatePhoneNumber()
          }
        },
        preferences: {
          notifications: true,
          autoRelief: Math.random() > 0.5
        }
      };
      users.push(user);
      userIndex++;
    }

    // Create managers and employees for each department
    const managers = [];
    for (const department of createdDepartments) {
      const deptName = department.name;

      // Create manager for department
      const manager = {
        employeeId: generateEmployeeId(department.code, userIndex),
        fullName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
        email: `${department.code.toLowerCase()}.manager@company.com`,
        password: await bcrypt.hash('password123', 12),
        role: 'manager',
        department: department._id,
        position: `${deptName} Manager`,
        employmentType: 'full-time',
        joinDate: randomDate(new Date('2018-01-01'), new Date('2023-12-31')),
        branch: createdBranches[Math.floor(Math.random() * createdBranches.length)]._id,
        levels: 'L5',
        leaveBalance: generateLeaveBalance('full-time'),
        isActive: true,
        personalInfo: {
          dateOfBirth: randomDate(new Date('1975-01-01'), new Date('1990-12-31')),
          phoneNumber: generatePhoneNumber(),
          emergencyContact: {
            emergencyName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
            emergencyRelationship: ['Spouse', 'Parent', 'Sibling'][Math.floor(Math.random() * 3)],
            emergencyPhone: generatePhoneNumber()
          }
        },
        preferences: {
          notifications: true,
          autoRelief: Math.random() > 0.5
        }
      };
      users.push(manager);
      managers.push(manager);
      userIndex++;

      // Create employees for this department (3-8 employees per department)
      const employeeCount = Math.floor(Math.random() * 6) + 3;
      for (let i = 0; i < employeeCount; i++) {
        const employmentType = ['full-time', 'full-time', 'full-time', 'part-time', 'contract'][Math.floor(Math.random() * 5)];
        const user = {
          employeeId: generateEmployeeId(department.code, userIndex),
          fullName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
          email: `employee.${department.code.toLowerCase()}${userIndex}@company.com`,
          password: await bcrypt.hash('password123', 12),
          role: 'employee',
          department: department._id,
          managerId: manager._id,
          position: positions[deptName] ? positions[deptName][Math.floor(Math.random() * positions[deptName].length)] : 'Team Member',
          employmentType: employmentType,
          joinDate: randomDate(new Date('2020-01-01'), new Date('2024-12-31')),
          branch: createdBranches[Math.floor(Math.random() * createdBranches.length)]._id,
          levels: levels[Math.floor(Math.random() * 3)],
          leaveBalance: generateLeaveBalance(employmentType),
          isActive: Math.random() > 0.1,
          personalInfo: {
            dateOfBirth: randomDate(new Date('1985-01-01'), new Date('2000-12-31')),
            phoneNumber: generatePhoneNumber(),
            emergencyContact: {
              emergencyName: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
              emergencyRelationship: ['Spouse', 'Parent', 'Sibling'][Math.floor(Math.random() * 3)],
              emergencyPhone: generatePhoneNumber()
            }
          },
          preferences: {
            notifications: true,
            autoRelief: Math.random() > 0.5
          }
        };
        users.push(user);
        userIndex++;
      }
    }

    // Insert users into database
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.findOneAndUpdate(
        { email: userData.email },
        userData,
        { upsert: true, new: true }
      );
      createdUsers.push(user);
      console.log(`Created/Updated user: ${userData.fullName} (${userData.email})`);
    }

    console.log('\n=== DUMMY DATA GENERATION COMPLETE ===');
    console.log(`Created/Updated ${createdDepartments.length} departments`);
    console.log(`Created/Updated ${createdBranches.length} branches`);
    console.log(`Created/Updated ${createdUsers.length} users`);

    // Display login credentials
    console.log('\n=== DEFAULT LOGIN CREDENTIALS ===');
    console.log('Admin: admin@company.com / admin123');
    console.log('HR: hr1@company.com / password123');
    console.log('Managers: [dept-code].manager@company.com / password123');
    console.log('Employees: employee.[dept-code][number]@company.com / password123');
    console.log('\nAll passwords: "password123" (except admin: "admin123")');

  } catch (error) {
    console.error('Error generating dummy data:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the script
generateDummyUsers();