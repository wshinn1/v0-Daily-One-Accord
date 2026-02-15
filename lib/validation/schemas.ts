import { z } from "zod"

// Common validation patterns
export const emailSchema = z.string().email("Invalid email address").toLowerCase().trim()
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number")
  .optional()
export const uuidSchema = z.string().uuid("Invalid UUID")
export const urlSchema = z.string().url("Invalid URL").optional()

// User schemas
export const userRoleSchema = z.enum([
  "lead_admin",
  "admin_staff",
  "pastoral_team",
  "volunteer_team",
  "member",
  "media_team",
])

export const createUserSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  role: userRoleSchema,
  church_tenant_id: uuidSchema,
  phone: phoneSchema,
})

export const updateUserSchema = createUserSchema.partial().extend({
  id: uuidSchema,
})

// Event schemas
export const eventTypeSchema = z.enum(["service", "meeting", "class", "custom"])

export const createEventSchema = z
  .object({
    title: z.string().min(1, "Title is required").max(200),
    description: z.string().max(1000).optional(),
    start_time: z.string().datetime("Invalid start time"),
    end_time: z.string().datetime("Invalid end time"),
    location: z.string().max(200).optional(),
    church_tenant_id: uuidSchema,
    event_type: eventTypeSchema.default("custom"),
    is_public: z.boolean().default(true),
    allow_registration: z.boolean().default(false),
    max_attendees: z.number().int().positive().optional(),
    leader_id: uuidSchema.optional(),
  })
  .refine((data) => new Date(data.end_time) > new Date(data.start_time), {
    message: "End time must be after start time",
    path: ["end_time"],
  })

// Attendance schemas
export const recordAttendanceSchema = z.object({
  user_id: uuidSchema,
  event_id: uuidSchema,
  church_tenant_id: uuidSchema,
  notes: z.string().max(500).optional(),
})

// Class schemas
export const createClassSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  teacher_id: uuidSchema.optional(),
  church_tenant_id: uuidSchema,
  start_date: z.string().date("Invalid start date"),
  end_date: z.string().date("Invalid end date").optional(),
  schedule_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  schedule_day: z.enum(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]).optional(),
  location: z.string().max(200).optional(),
  max_capacity: z.number().int().positive().optional(),
  category: z.string().max(100).optional(),
  age_group: z.string().max(100).optional(),
})

// Newsletter schemas
export const createNewsletterSchema = z.object({
  subject: z.string().min(1, "Subject is required").max(200),
  content: z.string().min(1, "Content is required"),
  church_tenant_id: uuidSchema,
  template_id: uuidSchema.optional(),
})

// SMS schemas
export const sendSMSSchema = z.object({
  message: z.string().min(1, "Message is required").max(1600, "Message too long (max 1600 characters)"),
  recipient_type: z.enum(["all", "members", "visitors", "team", "custom"]),
  church_tenant_id: uuidSchema,
  recipient_filter: z.record(z.any()).optional(),
})

// Business plan schemas
export const businessPlanLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
})

export const inviteBusinessPlanUserSchema = z.object({
  email: emailSchema,
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
})

// Visitor schemas
export const createVisitorSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: emailSchema.optional(),
  phone: phoneSchema,
  church_tenant_id: uuidSchema,
  notes: z.string().max(1000).optional(),
  status: z.enum(["new", "contacted", "following_up", "member"]).default("new"),
})

// Team schemas
export const createTeamSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  church_tenant_id: uuidSchema,
  leader_id: uuidSchema.optional(),
})

// Rundown schemas
export const createRundownSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  event_date: z.string().date("Invalid date"),
  event_type: z.string().max(100).optional(),
  church_tenant_id: uuidSchema,
})

export const createRundownModuleSchema = z.object({
  rundown_id: uuidSchema,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(500).optional(),
  duration_minutes: z.number().int().positive().max(480, "Duration too long"),
  order_index: z.number().int().nonnegative(),
  start_time: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)")
    .optional(),
  assigned_to: uuidSchema.optional(),
})

// Helper function to validate and parse data
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return { success: false, errors: result.error }
}
