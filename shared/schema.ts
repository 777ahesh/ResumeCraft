import { z } from "zod";

// User types for MongoDB
export interface User {
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  previewImage: string | null;
  templateData: any;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Resume {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  resumeData: any;
  pdfData: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSession {
  id: string;
  userId: string;
  loginDate: Date;
}

// Input types for creating records
export interface InsertUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface InsertResume {
  userId: string;
  templateId: string;
  title: string;
  resumeData: any;
}

export interface InsertTemplate {
  name: string;
  description: string;
  category: string;
  templateData: any;
}

export interface UpdateResume {
  title?: string;
  templateId?: string;
  resumeData?: any;
  pdfData?: string;
}

export interface LoginUser {
  email: string;
  password: string;
}

// Zod validation schemas
export const insertUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
}).extend({
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertResumeSchema = z.object({
  userId: z.string(),
  templateId: z.string(),
  title: z.string(),
  resumeData: z.any(),
});

export const updateResumeSchema = z.object({
  title: z.string().optional(),
  templateId: z.string().optional(),
  resumeData: z.any().optional(),
  pdfData: z.string().optional(),
});

export const insertTemplateSchema = z.object({
  name: z.string(),
  description: z.string(),
  category: z.string(),
  templateData: z.any(),
});
