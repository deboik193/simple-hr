// scripts/assignDefaultLeaveBalances.js
const mongoose = require('mongoose');
require('dotenv').config();

require('module-alias/register');
// OR if you have custom aliases in package.json
require('module-alias').addAliases({
  '@': __dirname + '/..'
});

// Import models
const User = require('../models/User');
const InitialLeaveBalance = require('../models/InitialLeaveBalance');
const LeavePolicy = require('../models/LeavePolicy');
const LeaveBalance = require('../models/LeaveBalance');

async function assignDefaultLeaveBalances() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE_URL);
    console.log('Connected to MongoDB\n');

    // Validate required environment variable
    const INITIAL_BALANCE_ID = process.env.INITIAL_BALANCE_ID;
    if (!INITIAL_BALANCE_ID) {
      throw new Error('INITIAL_BALANCE_ID environment variable is required');
    }

    // Get initial leave balance configuration
    const initialBalanceConfig = await InitialLeaveBalance.findById(INITIAL_BALANCE_ID);

    if (!initialBalanceConfig) {
      throw new Error(`Initial leave balance with ID ${INITIAL_BALANCE_ID} not found`);
    }

    console.log('📊 Initial Leave Balance Configuration:');
    console.log(`ID: ${initialBalanceConfig._id}`);

    // Extract only leave type fields (exclude metadata)
    const leaveTypes = {};
    Object.entries(initialBalanceConfig.toObject()).forEach(([key, value]) => {
      if (!['_id', 'isActive', 'createdAt', 'updatedAt', '__v'].includes(key)) {
        leaveTypes[key] = value;
        console.log(`  ${key}: ${value} days`);
      }
    });

    if (Object.keys(leaveTypes).length === 0) {
      throw new Error('No leave types found in initial balance configuration');
    }

    console.log(`\n📋 Found ${Object.keys(leaveTypes).length} leave types in configuration\n`);

    // Get all active users
    const activeUsers = await User.find({ isActive: true })
      .select('_id fullName employeeId email employmentType')
      .lean();

    console.log(`👥 Found ${activeUsers.length} active users\n`);

    const currentYear = new Date().getFullYear();
    let totalUsersProcessed = 0;
    let totalLeaveBalancesCreated = 0;
    let totalLeaveBalancesUpdated = 0;
    let totalLeaveBalancesSkipped = 0;

    // Process each active user
    for (const user of activeUsers) {
      console.log(`🔄 Processing: ${user.fullName} (${user.employeeId}) - ${user.employmentType}`);

      let userBalancesCreated = 0;
      let userBalancesUpdated = 0;
      let userBalancesSkipped = 0;

      // Process each leave type from initial configuration
      for (const [leaveType, defaultBalance] of Object.entries(leaveTypes)) {
        // Check if there's an applicable policy for this employment type
        const applicablePolicy = await LeavePolicy.findOne({
          isActive: true,
          leaveType: leaveType,
          'eligibility.employmentTypes': user.employmentType
        }).lean();

        if (!applicablePolicy) {
          console.log(`   ⚠️  ${leaveType}: No active policy for ${user.employmentType} employees`);
          userBalancesSkipped++;
          continue;
        }

        // Check existing LeaveBalance document
        const existingBalance = await LeaveBalance.findOne({
          userId: user._id,
          leaveType: leaveType,
          fiscalYear: currentYear
        });

        // Calculate adjusted balance based on employment type
        let adjustedBalance = defaultBalance;

        if (user.employmentType === 'part-time') {
          // Part-time employees get half (rounded down)
          adjustedBalance = Math.floor(defaultBalance / 2);
        } else if (user.employmentType === 'contract') {
          // Contract employees only get sick leave (5 days max), others = 0
          if (leaveType === 'sick') {
            adjustedBalance = Math.min(defaultBalance, 5);
          } else {
            adjustedBalance = 0;
          }
        }

        // Skip if existing balance > 0
        if (existingBalance && existingBalance.balance > 0) {
          console.log(`   ✓ ${leaveType}: Already has ${existingBalance.balance} days (skipping)`);
          userBalancesSkipped++;
          continue;
        }

        // Prepare balance data
        const balanceData = {
          userId: user._id,
          leaveType: leaveType,
          balance: adjustedBalance,
          accrualRate: applicablePolicy.accrual?.rate || 0,
          maxAccrual: applicablePolicy.accrual?.maxBalance || adjustedBalance,
          carryOverLimit: applicablePolicy.carryOver?.enabled ? applicablePolicy.carryOver.maxDays : 0,
          carryOverUsed: 0,
          fiscalYear: currentYear,
          updatedAt: new Date()
        };

        if (existingBalance) {
          // Update existing zero balance
          await LeaveBalance.findByIdAndUpdate(existingBalance._id, {
            $set: balanceData
          });
          userBalancesUpdated++;
          console.log(`   ↻ ${leaveType}: Updated from ${existingBalance.balance} to ${adjustedBalance} days`);
        } else {
          // Create new balance document
          balanceData.createdAt = new Date();
          await LeaveBalance.create(balanceData);
          userBalancesCreated++;
          console.log(`   ✨ ${leaveType}: Created with ${adjustedBalance} days`);
        }
      }

      // Update counters
      if (userBalancesCreated > 0 || userBalancesUpdated > 0) {
        totalUsersProcessed++;
        totalLeaveBalancesCreated += userBalancesCreated;
        totalLeaveBalancesUpdated += userBalancesUpdated;
        totalLeaveBalancesSkipped += userBalancesSkipped;

        const actionSummary = [];
        if (userBalancesCreated > 0) actionSummary.push(`${userBalancesCreated} created`);
        if (userBalancesUpdated > 0) actionSummary.push(`${userBalancesUpdated} updated`);
        if (userBalancesSkipped > 0) actionSummary.push(`${userBalancesSkipped} skipped`);

        console.log(`   ✅ ${actionSummary.join(', ')}\n`);
      } else {
        console.log(`   ℹ️  All balances already set or no applicable policies\n`);
      }
    }

    // Generate summary report
    console.log('='.repeat(60));
    console.log('📈 ASSIGNMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Active users processed: ${activeUsers.length}`);
    console.log(`Users with balance updates: ${totalUsersProcessed}`);
    console.log(`New LeaveBalance documents created: ${totalLeaveBalancesCreated}`);
    console.log(`Existing zero balances updated: ${totalLeaveBalancesUpdated}`);
    console.log(`Balances skipped (already >0): ${totalLeaveBalancesSkipped}`);
    console.log(`Total operations: ${totalLeaveBalancesCreated + totalLeaveBalancesUpdated}`);

    // Show employment type distribution
    console.log('\n👥 Employment Type Distribution:');
    const employmentTypes = await User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    employmentTypes.forEach(et => {
      console.log(`  ${et._id}: ${et.count} employees`);
    });

    // Show final leave type statistics
    console.log('\n📊 Final Leave Balance Statistics:');
    const leaveStats = await LeaveBalance.aggregate([
      { $match: { fiscalYear: currentYear } },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalBalance: { $sum: '$balance' },
          avgBalance: { $avg: '$balance' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    leaveStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count} records, Avg: ${stat.avgBalance.toFixed(1)} days`);
    });

    if (totalLeaveBalancesCreated + totalLeaveBalancesUpdated === 0) {
      console.log('\n✅ All active users already have proper leave balances!');
    } else {
      console.log(`\n✅ Successfully assigned default leave balances to ${totalUsersProcessed} users!`);
    }

  } catch (error) {
    console.error('❌ Error assigning leave balances:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Add safety confirmation
const readline = require('readline');

async function confirmAndRun() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('⚠️  WARNING: This script will assign default leave balances to active users');
  console.log('   Source: INITIAL_BALANCE_ID =', process.env.INITIAL_BALANCE_ID || 'Not set');
  console.log('   Target: LeaveBalance collection (separate documents)');
  console.log('   Scope: Only active users with zero/missing balances');
  console.log('   Rules: Will adjust for employment type (full-time/part-time/contract)');
  console.log('\n' + '='.repeat(60));

  rl.question('Continue? (yes/no): ', async (answer) => {
    if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
      console.log('\n🚀 Starting assignment process...\n');
      await assignDefaultLeaveBalances();
    } else {
      console.log('Operation cancelled.');
      process.exit(0);
    }
    rl.close();
  });
}

// Add error handlers
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Promise Rejection:', error);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Run with confirmation
if (require.main === module) {
  confirmAndRun();
}

module.exports = { assignDefaultLeaveBalances };