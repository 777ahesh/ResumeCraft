import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Plus, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import type { ResumeData, WorkExperience, Education, Skill } from "@/types/resume";
// Browser-compatible UUID generation
const generateId = () => {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
};

interface ResumeControlPanelProps {
  resumeData: ResumeData;
  onChange: (data: ResumeData) => void;
}

export function ResumeControlPanel({ resumeData, onChange }: ResumeControlPanelProps) {
  const [openSections, setOpenSections] = useState({
    personal: true,
    summary: true,
    experience: true,
    education: true,
    skills: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updatePersonalInfo = (field: string, value: string) => {
    onChange({
      ...resumeData,
      personalInfo: {
        ...resumeData.personalInfo,
        [field]: value,
      },
    });
  };

  const addExperience = () => {
    const newExperience: WorkExperience = {
      id: generateId(),
      title: "",
      company: "",
      startYear: "",
      endYear: "",
      description: "",
    };
    
    onChange({
      ...resumeData,
      experiences: [...resumeData.experiences, newExperience],
    });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      experiences: resumeData.experiences.map(exp =>
        exp.id === id ? { ...exp, [field]: value } : exp
      ),
    });
  };

  const removeExperience = (id: string) => {
    onChange({
      ...resumeData,
      experiences: resumeData.experiences.filter(exp => exp.id !== id),
    });
  };

  const addEducation = () => {
    const newEducation: Education = {
      id: generateId(),
      degree: "",
      institution: "",
      graduationYear: "",
    };
    
    onChange({
      ...resumeData,
      education: [...resumeData.education, newEducation],
    });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.map(edu =>
        edu.id === id ? { ...edu, [field]: value } : edu
      ),
    });
  };

  const removeEducation = (id: string) => {
    onChange({
      ...resumeData,
      education: resumeData.education.filter(edu => edu.id !== id),
    });
  };

  const addSkill = () => {
    const newSkill: Skill = {
      id: generateId(),
      name: "",
      category: "Technical",
    };
    
    onChange({
      ...resumeData,
      skills: [...resumeData.skills, newSkill],
    });
  };

  const updateSkill = (id: string, field: string, value: string) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.map(skill =>
        skill.id === id ? { ...skill, [field]: value } : skill
      ),
    });
  };

  const removeSkill = (id: string) => {
    onChange({
      ...resumeData,
      skills: resumeData.skills.filter(skill => skill.id !== id),
    });
  };

  return (
    <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Resume</h2>
        
        <div className="space-y-4">
          {/* Personal Information */}
          <Card>
            <Collapsible open={openSections.personal} onOpenChange={() => toggleSection('personal')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    Personal Information
                    {openSections.personal ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={resumeData.personalInfo.name}
                      onChange={(e) => updatePersonalInfo('name', e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={resumeData.personalInfo.title}
                      onChange={(e) => updatePersonalInfo('title', e.target.value)}
                      placeholder="Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={resumeData.personalInfo.email}
                      onChange={(e) => updatePersonalInfo('email', e.target.value)}
                      placeholder="john.doe@email.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={resumeData.personalInfo.phone}
                      onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={resumeData.personalInfo.location}
                      onChange={(e) => updatePersonalInfo('location', e.target.value)}
                      placeholder="San Francisco, CA"
                    />
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Professional Summary */}
          <Card>
            <Collapsible open={openSections.summary} onOpenChange={() => toggleSection('summary')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    Professional Summary
                    {openSections.summary ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <Textarea
                    value={resumeData.personalInfo.summary}
                    onChange={(e) => updatePersonalInfo('summary', e.target.value)}
                    placeholder="Write a compelling summary..."
                    rows={4}
                  />
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Work Experience */}
          <Card>
            <Collapsible open={openSections.experience} onOpenChange={() => toggleSection('experience')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    Work Experience
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          addExperience();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {openSections.experience ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {resumeData.experiences.map((experience) => (
                    <div key={experience.id} className="border border-gray-200 rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={experience.title}
                            onChange={(e) => updateExperience(experience.id, 'title', e.target.value)}
                            placeholder="Job Title"
                            className="text-sm"
                          />
                          <Input
                            value={experience.company}
                            onChange={(e) => updateExperience(experience.id, 'company', e.target.value)}
                            placeholder="Company"
                            className="text-sm"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={experience.startYear}
                              onChange={(e) => updateExperience(experience.id, 'startYear', e.target.value)}
                              placeholder="Start Year"
                              className="text-sm"
                            />
                            <Input
                              value={experience.endYear}
                              onChange={(e) => updateExperience(experience.id, 'endYear', e.target.value)}
                              placeholder="End Year"
                              className="text-sm"
                            />
                          </div>
                          <Textarea
                            value={experience.description}
                            onChange={(e) => updateExperience(experience.id, 'description', e.target.value)}
                            placeholder="Job description..."
                            rows={3}
                            className="text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeExperience(experience.id)}
                          className="ml-2 h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Education */}
          <Card>
            <Collapsible open={openSections.education} onOpenChange={() => toggleSection('education')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    Education
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          addEducation();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {openSections.education ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-4 pt-0">
                  {resumeData.education.map((education) => (
                    <div key={education.id} className="border border-gray-200 rounded p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <Input
                            value={education.degree}
                            onChange={(e) => updateEducation(education.id, 'degree', e.target.value)}
                            placeholder="Degree"
                            className="text-sm"
                          />
                          <Input
                            value={education.institution}
                            onChange={(e) => updateEducation(education.id, 'institution', e.target.value)}
                            placeholder="Institution"
                            className="text-sm"
                          />
                          <Input
                            value={education.graduationYear}
                            onChange={(e) => updateEducation(education.id, 'graduationYear', e.target.value)}
                            placeholder="Graduation Year"
                            className="text-sm"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeEducation(education.id)}
                          className="ml-2 h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>

          {/* Skills */}
          <Card>
            <Collapsible open={openSections.skills} onOpenChange={() => toggleSection('skills')}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                  <CardTitle className="flex items-center justify-between text-base">
                    Skills
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          addSkill();
                        }}
                        className="h-6 w-6 p-0"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      {openSections.skills ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </CardTitle>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-2 pt-0">
                  {resumeData.skills.map((skill) => (
                    <div key={skill.id} className="flex items-center space-x-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                        placeholder="Skill name"
                        className="flex-1 text-sm"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeSkill(skill.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        </div>
      </div>
    </div>
  );
}
