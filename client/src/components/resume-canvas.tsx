import type { ResumeData } from "@/types/resume";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  template: string;
}

export function ResumeCanvas({ resumeData, template }: ResumeCanvasProps) {
  const getTemplateConfig = (templateId: string) => {
    const configs = {
      "modern-professional": {
        primaryColor: "rgb(59, 130, 246)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(59, 130, 246)",
        layout: "modern"
      },
      "creative-edge": {
        primaryColor: "rgb(16, 185, 129)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(16, 185, 129)",
        layout: "creative"
      },
      "executive-classic": {
        primaryColor: "rgb(55, 65, 81)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(55, 65, 81)",
        layout: "executive"
      },
      "minimalist": {
        primaryColor: "rgb(139, 92, 246)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(139, 92, 246)",
        layout: "minimal"
      },
      "tech-developer": {
        primaryColor: "rgb(99, 102, 241)",
        secondaryColor: "rgb(229, 231, 235)",
        accentColor: "rgb(99, 102, 241)",
        layout: "tech"
      },
      "academic-scholar": {
        primaryColor: "rgb(245, 158, 11)",
        secondaryColor: "rgb(107, 114, 128)",
        accentColor: "rgb(245, 158, 11)",
        layout: "academic"
      },
    };
    
    return configs[templateId as keyof typeof configs] || configs["modern-professional"];
  };

  const templateConfig = getTemplateConfig(template);

  // Modern Professional Template - Two Column Layout with Left Sidebar
  const ModernProfessionalTemplate = () => (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden resume-canvas"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      <div className="flex">
        {/* Left Sidebar */}
        <div 
          className="w-1/3 p-6 text-white"
          style={{ backgroundColor: templateConfig.primaryColor }}
        >
          {/* Profile Photo Placeholder */}
          <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-4xl">👤</span>
          </div>
          
          {/* Contact Info */}
          <div className="mb-6">
            <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">Contact</h3>
            <div className="space-y-3 text-sm">
              {resumeData.personalInfo.email && (
                <div className="flex items-center">
                  <span className="mr-3">📧</span>
                  <span className="break-all">{resumeData.personalInfo.email}</span>
                </div>
              )}
              {resumeData.personalInfo.phone && (
                <div className="flex items-center">
                  <span className="mr-3">📱</span>
                  <span>{resumeData.personalInfo.phone}</span>
                </div>
              )}
              {resumeData.personalInfo.location && (
                <div className="flex items-center">
                  <span className="mr-3">📍</span>
                  <span>{resumeData.personalInfo.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">Skills</h3>
              <div className="space-y-4">
                {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-semibold text-sm mb-2 opacity-90">{category}</h4>
                    <div className="space-y-2">
                      {skills.map((skill, index) => (
                        <div key={index} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span>{skill}</span>
                            <span>●●●●○</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div>
              <h3 className="text-lg font-bold mb-4 uppercase tracking-wide">Education</h3>
              <div className="space-y-3">
                {resumeData.education.map((education) => (
                  <div key={education.id} className="text-sm">
                    <h4 className="font-semibold">{education.degree}</h4>
                    <p className="opacity-90">{education.institution}</p>
                    <span className="text-xs opacity-75">{education.graduationYear}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Main Content */}
        <div className="w-2/3 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {resumeData.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {resumeData.personalInfo.title || "Your Professional Title"}
            </p>
            
            {/* Professional Summary */}
            {resumeData.personalInfo.summary && (
              <div className="mt-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <span 
                    className="w-4 h-4 rounded mr-3"
                    style={{ backgroundColor: templateConfig.primaryColor }}
                  ></span>
                  About Me
                </h2>
                <p className="text-gray-700 leading-relaxed">
                  {resumeData.personalInfo.summary}
                </p>
              </div>
            )}
          </div>

          {/* Work Experience */}
          {resumeData.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <span 
                  className="w-4 h-4 rounded mr-3"
                  style={{ backgroundColor: templateConfig.primaryColor }}
                ></span>
                Professional Experience
              </h2>
              <div className="space-y-6">
                {resumeData.experiences.map((experience, index) => (
                  <div key={experience.id} className="relative">
                    {index !== resumeData.experiences.length - 1 && (
                      <div 
                        className="absolute left-0 top-8 w-px h-full bg-gray-200"
                      ></div>
                    )}
                    <div className="flex">
                      <div 
                        className="w-3 h-3 rounded-full mt-2 mr-4 z-10"
                        style={{ backgroundColor: templateConfig.primaryColor }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{experience.title}</h3>
                            <p 
                              className="font-semibold"
                              style={{ color: templateConfig.primaryColor }}
                            >
                              {experience.company}
                            </p>
                          </div>
                          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                            {experience.startYear} - {experience.endYear}
                          </span>
                        </div>
                        {experience.description && (
                          <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                            {experience.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Creative Edge Template - Zigzag Layout with Modern Cards
  const CreativeEdgeTemplate = () => (
    <div 
      className="bg-gradient-to-br from-gray-50 to-white rounded-lg shadow-lg overflow-hidden resume-canvas"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      {/* Creative Header with Geometric Shapes */}
      <div className="relative overflow-hidden">
        <div 
          className="h-48 relative"
          style={{ background: `linear-gradient(135deg, ${templateConfig.primaryColor}, ${templateConfig.accentColor})` }}
        >
          {/* Geometric decorations */}
          <div className="absolute top-4 right-4 w-16 h-16 bg-white bg-opacity-20 rounded-full"></div>
          <div className="absolute bottom-8 right-12 w-8 h-8 bg-white bg-opacity-30 rotate-45"></div>
          <div className="absolute top-12 right-24 w-4 h-4 bg-white bg-opacity-40 rounded-full"></div>
          
          <div className="absolute bottom-8 left-8 text-white">
            <h1 className="text-4xl font-bold mb-2 tracking-wide">
              {resumeData.personalInfo.name || "Your Name"}
            </h1>
            <p className="text-xl opacity-90 font-light">
              {resumeData.personalInfo.title || "Your Creative Title"}
            </p>
          </div>
        </div>
        
        {/* Contact Cards floating over header */}
        <div className="absolute -bottom-6 left-8 right-8 flex gap-4">
          {resumeData.personalInfo.email && (
            <div className="bg-white rounded-lg shadow-md p-3 flex-1">
              <div className="text-xs text-gray-500 mb-1">Email</div>
              <div className="text-sm font-medium text-gray-900">{resumeData.personalInfo.email}</div>
            </div>
          )}
          {resumeData.personalInfo.phone && (
            <div className="bg-white rounded-lg shadow-md p-3 flex-1">
              <div className="text-xs text-gray-500 mb-1">Phone</div>
              <div className="text-sm font-medium text-gray-900">{resumeData.personalInfo.phone}</div>
            </div>
          )}
          {resumeData.personalInfo.location && (
            <div className="bg-white rounded-lg shadow-md p-3 flex-1">
              <div className="text-xs text-gray-500 mb-1">Location</div>
              <div className="text-sm font-medium text-gray-900">{resumeData.personalInfo.location}</div>
            </div>
          )}
        </div>
      </div>

      <div className="px-8 pt-12 pb-8">
        {/* Summary with creative styling */}
        {resumeData.personalInfo.summary && (
          <div className="mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 border-l-4" style={{ borderColor: templateConfig.primaryColor }}>
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center">
                <span className="w-2 h-2 bg-current rounded-full mr-3" style={{ color: templateConfig.primaryColor }}></span>
                Creative Vision
              </h2>
              <p className="text-gray-700 leading-relaxed italic">
                "{resumeData.personalInfo.summary}"
              </p>
            </div>
          </div>
        )}

        {/* Zigzag Layout for Experience */}
        {resumeData.experiences.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              Creative Journey
            </h2>
            <div className="space-y-6">
              {resumeData.experiences.map((experience, index) => (
                <div 
                  key={experience.id} 
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`w-4/5 ${index % 2 === 0 ? 'mr-8' : 'ml-8'}`}>
                    <div className="bg-white rounded-xl shadow-md p-6 relative">
                      {/* Arrow pointing to timeline */}
                      <div 
                        className={`absolute top-6 w-0 h-0 ${
                          index % 2 === 0 
                            ? 'right-0 translate-x-full border-l-8 border-y-8 border-r-0' 
                            : 'left-0 -translate-x-full border-r-8 border-y-8 border-l-0'
                        } border-y-transparent`}
                        style={{ borderColor: index % 2 === 0 ? `transparent transparent transparent ${templateConfig.primaryColor}` : `transparent transparent transparent transparent`, borderRightColor: index % 2 !== 0 ? templateConfig.primaryColor : 'transparent' }}
                      ></div>
                      
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{experience.title}</h3>
                          <p className="font-semibold" style={{ color: templateConfig.primaryColor }}>
                            {experience.company}
                          </p>
                        </div>
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: templateConfig.primaryColor }}
                        >
                          {experience.startYear} - {experience.endYear}
                        </span>
                      </div>
                      {experience.description && (
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {experience.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section - Skills and Education in Cards */}
        <div className="grid grid-cols-2 gap-8">
          {/* Skills as circular progress */}
          {resumeData.skills.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Expertise</h2>
              <div className="bg-white rounded-xl shadow-md p-6">
                {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category} className="mb-4 last:mb-0">
                    <h4 className="font-semibold text-gray-900 mb-3 text-center" style={{ color: templateConfig.primaryColor }}>
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:text-white transition-colors"
                          style={{ backgroundColor: `${templateConfig.primaryColor}20` }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {resumeData.education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Education</h2>
              <div className="space-y-4">
                {resumeData.education.map((education) => (
                  <div key={education.id} className="bg-white rounded-xl shadow-md p-6">
                    <h3 className="font-bold text-gray-900 mb-1">{education.degree}</h3>
                    <p className="font-semibold mb-2" style={{ color: templateConfig.primaryColor }}>
                      {education.institution}
                    </p>
                    <span className="inline-block px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                      {education.graduationYear}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Executive Classic Template - Newspaper Style Layout
  const ExecutiveClassicTemplate = () => (
    <div 
      className="bg-white rounded-lg shadow-lg p-8 resume-canvas"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      {/* Executive Header with Letterhead Style */}
      <div className="border-b-2 border-gray-900 pb-6 mb-8">
        <div className="text-center">
          <h1 className="text-5xl font-serif font-bold text-gray-900 mb-3 tracking-wider">
            {resumeData.personalInfo.name?.toUpperCase() || "YOUR NAME"}
          </h1>
          <div className="w-24 h-1 bg-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700 mb-4 font-serif italic">
            {resumeData.personalInfo.title || "Executive Professional"}
          </p>
          
          {/* Contact info in newspaper style */}
          <div className="flex justify-center items-center gap-8 text-sm text-gray-600 font-serif">
            {resumeData.personalInfo.email && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                {resumeData.personalInfo.email}
              </span>
            )}
            {resumeData.personalInfo.phone && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                {resumeData.personalInfo.phone}
              </span>
            )}
            {resumeData.personalInfo.location && (
              <span className="flex items-center">
                <span className="w-2 h-2 bg-gray-900 rounded-full mr-2"></span>
                {resumeData.personalInfo.location}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Executive Summary as Feature Article */}
      {resumeData.personalInfo.summary && (
        <div className="mb-8 p-6 bg-gray-50 border-l-8 border-gray-900">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-4 text-center">
            EXECUTIVE PROFILE
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify font-serif text-lg first-letter:text-4xl first-letter:font-bold first-letter:mr-2 first-letter:float-left first-letter:leading-none">
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Three Column Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Experience (Main Content) */}
        <div className="col-span-8">
          {resumeData.experiences.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-serif font-bold text-gray-900 mb-6 text-center border-b border-gray-300 pb-2">
                PROFESSIONAL CHRONICLE
              </h2>
              <div className="space-y-6">
                {resumeData.experiences.map((experience, index) => (
                  <div key={experience.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                    <div className="mb-4">
                      <div className="flex justify-between items-baseline mb-2">
                        <h3 className="text-xl font-serif font-bold text-gray-900">
                          {experience.title}
                        </h3>
                        <span className="text-sm text-gray-600 font-serif bg-gray-100 px-3 py-1 rounded">
                          {experience.startYear} – {experience.endYear}
                        </span>
                      </div>
                      <p className="text-lg font-serif font-medium text-gray-700 italic mb-1">
                        {experience.company}
                      </p>
                    </div>
                    {experience.description && (
                      <div className="text-gray-700 leading-relaxed whitespace-pre-line font-serif columns-2 gap-6 text-sm text-justify">
                        {experience.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="col-span-4 space-y-8">
          {/* Education */}
          {resumeData.education.length > 0 && (
            <div className="bg-gray-900 text-white p-6 rounded">
              <h2 className="text-lg font-serif font-bold mb-4 text-center border-b border-white pb-2">
                ACADEMIC CREDENTIALS
              </h2>
              <div className="space-y-4">
                {resumeData.education.map((education) => (
                  <div key={education.id} className="text-center">
                    <h3 className="font-serif font-bold text-sm mb-1">{education.degree}</h3>
                    <p className="font-serif text-sm opacity-90 mb-1">{education.institution}</p>
                    <span className="text-xs opacity-75 bg-white bg-opacity-20 px-2 py-1 rounded">
                      {education.graduationYear}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Skills */}
          {resumeData.skills.length > 0 && (
            <div className="border-2 border-gray-900 p-6">
              <h2 className="text-lg font-serif font-bold text-gray-900 mb-4 text-center">
                CORE COMPETENCIES
              </h2>
              <div className="space-y-4">
                {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category}>
                    <h4 className="font-serif font-bold text-gray-900 mb-2 text-sm border-b border-gray-300 pb-1">
                      {category.toUpperCase()}
                    </h4>
                    <div className="space-y-1">
                      {skills.map((skill, index) => (
                        <div key={index} className="text-xs text-gray-700 flex items-center">
                          <span className="w-1 h-1 bg-gray-900 rounded-full mr-2"></span>
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Minimalist Template - Swiss Design Inspired
  const MinimalistTemplate = () => (
    <div 
      className="bg-white rounded-lg shadow-lg resume-canvas overflow-hidden"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      {/* Ultra Clean Header */}
      <div className="px-12 pt-16 pb-8">
        <div className="border-b border-gray-200 pb-8 mb-12">
          <h1 className="text-6xl font-thin text-gray-900 mb-4 tracking-tight">
            {resumeData.personalInfo.name?.toLowerCase() || "your name"}
          </h1>
          <p className="text-2xl text-gray-400 mb-8 font-extralight tracking-wide">
            {resumeData.personalInfo.title?.toLowerCase() || "your title"}
          </p>
          
          {/* Minimal contact grid */}
          <div className="grid grid-cols-3 gap-8 text-xs text-gray-500 uppercase tracking-widest">
            <div>
              <div className="text-gray-300 mb-1">Email</div>
              <div>{resumeData.personalInfo.email || "email@domain.com"}</div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Phone</div>
              <div>{resumeData.personalInfo.phone || "+1 234 567 8900"}</div>
            </div>
            <div>
              <div className="text-gray-300 mb-1">Location</div>
              <div>{resumeData.personalInfo.location || "City, Country"}</div>
            </div>
          </div>
        </div>

        {/* Summary as a statement */}
        {resumeData.personalInfo.summary && (
          <div className="mb-16">
            <p className="text-xl text-gray-600 leading-relaxed font-extralight max-w-4xl">
              {resumeData.personalInfo.summary}
            </p>
          </div>
        )}

        {/* Grid Layout for Content */}
        <div className="grid grid-cols-12 gap-16">
          {/* Main Content - Experience */}
          <div className="col-span-8">
            {resumeData.experiences.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-12 font-light">
                  Experience
                </h2>
                <div className="space-y-12">
                  {resumeData.experiences.map((experience) => (
                    <div key={experience.id}>
                      <div className="grid grid-cols-12 gap-4 mb-4">
                        <div className="col-span-3">
                          <div className="text-xs text-gray-400 uppercase tracking-wider">
                            {experience.startYear}—{experience.endYear}
                          </div>
                        </div>
                        <div className="col-span-9">
                          <h3 className="text-lg font-light text-gray-900 mb-1">
                            {experience.title}
                          </h3>
                          <p className="text-base text-gray-600 font-extralight mb-3">
                            {experience.company}
                          </p>
                          {experience.description && (
                            <div className="text-sm text-gray-500 leading-relaxed whitespace-pre-line font-light">
                              {experience.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="col-span-4">
            {/* Skills */}
            {resumeData.skills.length > 0 && (
              <div className="mb-16">
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-8 font-light">
                  Capabilities
                </h2>
                <div className="space-y-8">
                  {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                    if (!acc[skill.category]) {
                      acc[skill.category] = [];
                    }
                    acc[skill.category].push(skill.name);
                    return acc;
                  }, {})).map(([category, skills]) => (
                    <div key={category}>
                      <h4 className="text-sm text-gray-700 font-light mb-3 lowercase">
                        {category}
                      </h4>
                      <div className="space-y-2">
                        {skills.map((skill, index) => (
                          <div key={index} className="text-xs text-gray-500 font-light">
                            {skill}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {resumeData.education.length > 0 && (
              <div>
                <h2 className="text-xs uppercase tracking-widest text-gray-400 mb-8 font-light">
                  Education
                </h2>
                <div className="space-y-6">
                  {resumeData.education.map((education) => (
                    <div key={education.id}>
                      <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        {education.graduationYear}
                      </div>
                      <h3 className="text-sm text-gray-700 font-light mb-1">{education.degree}</h3>
                      <p className="text-xs text-gray-500 font-light">{education.institution}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Tech Developer Template - Terminal/IDE Interface
  const TechDeveloperTemplate = () => (
    <div 
      className="bg-gray-900 text-green-400 rounded-lg shadow-lg overflow-hidden resume-canvas font-mono"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      {/* Terminal Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <div className="text-gray-400 text-sm">resume.dev — ~/portfolio</div>
          <div className="text-gray-500 text-xs">⌘ ⇧ P</div>
        </div>
      </div>

      <div className="p-6">
        {/* Command Line Header */}
        <div className="mb-6">
          <div className="text-blue-400 mb-2">
            <span className="text-gray-500">$</span> whoami
          </div>
          <div className="ml-4 mb-4">
            <h1 className="text-2xl font-bold text-white mb-1">
              {resumeData.personalInfo.name || "developer"}
            </h1>
            <p className="text-green-300">
              // {resumeData.personalInfo.title || "Full Stack Developer"}
            </p>
          </div>
          
          <div className="text-blue-400 mb-2">
            <span className="text-gray-500">$</span> cat contact.json
          </div>
          <div className="ml-4 bg-gray-800 p-4 rounded border border-gray-700 mb-4">
            <div className="text-yellow-400">&#123;</div>
            {resumeData.personalInfo.email && (
              <div className="ml-4">
                <span className="text-cyan-400">"email"</span>: <span className="text-green-300">"{resumeData.personalInfo.email}"</span>,
              </div>
            )}
            {resumeData.personalInfo.phone && (
              <div className="ml-4">
                <span className="text-cyan-400">"phone"</span>: <span className="text-green-300">"{resumeData.personalInfo.phone}"</span>,
              </div>
            )}
            {resumeData.personalInfo.location && (
              <div className="ml-4">
                <span className="text-cyan-400">"location"</span>: <span className="text-green-300">"{resumeData.personalInfo.location}"</span>
              </div>
            )}
            <div className="text-yellow-400">&#125;</div>
          </div>
        </div>

        {/* README Section */}
        {resumeData.personalInfo.summary && (
          <div className="mb-6">
            <div className="text-blue-400 mb-2">
              <span className="text-gray-500">$</span> cat README.md
            </div>
            <div className="ml-4 bg-gray-800 p-4 rounded border border-gray-700">
              <div className="text-white font-bold mb-2"># About Me</div>
              <p className="text-gray-300 leading-relaxed">
                {resumeData.personalInfo.summary}
              </p>
            </div>
          </div>
        )}

        {/* Work Experience as Git Log */}
        {resumeData.experiences.length > 0 && (
          <div className="mb-6">
            <div className="text-blue-400 mb-2">
              <span className="text-gray-500">$</span> git log --oneline --experience
            </div>
            <div className="ml-4 space-y-3">
              {resumeData.experiences.map((experience, index) => (
                <div key={experience.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">commit</span>
                      <span className="text-gray-400 text-sm">#{String(index + 1).padStart(3, '0')}</span>
                    </div>
                    <span className="text-gray-400 text-sm">
                      {experience.startYear}-{experience.endYear}
                    </span>
                  </div>
                  <div className="border-l-2 border-green-400 pl-4">
                    <h3 className="text-white font-bold">{experience.title}</h3>
                    <p className="text-green-300 mb-2">@ {experience.company}</p>
                    {experience.description && (
                      <div className="text-gray-300 text-sm leading-relaxed">
                        <div className="text-gray-500 mb-1">/* Achievements */</div>
                        {experience.description.split('\n').map((line, i) => (
                          <div key={i} className="mb-1">
                            <span className="text-gray-500">*</span> {line}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tech Stack as Package.json */}
        <div className="grid grid-cols-2 gap-6">
          {resumeData.skills.length > 0 && (
            <div>
              <div className="text-blue-400 mb-2">
                <span className="text-gray-500">$</span> cat package.json | grep dependencies
              </div>
              <div className="ml-4 bg-gray-800 p-4 rounded border border-gray-700">
                <div className="text-yellow-400 mb-2">"dependencies": &#123;</div>
                {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category} className="ml-4 mb-3">
                    <div className="text-cyan-400 text-sm mb-1">// {category}</div>
                    {skills.map((skill, index) => (
                      <div key={index} className="ml-2">
                        <span className="text-green-300">"{skill}"</span>: 
                        <span className="text-yellow-300"> "^{Math.floor(Math.random() * 3) + 1}.{Math.floor(Math.random() * 10)}.{Math.floor(Math.random() * 10)}"</span>
                        {index < skills.length - 1 && <span className="text-white">,</span>}
                      </div>
                    ))}
                  </div>
                ))}
                <div className="text-yellow-400">&#125;</div>
              </div>
            </div>
          )}

          {/* Education as Config Files */}
          {resumeData.education.length > 0 && (
            <div>
              <div className="text-blue-400 mb-2">
                <span className="text-gray-500">$</span> ls -la ~/education/
              </div>
              <div className="ml-4 space-y-3">
                {resumeData.education.map((education) => (
                  <div key={education.id} className="bg-gray-800 p-4 rounded border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-green-400 text-sm">📁 {education.degree.replace(/\s+/g, '_').toLowerCase()}/</div>
                      <span className="text-gray-400 text-xs">{education.graduationYear}</span>
                    </div>
                    <div className="text-gray-300 text-sm">
                      <div className="text-cyan-400">institution:</div>
                      <div className="ml-4 text-white">{education.institution}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Terminal Footer */}
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="text-green-400">
            <span className="text-gray-500">$</span> 
            <span className="animate-pulse ml-1">█</span>
          </div>
        </div>
      </div>
    </div>
  );

  // Academic Scholar Template
  const AcademicScholarTemplate = () => (
    <div 
      className="bg-white rounded-lg shadow-lg p-8 resume-canvas"
      style={{ width: "8.5in", minHeight: "11in" }}
    >
      {/* Academic Header */}
      <div className="text-center mb-8 border-b-2 border-amber-500 pb-6">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          {resumeData.personalInfo.name || "Your Name"}
        </h1>
        <p className="text-lg text-gray-700 mb-4 italic">
          {resumeData.personalInfo.title || "Your Academic Position"}
        </p>
        <div className="flex justify-center gap-6 text-sm text-gray-600">
          {resumeData.personalInfo.email && <span>✉ {resumeData.personalInfo.email}</span>}
          {resumeData.personalInfo.phone && <span>☎ {resumeData.personalInfo.phone}</span>}
          {resumeData.personalInfo.location && <span>⌂ {resumeData.personalInfo.location}</span>}
        </div>
      </div>

      {/* Research Summary */}
      {resumeData.personalInfo.summary && (
        <div className="mb-8">
          <h2 className="text-lg font-serif font-bold text-amber-700 mb-4 border-b border-amber-200 pb-2">
            Research Summary
          </h2>
          <p className="text-gray-700 leading-relaxed text-justify">
            {resumeData.personalInfo.summary}
          </p>
        </div>
      )}

      {/* Education First (Academic Priority) */}
      {resumeData.education.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-serif font-bold text-amber-700 mb-4 border-b border-amber-200 pb-2">
            Education
          </h2>
          <div className="space-y-4">
            {resumeData.education.map((education) => (
              <div key={education.id} className="bg-amber-50 p-4 rounded border-l-4 border-amber-500">
                <h3 className="font-serif font-bold text-gray-900 text-lg">{education.degree}</h3>
                <p className="text-amber-700 font-medium italic">{education.institution}</p>
                <span className="text-sm text-gray-600">{education.graduationYear}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic/Professional Experience */}
      {resumeData.experiences.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-serif font-bold text-amber-700 mb-4 border-b border-amber-200 pb-2">
            Academic & Professional Experience
          </h2>
          <div className="space-y-6">
            {resumeData.experiences.map((experience) => (
              <div key={experience.id} className="relative pl-6">
                <div 
                  className="absolute left-0 top-1 w-3 h-3 rounded-full"
                  style={{ backgroundColor: templateConfig.primaryColor }}
                ></div>
                <div className="mb-2">
                  <h3 className="font-serif font-bold text-gray-900">{experience.title}</h3>
                  <p className="text-amber-700 font-medium italic">{experience.company}</p>
                  <span className="text-sm text-gray-600">
                    {experience.startYear} – {experience.endYear}
                  </span>
                </div>
                {experience.description && (
                  <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                    {experience.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Skills & Competencies */}
      {resumeData.skills.length > 0 && (
        <div>
          <h2 className="text-lg font-serif font-bold text-amber-700 mb-4 border-b border-amber-200 pb-2">
            Research Skills & Competencies
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
              if (!acc[skill.category]) {
                acc[skill.category] = [];
              }
              acc[skill.category].push(skill.name);
              return acc;
            }, {})).map(([category, skills]) => (
              <div key={category} className="bg-amber-50 p-4 rounded">
                <h4 className="font-serif font-bold text-amber-800 mb-2">{category}</h4>
                <ul className="text-gray-700 text-sm space-y-1">
                  {skills.map((skill, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-amber-400 rounded-full mr-2"></span>
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderTemplate = () => {
    switch (templateConfig.layout) {
      case "creative":
        return <CreativeEdgeTemplate />;
      case "executive":
        return <ExecutiveClassicTemplate />;
      case "minimal":
        return <MinimalistTemplate />;
      case "tech":
        return <TechDeveloperTemplate />;
      case "academic":
        return <AcademicScholarTemplate />;
      default:
        return <ModernProfessionalTemplate />;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 p-8 overflow-auto">
      <div className="max-w-2xl mx-auto">
        {renderTemplate()}
      </div>
    </div>
  );
}
