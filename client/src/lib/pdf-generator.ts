import jsPDF from "jspdf";
import type { ResumeData } from "@/types/resume";
import { formatDateRange, groupSkillsByCategory } from "./resume-utils";

// PDF generation options
interface PDFOptions {
  format: "a4" | "letter";
  orientation: "portrait" | "landscape";
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// Default PDF options
const DEFAULT_OPTIONS: PDFOptions = {
  format: "a4",
  orientation: "portrait",
  margins: {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20,
  },
};

// Template color schemes
const TEMPLATE_COLORS = {
  "modern-professional": {
    primary: [59, 130, 246], // blue
    secondary: [107, 114, 128], // gray
    text: [17, 24, 39], // dark gray
  },
  "creative-edge": {
    primary: [16, 185, 129], // emerald
    secondary: [107, 114, 128], // gray
    text: [17, 24, 39], // dark gray
  },
  "executive-classic": {
    primary: [55, 65, 81], // dark gray
    secondary: [107, 114, 128], // gray
    text: [17, 24, 39], // dark gray
  },
  "minimalist": {
    primary: [139, 92, 246], // purple
    secondary: [107, 114, 128], // gray
    text: [17, 24, 39], // dark gray
  },
  "tech-developer": {
    primary: [99, 102, 241], // indigo
    secondary: [229, 231, 235], // light gray
    text: [17, 24, 39], // dark gray
  },
  "academic-scholar": {
    primary: [245, 158, 11], // amber
    secondary: [107, 114, 128], // gray
    text: [17, 24, 39], // dark gray
  },
};

// Font sizes
const FONT_SIZES = {
  name: 24,
  title: 16,
  sectionHeader: 14,
  body: 11,
  small: 9,
};

// Generate PDF from resume data
export const generateResumePDF = async (
  resumeData: ResumeData,
  template: string = "modern-professional",
  options: Partial<PDFOptions> = {}
): Promise<Blob> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const colors = TEMPLATE_COLORS[template as keyof typeof TEMPLATE_COLORS] || TEMPLATE_COLORS["modern-professional"];
  
  // Create new jsPDF instance
  const pdf = new jsPDF({
    orientation: opts.orientation,
    unit: "mm",
    format: opts.format,
  });

  // Set font
  pdf.setFont("helvetica");
  
  let yPosition = opts.margins.top;
  const pageWidth = pdf.internal.pageSize.width;
  const contentWidth = pageWidth - opts.margins.left - opts.margins.right;

  // Helper function to add text with word wrapping
  const addText = (
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    fontSize: number = FONT_SIZES.body,
    color: number[] = colors.text
  ): number => {
    pdf.setFontSize(fontSize);
    pdf.setTextColor(...color);
    
    const lines = pdf.splitTextToSize(text, maxWidth);
    let currentY = y;
    
    lines.forEach((line: string) => {
      pdf.text(line, x, currentY);
      currentY += fontSize * 0.4; // Line height
    });
    
    return currentY;
  };

  // Helper function to add section header
  const addSectionHeader = (title: string, y: number): number => {
    pdf.setFontSize(FONT_SIZES.sectionHeader);
    pdf.setTextColor(...colors.primary);
    pdf.setFont("helvetica", "bold");
    pdf.text(title, opts.margins.left, y);
    
    // Add underline
    const textWidth = pdf.getTextWidth(title);
    pdf.setDrawColor(...colors.primary);
    pdf.setLineWidth(0.5);
    pdf.line(opts.margins.left, y + 2, opts.margins.left + textWidth, y + 2);
    
    pdf.setFont("helvetica", "normal");
    return y + 10;
  };

  // Header Section
  if (resumeData.personalInfo.name) {
    pdf.setFontSize(FONT_SIZES.name);
    pdf.setTextColor(...colors.primary);
    pdf.setFont("helvetica", "bold");
    pdf.text(resumeData.personalInfo.name, opts.margins.left, yPosition);
    yPosition += 8;
  }

  if (resumeData.personalInfo.title) {
    pdf.setFontSize(FONT_SIZES.title);
    pdf.setTextColor(...colors.secondary);
    pdf.setFont("helvetica", "normal");
    pdf.text(resumeData.personalInfo.title, opts.margins.left, yPosition);
    yPosition += 6;
  }

  // Contact information
  const contactInfo = [
    resumeData.personalInfo.email,
    resumeData.personalInfo.phone,
    resumeData.personalInfo.location,
  ].filter(Boolean);

  if (contactInfo.length > 0) {
    pdf.setFontSize(FONT_SIZES.small);
    pdf.setTextColor(...colors.text);
    pdf.text(contactInfo.join(" • "), opts.margins.left, yPosition);
    yPosition += 8;
  }

  // Add separator line
  pdf.setDrawColor(...colors.primary);
  pdf.setLineWidth(1);
  pdf.line(opts.margins.left, yPosition, pageWidth - opts.margins.right, yPosition);
  yPosition += 10;

  // Professional Summary
  if (resumeData.personalInfo.summary) {
    yPosition = addSectionHeader("Professional Summary", yPosition);
    yPosition = addText(
      resumeData.personalInfo.summary,
      opts.margins.left,
      yPosition,
      contentWidth
    ) + 8;
  }

  // Work Experience
  if (resumeData.experiences.length > 0) {
    yPosition = addSectionHeader("Work Experience", yPosition);
    
    resumeData.experiences.forEach((experience) => {
      // Check if we need a new page
      if (yPosition > pdf.internal.pageSize.height - 40) {
        pdf.addPage();
        yPosition = opts.margins.top;
      }

      // Job title and company
      pdf.setFontSize(FONT_SIZES.body);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text(experience.title, opts.margins.left, yPosition);
      
      if (experience.company) {
        pdf.setFont("helvetica", "normal");
        pdf.text(experience.company, opts.margins.left, yPosition + 4);
      }

      // Date range
      const dateRange = formatDateRange(experience.startYear, experience.endYear);
      if (dateRange) {
        pdf.setFontSize(FONT_SIZES.small);
        pdf.setTextColor(...colors.secondary);
        const dateWidth = pdf.getTextWidth(dateRange);
        pdf.text(dateRange, pageWidth - opts.margins.right - dateWidth, yPosition);
      }

      yPosition += 8;

      // Description
      if (experience.description) {
        pdf.setFont("helvetica", "normal");
        yPosition = addText(
          experience.description,
          opts.margins.left + 5,
          yPosition,
          contentWidth - 5,
          FONT_SIZES.small
        );
      }

      yPosition += 6;
    });
  }

  // Skills
  if (resumeData.skills.length > 0) {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.height - 60) {
      pdf.addPage();
      yPosition = opts.margins.top;
    }

    yPosition = addSectionHeader("Skills", yPosition);
    
    const skillsByCategory = groupSkillsByCategory(resumeData.skills);
    const categories = Object.keys(skillsByCategory);

    if (categories.length > 1) {
      // Multiple categories
      categories.forEach((category) => {
        pdf.setFontSize(FONT_SIZES.body);
        pdf.setTextColor(...colors.text);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${category}:`, opts.margins.left, yPosition);
        yPosition += 4;

        const skillsText = skillsByCategory[category].join(", ");
        yPosition = addText(
          skillsText,
          opts.margins.left + 5,
          yPosition,
          contentWidth - 5,
          FONT_SIZES.small
        ) + 3;
      });
    } else {
      // Single category or no categories
      const allSkills = resumeData.skills.map(skill => skill.name).join(", ");
      yPosition = addText(
        allSkills,
        opts.margins.left,
        yPosition,
        contentWidth,
        FONT_SIZES.small
      ) + 6;
    }
  }

  // Education
  if (resumeData.education.length > 0) {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.height - 40) {
      pdf.addPage();
      yPosition = opts.margins.top;
    }

    yPosition = addSectionHeader("Education", yPosition);
    
    resumeData.education.forEach((education) => {
      pdf.setFontSize(FONT_SIZES.body);
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "bold");
      pdf.text(education.degree, opts.margins.left, yPosition);
      
      if (education.institution) {
        pdf.setFont("helvetica", "normal");
        pdf.text(education.institution, opts.margins.left, yPosition + 4);
      }

      // Graduation year
      if (education.graduationYear) {
        pdf.setFontSize(FONT_SIZES.small);
        pdf.setTextColor(...colors.secondary);
        const yearWidth = pdf.getTextWidth(education.graduationYear);
        pdf.text(education.graduationYear, pageWidth - opts.margins.right - yearWidth, yPosition);
      }

      yPosition += 10;
    });
  }

  // Return PDF as blob
  return new Promise((resolve) => {
    const pdfBlob = pdf.output("blob");
    resolve(pdfBlob);
  });
};

// Download PDF
export const downloadResumePDF = async (
  resumeData: ResumeData,
  filename: string,
  template: string = "modern-professional",
  options?: Partial<PDFOptions>
): Promise<void> => {
  try {
    const pdfBlob = await generateResumePDF(resumeData, template, options);
    
    // Create download link
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF. Please try again.");
  }
};

// Convert PDF to base64 string for storage
export const resumePDFToBase64 = async (
  resumeData: ResumeData,
  template: string = "modern-professional",
  options?: Partial<PDFOptions>
): Promise<string> => {
  try {
    const pdfBlob = await generateResumePDF(resumeData, template, options);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to convert PDF to base64"));
      };
      
      reader.readAsDataURL(pdfBlob);
    });
  } catch (error) {
    console.error("Failed to convert PDF to base64:", error);
    throw new Error("Failed to process PDF. Please try again.");
  }
};

// Preview PDF in new tab
export const previewResumePDF = async (
  resumeData: ResumeData,
  template: string = "modern-professional",
  options?: Partial<PDFOptions>
): Promise<void> => {
  try {
    const pdfBlob = await generateResumePDF(resumeData, template, options);
    const url = URL.createObjectURL(pdfBlob);
    
    // Open in new tab
    const newTab = window.open(url, "_blank");
    if (!newTab) {
      throw new Error("Failed to open PDF preview. Please check your popup blocker.");
    }
    
    // Clean up URL after a delay
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 60000); // 1 minute
  } catch (error) {
    console.error("Failed to preview PDF:", error);
    throw new Error("Failed to preview PDF. Please try again.");
  }
};

// Validate resume data before PDF generation
export const validateResumeForPDF = (resumeData: ResumeData): string[] => {
  const errors: string[] = [];

  if (!resumeData.personalInfo.name.trim()) {
    errors.push("Name is required for PDF generation");
  }

  if (!resumeData.personalInfo.email.trim()) {
    errors.push("Email is required for PDF generation");
  }

  if (resumeData.experiences.length === 0 && resumeData.education.length === 0) {
    errors.push("At least one work experience or education entry is required");
  }

  return errors;
};

// Get estimated PDF page count
export const estimatePDFPages = (resumeData: ResumeData): number => {
  let contentHeight = 0;

  // Header section
  contentHeight += 30;

  // Summary
  if (resumeData.personalInfo.summary) {
    contentHeight += Math.ceil(resumeData.personalInfo.summary.length / 100) * 4 + 10;
  }

  // Experience
  if (resumeData.experiences.length > 0) {
    contentHeight += 10; // Section header
    resumeData.experiences.forEach((exp) => {
      contentHeight += 8; // Title and company
      if (exp.description) {
        contentHeight += Math.ceil(exp.description.length / 120) * 3;
      }
      contentHeight += 6; // Spacing
    });
  }

  // Skills
  if (resumeData.skills.length > 0) {
    contentHeight += 10; // Section header
    const skillsText = resumeData.skills.map(s => s.name).join(", ");
    contentHeight += Math.ceil(skillsText.length / 150) * 3 + 6;
  }

  // Education
  if (resumeData.education.length > 0) {
    contentHeight += 10; // Section header
    contentHeight += resumeData.education.length * 10;
  }

  // Estimate pages (assuming ~250mm usable height per page)
  return Math.max(1, Math.ceil(contentHeight / 250));
};
