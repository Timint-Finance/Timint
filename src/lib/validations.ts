import { z } from 'zod'

export const registrationSchema = z.object({
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long'),

    age: z.number()
        .min(13, 'You must be at least 13 years old')
        .max(17, 'This service is for users under 18'),

    address: z.string()
        .min(10, 'Please enter your full address')
        .max(500, 'Address too long'),

    phone: z.string()
        .regex(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/, 'Invalid phone number'),

    parent_name: z.string()
        .min(2, 'Parent name is required')
        .max(100, 'Name too long'),

    parent_email: z.string()
        .email('Please enter a valid email address'),

    company_name: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name too long'),

    description: z.string()
        .max(1000, 'Description too long')
        .optional(),

    email: z.string()
        .email('Please enter a valid email'),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain an uppercase letter')
        .regex(/[a-z]/, 'Password must contain a lowercase letter')
        .regex(/[0-9]/, 'Password must contain a number'),
})

export type RegistrationData = z.infer<typeof registrationSchema>

export const loginSchema = z.object({
    email: z.string().email('Invalid email'),
    password: z.string().min(1, 'Password required'),
})

export type LoginData = z.infer<typeof loginSchema>
