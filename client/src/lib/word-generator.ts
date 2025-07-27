import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType } from "docx";
import { saveAs } from "file-saver";
import type { ResumeData } from "@/types/resume";
import { formatDateRange } from "./resume-utils";

// Word document generation options
interface WordOptions {
  template?: string;
  fontSize?: number;
  fontFamily?: string;
}

// Default options
const DEFAULT_OPTIONS: WordOptions = {
  template: "modern-professional",
  fontSize: 11,
  fontFamily: "Calibri",
};

// Template color schemes for Word
const TEMPLATE_COLORS = {
  "modern-professional": "#3B82F6", // blue
  "creative-edge": "#10B981", // emerald
  "executive-classic": "#374151", // gray
  "minimalist": "#8B5CF6", // purple
  "tech-developer": "#6366F1", // indigo
  "academic-scholar": "#F59E0B", // amber
};

// Generate Word document from resume data
export const generateResumeWord = async (
  resumeData: ResumeData,
  template: string = "modern-professional",
  options: Partial<WordOptions> = {}
): Promise<Blob> => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const primaryColor = TEMPLATE_COLORS[template as keyof typeof TEMPLATE_COLORS] || TEMPLATE_COLORS["modern-professional"];

  const sections = [];

  // Header Section
  if (resumeData.personalInfo.name) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.name,
            bold: true,
            size: 32, // 16pt
            color: primaryColor,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  if (resumeData.personalInfo.title) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.title,
            size: 24, // 12pt
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Contact Information
  const contactInfo = [
    resumeData.personalInfo.email,
    resumeData.personalInfo.phone,
    resumeData.personalInfo.location,
  ].filter(Boolean);

  if (contactInfo.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: contactInfo.join(" • "),
            size: 20, // 10pt
            color: "666666",
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Add horizontal line
  sections.push(
    new Paragraph({
      border: {
        bottom: {
          color: primaryColor,
          space: 1,
          style: BorderStyle.SINGLE,
          size: 6,
        },
      },
      spacing: { after: 300 },
    })
  );

  // Professional Summary
  if (resumeData.personalInfo.summary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "PROFESSIONAL SUMMARY",
            bold: true,
            size: 24, // 12pt
            color: primaryColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: resumeData.personalInfo.summary,
            size: 22, // 11pt
          }),
        ],
        spacing: { after: 400 },
      })
    );
  }

  // Work Experience
  if (resumeData.experiences.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "WORK EXPERIENCE",
            bold: true,
            size: 24, // 12pt
            color: primaryColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 200, after: 200 },
      })
    );

    resumeData.experiences.forEach((experience, index) => {
      // Job title and company
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: experience.title,
              bold: true,
              size: 22, // 11pt
            }),
            new TextRun({
              text: experience.company ? ` • ${experience.company}` : "",
              size: 22, // 11pt
              color: "666666",
            }),
          ],
          spacing: { before: index > 0 ? 200 : 0, after: 100 },
        })
      );

      // Date range
      const dateRange = formatDateRange(experience.startYear, experience.endYear);
      if (dateRange) {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: dateRange,
                size: 20, // 10pt
                color: "666666",
                italics: true,
              }),
            ],
            spacing: { after: 100 },
          })
        );
      }

      // Description
      if (experience.description) {
        const descriptionLines = experience.description.split('\n').filter(line => line.trim());
        descriptionLines.forEach((line) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: line.trim(),
                  size: 22, // 11pt
                }),
              ],
              spacing: { after: 100 },
            })
          );
        });
      }
    });
  }

  // Skills
  if (resumeData.skills.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "SKILLS",
            bold: true,
            size: 24, // 12pt
            color: primaryColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    // Group skills by category
    const skillsByCategory = resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill.name);
      return acc;
    }, {});

    Object.entries(skillsByCategory).forEach(([category, skills]) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${category}: `,
              bold: true,
              size: 22, // 11pt
            }),
            new TextRun({
              text: skills.join(", "),
              size: 22, // 11pt
            }),
          ],
          spacing: { after: 100 },
        })
      );
    });
  }

  // Education
  if (resumeData.education.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "EDUCATION",
            bold: true,
            size: 24, // 12pt
            color: primaryColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
      })
    );

    resumeData.education.forEach((education, index) => {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: education.degree,
              bold: true,
              size: 22, // 11pt
            }),
            new TextRun({
              text: education.institution ? ` • ${education.institution}` : "",
              size: 22, // 11pt
              color: "666666",
            }),
            new TextRun({
              text: education.graduationYear ? ` • ${education.graduationYear}` : "",
              size: 20, // 10pt
              color: "666666",
              italics: true,
            }),
          ],
          spacing: { before: index > 0 ? 100 : 0, after: 100 },
        })
      );
    });
  }

  // Create the document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  // Generate and return blob
  return await Packer.toBlob(doc);
};

// Download Word document
export const downloadResumeWord = async (
  resumeData: ResumeData,
  filename: string,
  template: string = "modern-professional",
  options?: Partial<WordOptions>
): Promise<void> => {
  try {
    const docBlob = await generateResumeWord(resumeData, template, options);
    saveAs(docBlob, `${filename}.docx`);
  } catch (error) {
    console.error("Failed to generate Word document:", error);
    throw new Error("Failed to generate Word document. Please try again.");
  }
};

// Convert Word document to base64 string for storage
export const resumeWordToBase64 = async (
  resumeData: ResumeData,
  template: string = "modern-professional",
  options?: Partial<WordOptions>
): Promise<string> => {
  try {
    const docBlob = await generateResumeWord(resumeData, template, options);
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix to get pure base64
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      
      reader.onerror = () => {
        reject(new Error("Failed to convert Word document to base64"));
      };
      
      reader.readAsDataURL(docBlob);
    });
  } catch (error) {
    console.error("Failed to convert Word document to base64:", error);
    throw new Error("Failed to process Word document. Please try again.");
  }
};

// Preview Word document (download since Word can't be previewed in browser)
export const previewResumeWord = async (
  resumeData: ResumeData,
  filename: string,
  template: string = "modern-professional",
  options?: Partial<WordOptions>
): Promise<void> => {
  // Word documents can't be previewed in browser, so we download instead
  await downloadResumeWord(resumeData, filename, template, options);
};
