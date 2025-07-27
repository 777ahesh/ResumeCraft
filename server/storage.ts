import { type User, type InsertUser, type Resume, type InsertResume, type UpdateResume, type ResumeTemplate, type InsertTemplate, type UserSession, type LoginUser } from "@shared/schema";
import { randomUUID } from "crypto";
import bcrypt from "bcrypt";

export interface IStorage {
  // User management
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  validateUser(credentials: LoginUser): Promise<User | null>;
  
  // Resume management
  getUserResumes(userId: string): Promise<Resume[]>;
  getResume(id: string): Promise<Resume | undefined>;
  createResume(resume: InsertResume): Promise<Resume>;
  updateResume(id: string, updates: UpdateResume): Promise<Resume | undefined>;
  deleteResume(id: string): Promise<boolean>;
  
  // Template management
  getTemplates(): Promise<ResumeTemplate[]>;
  getTemplate(id: string): Promise<ResumeTemplate | undefined>;
  createTemplate(template: InsertTemplate): Promise<ResumeTemplate>;
  updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<ResumeTemplate | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  
  // Analytics
  getTotalUsers(): Promise<number>;
  getDailySignups(): Promise<number>;
  getDailyLogins(): Promise<number>;
  getTotalResumes(): Promise<number>;
  recordLogin(userId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private resumes: Map<string, Resume>;
  private templates: Map<string, ResumeTemplate>;
  private sessions: Map<string, UserSession>;

  constructor() {
    this.users = new Map();
    this.resumes = new Map();
    this.templates = new Map();
    this.sessions = new Map();
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates() {
    const defaultTemplates = [
      {
        id: "modern-professional",
        name: "Modern Professional",
        description: "Clean and modern design perfect for any industry",
        category: "professional",
        previewImage: null,
        templateData: {
          layout: "modern",
          colors: { primary: "#3B82F6", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "creative-edge",
        name: "Creative Edge",
        description: "Stand out with this creative and colorful design",
        category: "creative",
        previewImage: null,
        templateData: {
          layout: "creative",
          colors: { primary: "#10B981", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "executive-classic",
        name: "Executive Classic",
        description: "Traditional and professional for senior roles",
        category: "executive",
        previewImage: null,
        templateData: {
          layout: "classic",
          colors: { primary: "#374151", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "minimalist",
        name: "Minimalist",
        description: "Clean and simple design that focuses on content",
        category: "minimal",
        previewImage: null,
        templateData: {
          layout: "minimal",
          colors: { primary: "#8B5CF6", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "tech-developer",
        name: "Tech Developer",
        description: "Dark themed design perfect for developers and tech roles",
        category: "tech",
        previewImage: null,
        templateData: {
          layout: "tech",
          colors: { primary: "#6366F1", secondary: "#E5E7EB" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: "academic-scholar",
        name: "Academic Scholar",
        description: "Traditional academic format for research and education",
        category: "academic",
        previewImage: null,
        templateData: {
          layout: "academic",
          colors: { primary: "#F59E0B", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template as ResumeTemplate);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const id = randomUUID();
    const user: User = {
      id,
      email: insertUser.email,
      password: hashedPassword,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      isAdmin: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async validateUser(credentials: LoginUser): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(credentials.password, user.password);
    return isValid ? user : null;
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values()).filter(resume => resume.userId === userId);
  }

  async getResume(id: string): Promise<Resume | undefined> {
    return this.resumes.get(id);
  }

  async createResume(insertResume: InsertResume): Promise<Resume> {
    const id = randomUUID();
    const resume: Resume = {
      id,
      ...insertResume,
      pdfData: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.resumes.set(id, resume);
    return resume;
  }

  async updateResume(id: string, updates: UpdateResume): Promise<Resume | undefined> {
    const resume = this.resumes.get(id);
    if (!resume) return undefined;
    
    const updatedResume = {
      ...resume,
      ...updates,
      updatedAt: new Date()
    };
    this.resumes.set(id, updatedResume);
    return updatedResume;
  }

  async deleteResume(id: string): Promise<boolean> {
    return this.resumes.delete(id);
  }

  async getTemplates(): Promise<ResumeTemplate[]> {
    return Array.from(this.templates.values()).filter(template => template.isActive);
  }

  async getTemplate(id: string): Promise<ResumeTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<ResumeTemplate> {
    const id = randomUUID();
    const template: ResumeTemplate = {
      id,
      ...insertTemplate,
      previewImage: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<ResumeTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    
    const updatedTemplate = {
      ...template,
      ...updates,
      updatedAt: new Date()
    };
    this.templates.set(id, updatedTemplate);
    return updatedTemplate;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getTotalUsers(): Promise<number> {
    return this.users.size;
  }

  async getDailySignups(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.users.values()).filter(user => 
      user.createdAt && user.createdAt >= today
    ).length;
  }

  async getDailyLogins(): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.sessions.values()).filter(session => 
      session.loginDate && session.loginDate >= today
    ).length;
  }

  async getTotalResumes(): Promise<number> {
    return this.resumes.size;
  }

  async recordLogin(userId: string): Promise<void> {
    const sessionId = randomUUID();
    const session: UserSession = {
      id: sessionId,
      userId,
      loginDate: new Date()
    };
    this.sessions.set(sessionId, session);
  }
}

export const storage = new MemStorage();
