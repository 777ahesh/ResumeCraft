import { type User as IUser, type InsertUser, type Resume as IResume, type InsertResume, type UpdateResume, type ResumeTemplate as IResumeTemplate, type InsertTemplate, type UserSession as IUserSession, type LoginUser } from "@shared/schema";
import { User, Resume, ResumeTemplate, UserSession, connectToMongoDB } from "./mongodb-models";
import bcrypt from "bcrypt";
import { IStorage } from "./storage";

export class MongoStorage implements IStorage {
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  constructor(private connectionString: string) {}

  async connect(): Promise<void> {
    if (this.isConnected) return;
    
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = (async () => {
      try {
        await connectToMongoDB(this.connectionString);
        this.isConnected = true;
        await this.initializeDefaultTemplates();
      } catch (error) {
        this.connectionPromise = null; // Reset promise on failure
        throw error;
      }
    })();

    return this.connectionPromise;
  }

  private async initializeDefaultTemplates(): Promise<void> {
    const existingTemplates = await ResumeTemplate.countDocuments();
    if (existingTemplates > 0) return;

    const defaultTemplates = [
      {
        name: "Modern Professional",
        description: "Clean and modern design perfect for any industry",
        category: "professional",
        templateData: {
          layout: "modern",
          colors: { primary: "#3B82F6", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      },
      {
        name: "Creative Edge",
        description: "Stand out with this creative and colorful design",
        category: "creative",
        templateData: {
          layout: "creative",
          colors: { primary: "#10B981", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      },
      {
        name: "Executive Classic",
        description: "Traditional and professional for senior roles",
        category: "executive",
        templateData: {
          layout: "classic",
          colors: { primary: "#374151", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      },
      {
        name: "Minimalist",
        description: "Clean and simple design that focuses on content",
        category: "minimal",
        templateData: {
          layout: "minimal",
          colors: { primary: "#8B5CF6", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      },
      {
        name: "Tech Developer",
        description: "Dark themed design perfect for developers and tech roles",
        category: "tech",
        templateData: {
          layout: "tech",
          colors: { primary: "#6366F1", secondary: "#E5E7EB" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      },
      {
        name: "Academic Scholar",
        description: "Traditional academic format for research and education",
        category: "academic",
        templateData: {
          layout: "academic",
          colors: { primary: "#F59E0B", secondary: "#6B7280" },
          fonts: { heading: "Inter", body: "Inter" }
        },
        isActive: true,
      }
    ];

    await ResumeTemplate.insertMany(defaultTemplates);
    console.log('Default templates initialized in MongoDB');
  }

  // User management
  async getUser(id: string): Promise<IUser | undefined> {
    await this.connect();
    const user = await User.findById(id).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    await this.connect();
    const user = await User.findOne({ email }).lean();
    return user ? this.transformUser(user) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<IUser> {
    await this.connect();
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    
    const user = new User({
      email: insertUser.email,
      password: hashedPassword,
      firstName: insertUser.firstName,
      lastName: insertUser.lastName,
      isAdmin: false,
    });

    const savedUser = await user.save();
    return this.transformUser(savedUser.toObject());
  }

  async validateUser(credentials: LoginUser): Promise<IUser | null> {
    await this.connect();
    const user = await User.findOne({ email: credentials.email });
    if (!user) return null;
    
    const isValid = await bcrypt.compare(credentials.password, user.password);
    return isValid ? this.transformUser(user.toObject()) : null;
  }

  // Resume management
  async getUserResumes(userId: string): Promise<IResume[]> {
    await this.connect();
    const resumes = await Resume.find({ userId }).lean();
    return resumes.map(resume => this.transformResume(resume));
  }

  async getResume(id: string): Promise<IResume | undefined> {
    await this.connect();
    const resume = await Resume.findById(id).lean();
    return resume ? this.transformResume(resume) : undefined;
  }

  async createResume(insertResume: InsertResume): Promise<IResume> {
    await this.connect();
    const resume = new Resume({
      userId: insertResume.userId,
      templateId: insertResume.templateId,
      title: insertResume.title,
      resumeData: insertResume.resumeData,
      pdfData: null,
    });

    const savedResume = await resume.save();
    return this.transformResume(savedResume.toObject());
  }

  async updateResume(id: string, updates: UpdateResume): Promise<IResume | undefined> {
    await this.connect();
    const resume = await Resume.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();
    
    return resume ? this.transformResume(resume) : undefined;
  }

  async deleteResume(id: string): Promise<boolean> {
    await this.connect();
    const result = await Resume.findByIdAndDelete(id);
    return !!result;
  }

  // Template management
  async getTemplates(): Promise<IResumeTemplate[]> {
    await this.connect();
    const templates = await ResumeTemplate.find({ isActive: true }).lean();
    return templates.map(template => this.transformTemplate(template));
  }

  async getTemplate(id: string): Promise<IResumeTemplate | undefined> {
    await this.connect();
    const template = await ResumeTemplate.findById(id).lean();
    return template ? this.transformTemplate(template) : undefined;
  }

  async createTemplate(insertTemplate: InsertTemplate): Promise<IResumeTemplate> {
    await this.connect();
    const template = new ResumeTemplate({
      name: insertTemplate.name,
      description: insertTemplate.description,
      category: insertTemplate.category,
      templateData: insertTemplate.templateData,
      isActive: true,
    });

    const savedTemplate = await template.save();
    return this.transformTemplate(savedTemplate.toObject());
  }

  async updateTemplate(id: string, updates: Partial<InsertTemplate>): Promise<IResumeTemplate | undefined> {
    await this.connect();
    const template = await ResumeTemplate.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).lean();

    return template ? this.transformTemplate(template) : undefined;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    await this.connect();
    const result = await ResumeTemplate.findByIdAndDelete(id);
    return !!result;
  }

  // Analytics
  async getTotalUsers(): Promise<number> {
    await this.connect();
    return await User.countDocuments();
  }

  async getDailySignups(): Promise<number> {
    await this.connect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await User.countDocuments({
      createdAt: { $gte: today }
    });
  }

  async getDailyLogins(): Promise<number> {
    await this.connect();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return await UserSession.countDocuments({
      loginDate: { $gte: today }
    });
  }

  async getTotalResumes(): Promise<number> {
    await this.connect();
    return await Resume.countDocuments();
  }

  async recordLogin(userId: string): Promise<void> {
    await this.connect();
    const session = new UserSession({
      userId,
      loginDate: new Date()
    });
    await session.save();
  }

  // Transform MongoDB documents to interface format
  private transformUser(mongoUser: any): IUser {
    return {
      id: mongoUser._id.toString(),
      email: mongoUser.email,
      password: mongoUser.password,
      firstName: mongoUser.firstName,
      lastName: mongoUser.lastName,
      isAdmin: mongoUser.isAdmin || false,
      createdAt: mongoUser.createdAt,
      updatedAt: mongoUser.updatedAt,
    };
  }

  private transformResume(mongoResume: any): IResume {
    return {
      id: mongoResume._id.toString(),
      userId: mongoResume.userId.toString(),
      templateId: mongoResume.templateId,
      title: mongoResume.title,
      resumeData: mongoResume.resumeData,
      pdfData: mongoResume.pdfData,
      createdAt: mongoResume.createdAt,
      updatedAt: mongoResume.updatedAt,
    };
  }

  private transformTemplate(mongoTemplate: any): IResumeTemplate {
    return {
      id: mongoTemplate._id.toString(),
      name: mongoTemplate.name,
      description: mongoTemplate.description,
      category: mongoTemplate.category,
      previewImage: mongoTemplate.previewImage,
      templateData: mongoTemplate.templateData,
      isActive: mongoTemplate.isActive,
      createdAt: mongoTemplate.createdAt,
      updatedAt: mongoTemplate.updatedAt,
    };
  }
}
