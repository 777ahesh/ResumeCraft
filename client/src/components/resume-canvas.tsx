import type { ResumeData } from "@/types/resume";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  template: string;
}

export function ResumeCanvas({ resumeData, template }: ResumeCanvasProps) {
  const getTemplateStyles = (templateId: string) => {
    const styles = {
      "modern-professional": {
        primaryColor: "rgb(59, 130, 246)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(59, 130, 246)",
      },
      "creative-edge": {
        primaryColor: "rgb(16, 185, 129)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(16, 185, 129)",
      },
      "executive-classic": {
        primaryColor: "rgb(55, 65, 81)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(55, 65, 81)",
      },
      "minimalist": {
        primaryColor: "rgb(139, 92, 246)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(139, 92, 246)",
      },
      "tech-developer": {
        primaryColor: "rgb(99, 102, 241)",
        secondaryColor: "rgb(229, 231, 235)",
        accentColor: "rgb(99, 102, 241)",
      },
      "academic-scholar": {
        primaryColor: "rgb(245, 158, 11)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(245, 158, 11)",
      },
    };
    
    return styles[templateId as keyof typeof styles] || styles["modern-professional"];
  };

  const templateStyle = getTemplateStyles(template);

  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        <div 
          className="bg-white rounded-lg shadow-lg p-8 resume-canvas"
          style={{ width: "8.5in", minHeight: "11in" }}
        >
          {/* Header */}
          <div 
            className="border-b-2 pb-6 mb-6"
            style={{ borderColor: templateStyle.primaryColor }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {resumeData.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-xl text-gray-700 mb-3">
              {resumeData.personalInfo.title || "Your Title"}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              {resumeData.personalInfo.email && <span>{resumeData.personalInfo.email}</span>}
              {resumeData.personalInfo.phone && <span>{resumeData.personalInfo.phone}</span>}
              {resumeData.personalInfo.location && <span>{resumeData.personalInfo.location}</span>}
            </div>
          </div>

          {/* Professional Summary */}
          {resumeData.personalInfo.summary && (
            <div className="mb-6">
              <h2 
                className="text-lg font-semibold text-gray-900 mb-3 border-l-4 pl-3"
                style={{ borderColor: templateStyle.primaryColor }}
              >
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {resumeData.personalInfo.summary}
              </p>
            </div>
          )}

          {/* Work Experience */}
          {resumeData.experiences.length > 0 && (
            <div className="mb-6">
              <h2 
                className="text-lg font-semibold text-gray-900 mb-4 border-l-4 pl-3"
                style={{ borderColor: templateStyle.primaryColor }}
              >
                Work Experience
              </h2>
              <div className="space-y-4">
                {resumeData.experiences.map((experience) => (
                  <div key={experience.id} className="mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{experience.title}</h3>
                        <p className="text-gray-700">{experience.company}</p>
                      </div>
                      <span className="text-sm text-gray-600">
                        {experience.startYear} - {experience.endYear}
                      </span>
                    </div>
                    {experience.description && (
                      <div className="text-gray-700 text-sm whitespace-pre-line ml-4">
                        {experience.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h2 
                className="text-lg font-semibold text-gray-900 mb-3 border-l-4 pl-3"
                style={{ borderColor: templateStyle.primaryColor }}
              >
                Skills
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {}).map ? Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                    <p className="text-gray-700 text-sm">{skills.join(", ")}</p>
                  </div>
                )) : (
                  <div className="col-span-2">
                    <p className="text-gray-700 text-sm">
                      {resumeData.skills.map(skill => skill.name).join(", ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div>
              <h2 
                className="text-lg font-semibold text-gray-900 mb-3 border-l-4 pl-3"
                style={{ borderColor: templateStyle.primaryColor }}
              >
                Education
              </h2>
              <div className="space-y-2">
                {resumeData.education.map((education) => (
                  <div key={education.id} className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{education.degree}</h3>
                      <p className="text-gray-700">{education.institution}</p>
                    </div>
                    <span className="text-sm text-gray-600">{education.graduationYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
