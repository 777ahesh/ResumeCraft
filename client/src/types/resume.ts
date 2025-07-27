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

export type CustomSectionItem = {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  date?: string;
  location?: string;
};

export type CustomSection = {
  id: string;
  name: string;
  items: CustomSectionItem[];
  isVisible: boolean;
};

export type StyleConfig = {
  fontFamily: string;
  fontSize: number;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  headerStyle: 'bold' | 'normal' | 'italic';
  spacing: 'tight' | 'normal' | 'relaxed';
  borderRadius: number;
  lineHeight: number;
};

export type ResumeData = {
  personalInfo: PersonalInfo;
  experiences: WorkExperience[];
  education: Education[];
  skills: Skill[];
  customSections: CustomSection[];
  styleConfig?: StyleConfig;
};
