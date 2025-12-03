// lib/validations/authValidation.js
import { LEAVETYPE } from '@/constant/constant';
import Joi from 'joi';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

// Converts and validates phone number format
export const formatToLocal = (value, helpers) => {
  const phoneNumber = parsePhoneNumberFromString(value, 'NG');

  if (!phoneNumber || !phoneNumber.isValid()) {
    return helpers.error('any.invalid');
  }

  let nationalNumber = phoneNumber.nationalNumber;

  if (nationalNumber.length === 10) {
    nationalNumber = '0' + nationalNumber;
  }

  return nationalNumber;
};

// Custom objectId validation (for MongoDB)
export const objectIdValidation = (value, helpers) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;

  if (!objectIdRegex.test(value)) {
    return helpers.error('any.invalid');
  }

  return value;
};

// Reusable validation schemas
export const commonSchemas = {
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .pattern(/^[a-zA-Z\s\-']+$/)
    .messages({
      'string.pattern.base': 'Name can only contain letters, spaces, hyphens, and apostrophes',
      'string.min': 'Name must be at least 2 characters long',
      'string.max': 'Name must not exceed 100 characters'
    }),

  email: Joi.string()
    .email()
    .trim()
    .max(255)
    .messages({
      'string.email': 'Please provide a valid email address',
    }),

  position: Joi.string()
    .trim()
    .max(255)
    .messages({
      'string.empty': 'Please provide a valid position',
    }),

  joinDate: Joi.date()
    .max('now')
    .messages({
      'date.base': 'Please provide a valid join date',
      'date.max': 'Join date cannot be in the future'
    }),

  levels: Joi.string()
    .trim()
    .max(255)
    .messages({
      'string.empty': 'Please provide a valid employee level',
    }),

  dateOfBirth: Joi.date()
    .max('now')
    .messages({
      'date.base': 'Please provide a valid date of birth',
      'date.max': 'Date of birth cannot be in the future'
    }),

  phone: Joi.string()
    .trim()
    .custom(formatToLocal, 'Phone number validation')
    .messages({
      'any.invalid': 'Please provide a valid phone number with country code (e.g., +2348123456789)'
    }),

  password: Joi.string()
    .min(8)
    .messages({
      'string.min': 'Password must be at least 8 characters long'
    }),

  objectId: Joi.string()
    .custom(objectIdValidation, 'ObjectId validation')
    .messages({
      'any.invalid': 'Invalid ID format'
    })
};

// Validation schemas for different operations
export const authValidation = {
  // Authentication
  login: Joi.object({
    email: commonSchemas.email.required(),
    password: Joi.string().required().messages({
      'string.empty': 'Password is required'
    })
  }),

  forgotPassword: Joi.object({
    email: commonSchemas.email.required()
  }),

  resetPassword: Joi.object({
    token: Joi.string().trim().required().messages({
      'string.empty': 'Reset token is required'
    }),
    newPassword: commonSchemas.password.required()
  }),

  registerUser: Joi.object({
    fullName: commonSchemas.name.required(),
    email: commonSchemas.email.required(),
    personalInfo: {
      dateOfBirth: commonSchemas.dateOfBirth.optional(),
      phoneNumber: commonSchemas.phone.optional(),
      emergencyContact: {
        phone: commonSchemas.phone.optional(),
        name: commonSchemas.name.optional(),
        relationship: Joi.string()
          .trim()
          .optional()
      }
    },
    password: commonSchemas.password.optional(),
    role: Joi.string()
      .valid('employee', 'manager', 'hr', 'admin', 'department-head')
      .default('employee')
      .messages({
        'any.only': 'Role must be one of: employee, manager, hr, admin'
      }),
    department: Joi.string()
      .required()
      .messages({
        'string.empty': 'Department is required'
      }),
    managerId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Manager is required'
      }),
    position: commonSchemas.position.required(),
    resetPasswordToken: Joi.string().optional(),
    resetPasswordExpires: Joi.date().optional(),
    employmentType: Joi.string()
      .valid('full-time', 'part-time', 'contract')
      .default('full-time')
      .messages({
        'any.only': 'Employment type must be one of: full-time, part-time, contract'
      }),
    joinDate: commonSchemas.joinDate.required(),
    branch: Joi.string()
      .required()
      .messages({
        'string.empty': 'Branch is required'
      }),
    levels: commonSchemas.levels.required(),
  }),

  registerDepartment: Joi.object({
    name: commonSchemas.name.required(),
    contactEmail: commonSchemas.email,
    managerId: commonSchemas.objectId.optional(),
    headCount: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'Head count must be a number',
        'number.min': 'Head count cannot be negative'
      }),
    leaveSettings: Joi.object({
      maxConcurrentLeaves: Joi.number()
        .integer()
        .min(1)
        .optional(),
      requiredCoverage: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(70)
    }).default({})
  }),

  registerBranch: Joi.object({
    name: commonSchemas.name.required(),
    contactEmail: commonSchemas.email,
    managerId: commonSchemas.objectId.optional(),
    headCount: Joi.number()
      .integer()
      .min(0)
      .default(0)
      .messages({
        'number.base': 'Head count must be a number',
        'number.min': 'Head count cannot be negative'
      }),
    leaveSettings: Joi.object({
      maxConcurrentLeaves: Joi.number()
        .integer()
        .min(1)
        .optional(),
      requiredCoverage: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(70)
    }).default({})
  }),

  registerLeavePolicy: Joi.object({
    policyName: Joi.string().trim().required().messages({
      'string.empty': 'Policy name is required'
    }),
    leaveType: Joi.string().valid(...LEAVETYPE).required(),
    eligibility: Joi.object({
      employmentTypes: Joi.array().items(
        Joi.string().valid('full-time', 'part-time', 'contract')
      ).default(['full-time']),
      minServiceDays: Joi.number().integer().min(0).default(0)
    }).default({}),
    accrual: Joi.object({
      type: Joi.string().valid('monthly', 'annual', 'none').default('monthly'),
      rate: Joi.number().min(0).default(0),
      maxBalance: Joi.number().min(0).default(0)
    }).default({}),
    carryOver: Joi.object({
      enabled: Joi.boolean().default(false),
      maxDays: Joi.number().min(0).default(0),
      expiryDays: Joi.number().min(0).default(0)
    }).default({}),
    approvalWorkflow: Joi.object({
      requireReliefOfficer: Joi.boolean().default(true),
      approvalLevels: Joi.array().items(
        Joi.string().valid('manager', 'hr', 'department-head')
      ).default(['manager'])
    }).default({}),
    restrictions: Joi.object({
      blackoutDates: Joi.array().items(Joi.date()).default([]),
      minNoticeDays: Joi.number().min(0).default(0),
      maxConsecutiveDays: Joi.number().min(0).default(0),
      allowHalfDays: Joi.boolean().default(false)
    }).default({}),
    isActive: Joi.boolean().optional(),
  }),

  registerLeaveInitialBalance: Joi.object({
    name: Joi.string().trim().messages({
      'string.empty': 'Template name is required'
    }),
    description: Joi.string().trim().optional(),
    ...LEAVETYPE.reduce((acc, type) => {
      acc[type] = Joi.number()
        .integer()
        .min(0)
        .default(0)
        .messages({
          'number.base': `${type} leave balance must be a number`,
          'number.min': `${type} leave balance cannot be negative`
        });
      return acc;
    }, {})
  }),

  leaveRequest: Joi.object({
    leaveType: Joi.string().valid(...LEAVETYPE).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    totalDays: Joi.number().required(),
    reason: Joi.string().required(),
    reliefOfficerId: Joi.string().required(),
    additionalFile: Joi.string().optional(),
    handoverNotes: Joi.string().optional(),
    urgentContact: Joi.string().optional(),

  }),

  approvalHistory: Joi.object({
    notes: Joi.string().allow('').optional()
  })
};

// Params validation
export const paramsValidation = {
  userId: Joi.object({
    userId: commonSchemas.objectId.required()
  })
};

// Query validation
export const queryValidation = {
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    search: Joi.string().trim().max(100).optional(),
    sort: Joi.string().trim().optional(),
    status: Joi.string().valid('active', 'inactive').optional()
  })
};

// Next.js 14+ Validation Helper
export const validateRequest = async (schema, data) => {

  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
    allowUnknown: false
  });

  if (error) {
    const errorDetails = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type
    }));

    throw {
      status: 400,
      message: 'Validation failed',
      errors: errorDetails
    };
  }

  return value;
};

// Validate API request body
export const validateBody = (schema) => {
  return async (request) => {
    const body = await request.json();
    return await validateRequest(schema, body);
  };
};

// Validate query parameters
export const validateSearchParams = (schema) => {
  return (searchParams) => {
    return validateRequest(schema, Object.fromEntries(searchParams));
  };
};

// Validate route parameters
export const validateParams = (schema) => {
  return (params) => {
    return validateRequest(schema, params);
  };
};