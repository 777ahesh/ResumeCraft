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
