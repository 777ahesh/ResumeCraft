import mongoose from 'mongoose';

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
}, {
  timestamps: true // This adds createdAt and updatedAt
});

// Resume Template Schema
const resumeTemplateSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Custom string ID
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  previewImage: { type: String },
  templateData: { type: mongoose.Schema.Types.Mixed, required: true },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true,
  _id: false // Disable auto ObjectId generation
});

// Resume Schema
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  templateId: { type: String, required: true }, // Changed to String to support custom IDs
  title: { type: String, required: true },
  resumeData: { type: mongoose.Schema.Types.Mixed, required: true },
  pdfData: { type: String }, // base64 encoded PDF
}, {
  timestamps: true
});

// User Session Schema for analytics
const userSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  loginDate: { type: Date, default: Date.now },
});

// Create and export models
export const User = mongoose.model('User', userSchema);
export const ResumeTemplate = mongoose.model('ResumeTemplate', resumeTemplateSchema);
export const Resume = mongoose.model('Resume', resumeSchema);
export const UserSession = mongoose.model('UserSession', userSessionSchema);

// Connection function
export const connectToMongoDB = async (connectionString: string): Promise<void> => {
  try {
    // Set connection options for better reliability
    const options = {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    };

    await mongoose.connect(connectionString, options);
    console.log('Connected to MongoDB successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
};

// Disconnect function
export const disconnectFromMongoDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('MongoDB disconnection error:', error);
  }
};
