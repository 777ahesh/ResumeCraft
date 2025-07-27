import type { ResumeData, PersonalInfo, WorkExperience, Education, Skill } from "@/types/resume";

// Generate unique IDs for resume sections
export const generateId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return Math.random().toString(36).substr(2, 9);
};

// Create default resume data structure
export const createDefaultResumeData = (): ResumeData => {
  return {
    personalInfo: {
      name: "",
      title: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experiences: [],
    education: [],
    skills: [],
  };
};

// Create default work experience
export const createDefaultExperience = (): WorkExperience => {
  return {
    id: generateId(),
    title: "",
    company: "",
    startYear: "",
    endYear: "",
    description: "",
  };
};

// Create default education entry
export const createDefaultEducation = (): Education => {
  return {
    id: generateId(),
    degree: "",
    institution: "",
    graduationYear: "",
  };
};

// Create default skill
export const createDefaultSkill = (category: string = "Technical"): Skill => {
  return {
    id: generateId(),
    name: "",
    category,
  };
};

// Validate resume data
export const validateResumeData = (data: ResumeData): string[] => {
  const errors: string[] = [];

  // Validate personal info
  if (!data.personalInfo.name.trim()) {
    errors.push("Name is required");
  }
  if (!data.personalInfo.email.trim()) {
    errors.push("Email is required");
  }
  if (data.personalInfo.email && !isValidEmail(data.personalInfo.email)) {
    errors.push("Email format is invalid");
  }

  // Validate experiences
  data.experiences.forEach((exp, index) => {
    if (!exp.title.trim()) {
      errors.push(`Experience ${index + 1}: Job title is required`);
    }
    if (!exp.company.trim()) {
      errors.push(`Experience ${index + 1}: Company is required`);
    }
  });

  // Validate education
  data.education.forEach((edu, index) => {
    if (!edu.degree.trim()) {
      errors.push(`Education ${index + 1}: Degree is required`);
    }
    if (!edu.institution.trim()) {
      errors.push(`Education ${index + 1}: Institution is required`);
    }
  });

  return errors;
};

// Helper function to validate email
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Format date range for experience/education
export const formatDateRange = (startYear: string, endYear: string): string => {
  if (!startYear && !endYear) return "";
  if (!endYear) return `${startYear} - Present`;
  if (startYear === endYear) return startYear;
  return `${startYear} - ${endYear}`;
};

// Group skills by category
export const groupSkillsByCategory = (skills: Skill[]): Record<string, string[]> => {
  return skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill.name);
    return acc;
  }, {} as Record<string, string[]>);
};

// Calculate resume completion percentage
export const calculateCompletionPercentage = (data: ResumeData): number => {
  let completedFields = 0;
  let totalFields = 0;

  // Personal info fields (6 fields, name and email are required)
  totalFields += 6;
  if (data.personalInfo.name.trim()) completedFields++;
  if (data.personalInfo.title.trim()) completedFields++;
  if (data.personalInfo.email.trim()) completedFields++;
  if (data.personalInfo.phone.trim()) completedFields++;
  if (data.personalInfo.location.trim()) completedFields++;
  if (data.personalInfo.summary.trim()) completedFields++;

  // Experience section (at least 1 experience recommended)
  totalFields += 1;
  if (data.experiences.length > 0 && data.experiences.some(exp => exp.title.trim() && exp.company.trim())) {
    completedFields++;
  }

  // Education section (at least 1 education recommended)
  totalFields += 1;
  if (data.education.length > 0 && data.education.some(edu => edu.degree.trim() && edu.institution.trim())) {
    completedFields++;
  }

  // Skills section (at least 3 skills recommended)
  totalFields += 1;
  if (data.skills.length >= 3 && data.skills.some(skill => skill.name.trim())) {
    completedFields++;
  }

  return Math.round((completedFields / totalFields) * 100);
};

// Save resume data to localStorage as backup
export const saveResumeToLocalStorage = (resumeId: string, data: ResumeData): void => {
  try {
    const key = `resume_backup_${resumeId}`;
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.warn("Failed to save resume backup to localStorage:", error);
  }
};

// Load resume data from localStorage backup
export const loadResumeFromLocalStorage = (resumeId: string): ResumeData | null => {
  try {
    const key = `resume_backup_${resumeId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to load resume backup from localStorage:", error);
    return null;
  }
};

// Clear resume backup from localStorage
export const clearResumeBackup = (resumeId: string): void => {
  try {
    const key = `resume_backup_${resumeId}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.warn("Failed to clear resume backup from localStorage:", error);
  }
};

// Export resume data as JSON
export const exportResumeAsJSON = (data: ResumeData, filename: string): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
};

// Import resume data from JSON
export const importResumeFromJSON = (file: File): Promise<ResumeData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        
        // Validate the imported data structure
        if (!data.personalInfo || !Array.isArray(data.experiences) || 
            !Array.isArray(data.education) || !Array.isArray(data.skills)) {
          throw new Error("Invalid resume data structure");
        }
        
        resolve(data);
      } catch (error) {
        reject(new Error("Failed to parse resume data"));
      }
    };
    
    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };
    
    reader.readAsText(file);
  });
};

// Sanitize text input to prevent XSS
export const sanitizeText = (text: string): string => {
  return text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

// Format text for display (preserve line breaks)
export const formatTextForDisplay = (text: string): string => {
  return sanitizeText(text).replace(/\n/g, "<br>");
};
