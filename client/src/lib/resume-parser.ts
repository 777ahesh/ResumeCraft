import type { ResumeData, WorkExperience, Education, Skill } from '@/types/resume';

export interface ParsedResumeData {
  personalInfo: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    summary: string;
  };
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
}

export class ResumeParser {
  private static emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  private static phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
  private static yearRegex = /\b(19|20)\d{2}\b/g;
  
  static parseText(text: string): ParsedResumeData {
    console.log('🔧 ResumeParser.parseText called');
    console.log('📝 Input text length:', text.length);
    console.log('📝 Input text preview:', text.substring(0, 300));
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    console.log('📄 Total lines after processing:', lines.length);
    
    const result: ParsedResumeData = {
      personalInfo: {
        name: '',
        title: '',
        email: '',
        phone: '',
        location: '',
        summary: ''
      },
      experiences: [],
      education: [],
      skills: []
    };

    let currentSection = '';
    let currentExperience: Partial<WorkExperience> | null = null;
    let currentEducation: Partial<Education> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lowerLine = line.toLowerCase();
      
      // Extract personal information
      this.extractPersonalInfo(line, result.personalInfo);
      
      // Detect sections
      const section = this.detectSection(lowerLine);
      if (section) {
        console.log(`📂 Section detected: "${section}" at line ${i}: "${line}"`);
        // Save current items before switching sections
        this.saveCurrentItems(currentExperience, currentEducation, result);
        currentSection = section;
        currentExperience = null;
        currentEducation = null;
        continue;
      }
      
      // Process content based on current section
      switch (currentSection) {
        case 'experience':
          const experienceData = this.parseExperienceEntry(line, lines, i);
          if (experienceData.experience) {
            console.log('💼 Found experience entry:', experienceData.experience);
            this.saveCurrentItems(currentExperience, null, result);
            currentExperience = experienceData.experience;
          }
          break;
          
        case 'education':
          const educationData = this.parseEducationEntry(line);
          if (educationData) {
            console.log('🎓 Found education entry:', educationData);
            this.saveCurrentItems(null, currentEducation, result);
            currentEducation = educationData;
          }
          break;
          
        case 'skills':
          const skills = this.parseSkills(line);
          if (skills.length > 0) {
            console.log('🛠️ Found skills:', skills);
            result.skills.push(...skills);
          }
          break;
          
        case 'summary':
          if (result.personalInfo.summary) {
            result.personalInfo.summary += ' ' + line;
          } else {
            result.personalInfo.summary = line;
          }
          console.log('📋 Added to summary:', line);
          break;
      }
    }
    
    // Save any remaining items
    this.saveCurrentItems(currentExperience, currentEducation, result);
    
    // Fill in defaults if needed
    this.addDefaults(result);
    
    console.log('🎯 Final parsed result:');
    console.log('👤 Personal Info:', result.personalInfo);
    console.log('💼 Experiences:', result.experiences);
    console.log('🎓 Education:', result.education);
    console.log('🛠️ Skills:', result.skills);
    
    return result;
  }

  private static extractPersonalInfo(line: string, personalInfo: any) {
    const lowerLine = line.toLowerCase();
    
    // Extract email
    const emailMatch = line.match(this.emailRegex);
    if (emailMatch && !personalInfo.email) {
      personalInfo.email = emailMatch[0];
      console.log('📧 Found email:', emailMatch[0]);
      return;
    }
    
    // Extract phone
    const phoneMatch = line.match(this.phoneRegex);
    if (phoneMatch && !personalInfo.phone) {
      personalInfo.phone = phoneMatch[0];
      console.log('📞 Found phone:', phoneMatch[0]);
      return;
    }
    
    // Extract name (usually the first substantial line without contact info)
    if (!personalInfo.name && line.length > 5 && line.length < 50 && 
        !lowerLine.includes('@') && !lowerLine.includes('phone') && 
        !lowerLine.includes('email') && !line.match(this.phoneRegex)) {
      personalInfo.name = line;
      console.log('👤 Found name:', line);
      return;
    }
    
    // Extract location (lines with state abbreviations, zip codes, or common location words)
    if (!personalInfo.location && this.isLocationLine(line)) {
      personalInfo.location = line;
      console.log('📍 Found location:', line);
    }
  }

  private static isLocationLine(line: string): boolean {
    const locationKeywords = ['street', 'avenue', 'road', 'drive', 'lane', 'blvd', 'st', 'ave'];
    const stateAbbreviations = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
    
    const lowerLine = line.toLowerCase();
    const hasLocationKeyword = locationKeywords.some(keyword => lowerLine.includes(keyword));
    const hasStateAbbreviation = stateAbbreviations.some(state => line.includes(state));
    const hasZipCode = /\b\d{5}(-\d{4})?\b/.test(line);
    
    return hasLocationKeyword || hasStateAbbreviation || hasZipCode;
  }

  private static detectSection(lowerLine: string): string | null {
    console.log(`🔍 Checking line for section: "${lowerLine}"`);
    
    const sectionMap: { [key: string]: string } = {
      'experience': 'experience',
      'work experience': 'experience',
      'professional experience': 'experience',
      'employment': 'experience',
      'work history': 'experience',
      'career': 'experience',
      'career history': 'experience',
      'employment history': 'experience',
      'professional background': 'experience',
      'education': 'education',
      'academic background': 'education',
      'educational background': 'education',
      'qualifications': 'education',
      'academics': 'education',
      'degrees': 'education',
      'skills': 'skills',
      'technical skills': 'skills',
      'core competencies': 'skills',
      'competencies': 'skills',
      'expertise': 'skills',
      'abilities': 'skills',
      'technologies': 'skills',
      'proficiencies': 'skills',
      'summary': 'summary',
      'professional summary': 'summary',
      'profile': 'summary',
      'objective': 'summary',
      'career objective': 'summary',
      'about': 'summary',
      'about me': 'summary',
      'overview': 'summary'
    };
    
    // Check if line is likely a section header (short line, focused content)
    if (lowerLine.length > 50) {
      return null; // Too long to be a section header
    }
    
    for (const [key, section] of Object.entries(sectionMap)) {
      if (lowerLine === key || 
          (lowerLine.includes(key) && lowerLine.length < key.length + 10)) {
        console.log(`✅ Detected section: ${section} (matched "${key}")`);
        return section;
      }
    }
    
    return null;
  }

  private static parseExperienceEntry(line: string, allLines: string[], currentIndex: number): { experience: Partial<WorkExperience> | null } {
    // Look for job titles and companies
    const yearMatches = line.match(this.yearRegex);
    
    // If the line contains years, it might be a job entry
    if (yearMatches && yearMatches.length >= 1) {
      const experience: Partial<WorkExperience> = {
        id: Math.random().toString(36).substr(2, 9),
        title: '',
        company: '',
        startYear: '',
        endYear: '',
        description: ''
      };
      
      // Extract years
      if (yearMatches.length >= 2) {
        experience.startYear = yearMatches[0];
        experience.endYear = yearMatches[1];
      } else {
        experience.startYear = yearMatches[0];
        experience.endYear = 'Present';
      }
      
      // Try to extract position and company from current and surrounding lines
      const cleanLine = line.replace(this.yearRegex, '').replace(/[-–—]/g, '').trim();
      const parts = cleanLine.split(/[,|@]/);
      
      if (parts.length >= 2) {
        experience.title = parts[0].trim();
        experience.company = parts[1].trim();
      } else {
        experience.title = cleanLine;
        // Look for company in next line
        if (currentIndex + 1 < allLines.length) {
          experience.company = allLines[currentIndex + 1].trim();
        }
      }
      
      return { experience };
    }
    
    return { experience: null };
  }

  private static parseEducationEntry(line: string): Partial<Education> | null {
    const yearMatches = line.match(this.yearRegex);
    
    if (yearMatches) {
      const education: Partial<Education> = {
        id: Math.random().toString(36).substr(2, 9),
        institution: '',
        degree: '',
        graduationYear: yearMatches[yearMatches.length - 1] // Use the latest year
      };
      
      // Common degree patterns
      const degreePatterns = [
        /bachelor[s]?\s+of\s+\w+/i,
        /master[s]?\s+of\s+\w+/i,
        /phd|doctorate/i,
        /associate[s]?\s+degree/i,
        /b\.?[as]\.?/i,
        /m\.?[as]\.?/i,
        /ph\.?d\.?/i
      ];
      
      const cleanLine = line.replace(this.yearRegex, '').trim();
      
      for (const pattern of degreePatterns) {
        const match = cleanLine.match(pattern);
        if (match) {
          education.degree = match[0];
          education.institution = cleanLine.replace(pattern, '').replace(/[,-]/g, '').trim();
          break;
        }
      }
      
      if (!education.degree) {
        // If no degree pattern found, assume the whole line is institution
        education.institution = cleanLine;
        education.degree = 'Degree';
      }
      
      return education;
    }
    
    return null;
  }

  private static parseSkills(line: string): Skill[] {
    const skills: Skill[] = [];
    
    // Split by common delimiters
    const skillItems = line.split(/[,;|•·]/);
    
    for (let item of skillItems) {
      item = item.trim();
      if (item.length > 1 && item.length < 50) {
        skills.push({
          id: Math.random().toString(36).substr(2, 9),
          name: item,
          category: this.categorizeSkill(item)
        });
      }
    }
    
    return skills;
  }

  private static categorizeSkill(skill: string): string {
    const lowerSkill = skill.toLowerCase();
    
    const categories = {
      'Programming Languages': ['javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift'],
      'Web Technologies': ['html', 'css', 'react', 'angular', 'vue', 'node', 'express', 'webpack'],
      'Databases': ['mysql', 'postgresql', 'mongodb', 'redis', 'oracle', 'sqlite'],
      'Tools & Platforms': ['git', 'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'jenkins'],
      'Soft Skills': ['leadership', 'communication', 'teamwork', 'management', 'planning', 'organization']
    };
    
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => lowerSkill.includes(keyword))) {
        return category;
      }
    }
    
    return 'General Skills';
  }

  private static saveCurrentItems(
    experience: Partial<WorkExperience> | null,
    education: Partial<Education> | null,
    result: ParsedResumeData
  ) {
    if (experience && experience.title) {
      result.experiences.push(experience as WorkExperience);
    }
    if (education && education.institution) {
      result.education.push(education as Education);
    }
  }

  private static addDefaults(result: ParsedResumeData) {
    // Add default title if name is found but no title
    if (result.personalInfo.name && !result.personalInfo.title) {
      result.personalInfo.title = 'Professional';
    }
    
    // Add default summary if none found
    if (!result.personalInfo.summary) {
      result.personalInfo.summary = 'Experienced professional with a strong background in various fields.';
    }
    
    // Add some default skills if none found
    if (result.skills.length === 0) {
      result.skills = [
        { id: '1', name: 'Communication', category: 'Soft Skills' },
        { id: '2', name: 'Teamwork', category: 'Soft Skills' },
        { id: '3', name: 'Problem Solving', category: 'Soft Skills' }
      ];
    }
    
    // Ensure experiences have required fields
    result.experiences = result.experiences.map(exp => ({
      ...exp,
      id: exp.id || Math.random().toString(36).substr(2, 9),
      title: exp.title || 'Position',
      company: exp.company || 'Company',
      startYear: exp.startYear || '2020',
      endYear: exp.endYear || 'Present',
      description: exp.description || 'Responsibilities and achievements in this role.'
    }));
    
    // Ensure education has required fields
    result.education = result.education.map(edu => ({
      ...edu,
      id: edu.id || Math.random().toString(36).substr(2, 9),
      institution: edu.institution || 'Institution',
      degree: edu.degree || 'Degree',
      graduationYear: edu.graduationYear || '2020'
    }));
  }
}
