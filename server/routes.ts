import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginSchema, insertResumeSchema, updateResumeSchema, insertTemplateSchema, type InsertResume, type InsertTemplate } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Extend Express Request type to include user
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

// Middleware to verify JWT token
const authenticateToken = (req: AuthenticatedRequest, res: Response, next: any) => {
  const authHeader = req.headers['authorization'];
  console.log('Auth header received:', authHeader);
  const token = authHeader && authHeader.split(' ')[1];
  console.log('Extracted token:', token ? 'present' : 'missing');

  if (!token) {
    console.log('No token provided');
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      console.error('JWT verification error:', err);
      return res.status(403).json({ message: 'Invalid token' });
    }
    console.log('JWT verified successfully for user:', user.id);
    req.user = user;
    next();
  });
};

// Middleware to verify admin role
const requireAdmin = async (req: AuthenticatedRequest, res: Response, next: any) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const user = await storage.getUser(req.user.id);
    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.validateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      await storage.recordLogin(user.id);
      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
      
      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Resume routes
  app.get("/api/resumes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const resumes = await storage.getUserResumes(req.user.id);
      res.json(resumes);
    } catch (error) {
      console.error('Get resumes error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/resumes/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(resume);
    } catch (error) {
      console.error('Get resume error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.post("/api/resumes", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const bodyWithDefaults = {
        ...req.body,
        userId: req.user.id,
        resumeData: req.body.resumeData || {
          personalInfo: { name: "", title: "", email: "", phone: "", location: "", summary: "" },
          experiences: [],
          education: [],
          skills: []
        }
      };
      
      const resumeData = insertResumeSchema.parse(bodyWithDefaults) as InsertResume;
      const resume = await storage.createResume(resumeData);
      res.status(201).json(resume);
    } catch (error) {
      console.error('Create resume error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/resumes/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const updates = updateResumeSchema.parse(req.body);
      const updatedResume = await storage.updateResume(req.params.id, updates);
      
      res.json(updatedResume);
    } catch (error) {
      console.error('Update resume error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/resumes/:id", authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const resume = await storage.getResume(req.params.id);
      if (!resume) {
        return res.status(404).json({ message: "Resume not found" });
      }
      
      if (resume.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteResume(req.params.id);
      res.json({ message: "Resume deleted successfully" });
    } catch (error) {
      console.error('Delete resume error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Template routes
  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/templates/:id", async (req, res) => {
    try {
      const template = await storage.getTemplate(req.params.id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin template management
  app.post("/api/admin/templates", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const bodyWithDefaults = {
        ...req.body,
        templateData: req.body.templateData || {
          layout: "modern",
          colors: { primary: "#3B82F6", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        }
      };
      
      const templateData = insertTemplateSchema.parse(bodyWithDefaults) as InsertTemplate;
      const template = await storage.createTemplate(templateData);
      res.status(201).json(template);
    } catch (error) {
      console.error('Create template error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.patch("/api/admin/templates/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const updates = req.body;
      const template = await storage.updateTemplate(req.params.id, updates);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json(template);
    } catch (error) {
      console.error('Update template error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/admin/templates/:id", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const success = await storage.deleteTemplate(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      res.json({ message: "Template deleted successfully" });
    } catch (error) {
      console.error('Delete template error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin analytics routes
  app.get("/api/admin/analytics", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const [totalUsers, dailySignups, dailyLogins, totalResumes] = await Promise.all([
        storage.getTotalUsers(),
        storage.getDailySignups(),
        storage.getDailyLogins(),
        storage.getTotalResumes()
      ]);

      res.json({
        totalUsers,
        dailySignups,
        dailyLogins,
        totalResumes
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      // Remove password from response
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Get all users error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin resume management routes
  app.get("/api/admin/resumes", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const resumes = await storage.getAllResumes();
      res.json(resumes);
    } catch (error) {
      console.error('Get all resumes error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  // Admin data by date range
  app.get("/api/admin/users/range", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const users = await storage.getUsersByDateRange(new Date(startDate as string), new Date(endDate as string));
      const sanitizedUsers = users.map(user => ({
        ...user,
        password: undefined
      }));
      res.json(sanitizedUsers);
    } catch (error) {
      console.error('Get users by date range error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/admin/resumes/range", authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const resumes = await storage.getResumesByDateRange(new Date(startDate as string), new Date(endDate as string));
      res.json(resumes);
    } catch (error) {
      console.error('Get resumes by date range error:', error);
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
