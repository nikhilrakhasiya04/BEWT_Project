const Joi = require("joi");

const validateRequest = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false, stripUnknown: true });
        if (error) {
            const errorMessages = error.details.map((detail) => detail.message.replace(/['"]/g, ""));
            return res.status(400).json({
                success: false,
                message: "Validation Error",
                errors: errorMessages
            });
        }
        next();
    };
};

// 1. Auth Validations
const registerSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        "any.required": "Name is required"
    }),
    email: Joi.string().email().max(255).required().messages({
        "string.email": "Please provide a valid email address",
        "any.required": "Email is required"
    }),
    password: Joi.string().min(6).max(100).required().messages({
        "string.min": "Password must be at least 6 characters long",
        "any.required": "Password is required"
    }),
    role: Joi.string().valid("Administrator", "Receptionist", "Barber").required().messages({
        "any.only": "Role must be Administrator, Receptionist, or Barber",
        "any.required": "Role is required"
    }),
    phone: Joi.string().max(20).optional().allow("", null)
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.email": "Please provide a valid email",
        "any.required": "Email is required"
    }),
    password: Joi.string().required().messages({
        "any.required": "Password is required"
    })
});

const changePasswordSchema = Joi.object({
    current_password: Joi.string().required().messages({
        "any.required": "Current password is required"
    }),
    new_password: Joi.string().min(6).max(100).required().messages({
        "string.min": "New password must be at least 6 characters long",
        "any.required": "New password is required"
    })
});

// 2. User Validations
const createUserSchema = registerSchema;

const updateUserSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    email: Joi.string().email().max(255).optional(),
    password: Joi.string().min(6).max(100).optional(),
    role: Joi.string().valid("Administrator", "Receptionist", "Barber").optional(),
    status: Joi.string().valid("Active", "Inactive").optional(),
    phone: Joi.string().max(20).optional().allow("", null)
});

// 3. Customer Validations
const createCustomerSchema = Joi.object({
    name: Joi.string().min(2).max(255).required().messages({
        "any.required": "Customer name is required"
    }),
    phone: Joi.string().min(5).max(20).required().messages({
        "any.required": "Phone number is required"
    }),
    email: Joi.string().email().max(255).optional().allow("", null),
    gender: Joi.string().valid("Male", "Female", "Other").optional().allow("", null)
});

const updateCustomerSchema = Joi.object({
    name: Joi.string().min(2).max(255).optional(),
    phone: Joi.string().min(5).max(20).optional(),
    email: Joi.string().email().max(255).optional().allow("", null),
    gender: Joi.string().valid("Male", "Female", "Other").optional().allow("", null)
});

// 4. Service Validations
const createServiceSchema = Joi.object({
    service_name: Joi.string().min(2).max(255).required().messages({
        "any.required": "Service name is required"
    }),
    duration: Joi.number().integer().min(1).max(480).required().messages({
        "number.min": "Duration must be at least 1 minute",
        "any.required": "Duration (in minutes) is required"
    }),
    price: Joi.number().min(0).precision(2).required().messages({
        "number.min": "Price cannot be negative",
        "any.required": "Price is required"
    }),
    description: Joi.string().max(1000).optional().allow("", null)
});

const updateServiceSchema = Joi.object({
    service_name: Joi.string().min(2).max(255).optional(),
    duration: Joi.number().integer().min(1).max(480).optional(),
    price: Joi.number().min(0).precision(2).optional(),
    description: Joi.string().max(1000).optional().allow("", null)
});

// 5. Barber Validations
const createBarberSchema = Joi.object({
    user_id: Joi.string().hex().length(24).required().messages({
        "any.required": "User ID reference is required"
    }),
    specialization: Joi.string().max(255).optional().allow("", null),
    commission_percentage: Joi.number().min(0).max(100).precision(2).required().messages({
        "any.required": "Commission percentage (0-100) is required"
    }),
    joining_date: Joi.date().iso().optional().allow(null),
    shift_start: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().default("09:00"),
    shift_end: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional().default("19:00"),
    status: Joi.string().valid("Active", "Inactive").optional()
});

const updateBarberSchema = Joi.object({
    specialization: Joi.string().max(255).optional().allow("", null),
    commission_percentage: Joi.number().min(0).max(100).precision(2).optional(),
    joining_date: Joi.date().iso().optional(),
    shift_start: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    shift_end: Joi.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/).optional(),
    status: Joi.string().valid("Active", "Inactive").optional()
});

// 6. Appointment Validations
const createAppointmentSchema = Joi.object({
    customer_id: Joi.string().hex().length(24).required().messages({
        "any.required": "Customer ID is required"
    }),
    barber_id: Joi.string().hex().length(24).required().messages({
        "any.required": "Barber ID is required"
    }),
    service_id: Joi.string().hex().length(24).required().messages({
        "any.required": "Service ID is required"
    }),
    appointment_date: Joi.date().iso().required().messages({
        "any.required": "Appointment date and time is required"
    }),
    status: Joi.string().valid("Pending", "Confirmed", "In Progress", "Completed", "Cancelled").optional().default("Pending"),
    remarks: Joi.string().max(1000).optional().allow("", null)
});

const updateAppointmentSchema = Joi.object({
    customer_id: Joi.string().hex().length(24).optional(),
    barber_id: Joi.string().hex().length(24).optional(),
    service_id: Joi.string().hex().length(24).optional(),
    appointment_date: Joi.date().iso().optional(),
    status: Joi.string().valid("Pending", "Confirmed", "In Progress", "Completed", "Cancelled").optional(),
    remarks: Joi.string().max(1000).optional().allow("", null)
});

// 7. Slot Exception Validations
const createSlotExceptionSchema = Joi.object({
    title: Joi.string().min(2).max(255).required().messages({
        "any.required": "Title is required"
    }),
    type: Joi.string().valid("Holiday", "Blocked_Window", "Barber_Leave").default("Holiday"),
    barber_id: Joi.string().hex().length(24).optional().allow(null),
    start_time: Joi.date().iso().required().messages({
        "any.required": "Start time is required"
    }),
    end_time: Joi.date().iso().greater(Joi.ref("start_time")).required().messages({
        "date.greater": "End time must be after start time",
        "any.required": "End time is required"
    }),
    remarks: Joi.string().max(500).optional().allow("", null)
});

// 8. Attendance Validations
const checkInAttendanceSchema = Joi.object({
    barber_id: Joi.string().hex().length(24).optional(), // optional if barber logged in
    check_in: Joi.date().iso().optional()
});

const checkOutAttendanceSchema = Joi.object({
    barber_id: Joi.string().hex().length(24).optional(), // optional if barber logged in
    check_out: Joi.date().iso().optional()
});

// 9. Wage Calculation / Finalize Validations
const calculateWageSchema = Joi.object({
    barber_id: Joi.string().hex().length(24).required().messages({
        "any.required": "Barber ID is required"
    }),
    month: Joi.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/).required().messages({
        "string.pattern.base": "Month must be in YYYY-MM format",
        "any.required": "Month is required"
    }),
    salary: Joi.number().min(0).precision(2).optional().default(0),
    payment_status: Joi.string().valid("Pending", "Paid").optional()
});

module.exports = {
    validateRegister: validateRequest(registerSchema),
    validateLogin: validateRequest(loginSchema),
    validateChangePassword: validateRequest(changePasswordSchema),
    validateUser: validateRequest(createUserSchema),
    validateUpdateUser: validateRequest(updateUserSchema),
    validateCustomer: validateRequest(createCustomerSchema),
    validateUpdateCustomer: validateRequest(updateCustomerSchema),
    validateService: validateRequest(createServiceSchema),
    validateUpdateService: validateRequest(updateServiceSchema),
    validateBarber: validateRequest(createBarberSchema),
    validateUpdateBarber: validateRequest(updateBarberSchema),
    validateAppointment: validateRequest(createAppointmentSchema),
    validateUpdateAppointment: validateRequest(updateAppointmentSchema),
    validateSlotException: validateRequest(createSlotExceptionSchema),
    validateCheckIn: validateRequest(checkInAttendanceSchema),
    validateCheckOut: validateRequest(checkOutAttendanceSchema),
    validateWageCalculation: validateRequest(calculateWageSchema)
};