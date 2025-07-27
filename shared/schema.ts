import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const resumeTemplates = pgTable("resume_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  previewImage: text("preview_image"),
  templateData: jsonb("template_data").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const resumes = pgTable("resumes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  templateId: varchar("template_id").references(() => resumeTemplates.id).notNull(),
  title: text("title").notNull(),
  resumeData: jsonb("resume_data").notNull(),
  pdfData: text("pdf_data"), // base64 encoded PDF
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  loginDate: timestamp("login_date").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  firstName: true,
  lastName: true,
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

export const insertResumeSchema = createInsertSchema(resumes).pick({
  userId: true,
  templateId: true,
  title: true,
  resumeData: true,
});

export const insertTemplateSchema = createInsertSchema(resumeTemplates).pick({
  name: true,
  description: true,
  category: true,
  templateData: true,
});

export const updateResumeSchema = createInsertSchema(resumes).pick({
  title: true,
  resumeData: true,
  pdfData: true,
}).partial();

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type Resume = typeof resumes.$inferSelect;
export type InsertResume = z.infer<typeof insertResumeSchema>;
export type UpdateResume = z.infer<typeof updateResumeSchema>;
export type ResumeTemplate = typeof resumeTemplates.$inferSelect;
export type InsertTemplate = z.infer<typeof insertTemplateSchema>;
export type UserSession = typeof userSessions.$inferSelect;

// Resume data types
export type PersonalInfo = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
};

export type WorkExperience = {
  id: string;
  title: string;
  company: string;
  startYear: string;
  endYear: string;
  description: string;
};

export type Education = {
  id: string;
  degree: string;
  institution: string;
  graduationYear: string;
};

export type Skill = {
  id: string;
  name: string;
  category: string;
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
};
