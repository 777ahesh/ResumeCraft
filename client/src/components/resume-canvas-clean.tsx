import type { ResumeData, StyleConfig } from "@/types/resume";
import { useIsMobile } from "@/hooks/use-mobile";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  template: string;
  styleConfig?: StyleConfig;
}

export function ResumeCanvas({ resumeData, template, styleConfig }: ResumeCanvasProps) {
  const isMobile = useIsMobile();
  
  const getTemplateConfig = (templateId: string) => {
    const configs = {
      "modern-professional": {
        primaryColor: styleConfig?.primaryColor || "rgb(59, 130, 246)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(107, 114, 128)",
        accentColor: styleConfig?.primaryColor || "rgb(59, 130, 246)",
        layout: "modern"
      },
      "creative-edge": {
        primaryColor: styleConfig?.primaryColor || "rgb(16, 185, 129)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(107, 114, 128)",
        accentColor: styleConfig?.primaryColor || "rgb(16, 185, 129)",
        layout: "creative"
      },
      "executive-classic": {
        primaryColor: styleConfig?.primaryColor || "rgb(55, 65, 81)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(107, 114, 128)",
        accentColor: styleConfig?.primaryColor || "rgb(55, 65, 81)",
        layout: "executive"
      },
      "minimalist": {
        primaryColor: styleConfig?.primaryColor || "rgb(139, 92, 246)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(107, 114, 128)",
        accentColor: styleConfig?.primaryColor || "rgb(139, 92, 246)",
        layout: "minimal"
      },
      "tech-developer": {
        primaryColor: styleConfig?.primaryColor || "rgb(99, 102, 241)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(229, 231, 235)",
        accentColor: styleConfig?.primaryColor || "rgb(99, 102, 241)",
        layout: "tech"
      },
      "academic-scholar": {
        primaryColor: styleConfig?.primaryColor || "rgb(245, 158, 11)",
        secondaryColor: styleConfig?.secondaryColor || "rgb(107, 114, 128)",
        accentColor: styleConfig?.primaryColor || "rgb(245, 158, 11)",
        layout: "academic"
      },
    };
    
    return configs[templateId as keyof typeof configs] || configs["modern-professional"];
  };

  const templateConfig = getTemplateConfig(template);

  // Generate dynamic styles based on styleConfig
  const getDynamicStyles = () => {
    if (!styleConfig) return {};
    
    const spacingMap = {
      tight: '0.5rem',
      normal: '1rem',
      relaxed: '1.5rem'
    };

    return {
      fontFamily: styleConfig.fontFamily,
      fontSize: `${styleConfig.fontSize}px`,
      lineHeight: styleConfig.lineHeight,
      color: styleConfig.textColor,
      backgroundColor: styleConfig.backgroundColor,
      '--primary-color': styleConfig.primaryColor,
      '--secondary-color': styleConfig.secondaryColor,
      '--text-color': styleConfig.textColor,
      '--bg-color': styleConfig.backgroundColor,
      '--border-radius': `${styleConfig.borderRadius}px`,
      '--spacing': spacingMap[styleConfig.spacing],
    } as React.CSSProperties;
  };

  const dynamicStyles = getDynamicStyles();

  // Modern Professional Template - Two Column Layout with Left Sidebar
  const ModernProfessionalTemplate = () => (
    <div 
      className="bg-white rounded-lg shadow-lg overflow-hidden resume-canvas"
      style={{ 
        width: "8.5in", 
        minHeight: "11in",
        ...dynamicStyles,
        borderRadius: styleConfig?.borderRadius ? `${styleConfig.borderRadius}px` : '8px'
      }}
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
                    <div className="font-semibold">{education.degree}</div>
                    <div className="opacity-90">{education.institution}</div>
                    <div className="text-xs opacity-75">{education.graduationYear}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 
              className="text-4xl font-bold mb-2"
              style={{ 
                color: styleConfig?.textColor || '#1F2937',
                fontFamily: styleConfig?.fontFamily || 'Inter',
                fontWeight: styleConfig?.headerStyle === 'bold' ? 'bold' : 'normal',
                fontStyle: styleConfig?.headerStyle === 'italic' ? 'italic' : 'normal'
              }}
            >
              {resumeData.personalInfo.name || "Your Name"}
            </h1>
            <p 
              className="text-xl mb-4"
              style={{ 
                color: styleConfig?.secondaryColor || '#6B7280',
                fontFamily: styleConfig?.fontFamily || 'Inter'
              }}
            >
              {resumeData.personalInfo.title || "Your Professional Title"}
            </p>
            
            {/* Professional Summary */}
            {resumeData.personalInfo.summary && (
              <div className="mt-6">
                <h2 
                  className="text-lg font-semibold mb-3 flex items-center"
                  style={{ 
                    color: styleConfig?.textColor || '#1F2937',
                    fontFamily: styleConfig?.fontFamily || 'Inter'
                  }}
                >
                  <span 
                    className="w-4 h-4 mr-3"
                    style={{ 
                      backgroundColor: templateConfig.primaryColor,
                      borderRadius: `${styleConfig?.borderRadius || 4}px`
                    }}
                  ></span>
                  About Me
                </h2>
                <p 
                  className="leading-relaxed"
                  style={{ 
                    color: styleConfig?.textColor || '#374151',
                    fontFamily: styleConfig?.fontFamily || 'Inter',
                    lineHeight: styleConfig?.lineHeight || 1.6
                  }}
                >
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
                            <h3 
                              className="font-bold text-lg mb-1"
                              style={{ 
                                color: styleConfig?.textColor || '#1F2937',
                                fontFamily: styleConfig?.fontFamily || 'Inter'
                              }}
                            >
                              {experience.title}
                            </h3>
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
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-line"
                            style={{ 
                              color: styleConfig?.textColor || '#374151',
                              fontFamily: styleConfig?.fontFamily || 'Inter',
                              lineHeight: styleConfig?.lineHeight || 1.6
                            }}
                          >
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

          {/* Custom Sections */}
          {(resumeData.customSections || []).filter(section => section.isVisible && section.items.length > 0).map((section) => (
            <div key={section.id} className="mb-8">
              <h2 
                className="text-lg font-semibold mb-3 flex items-center"
                style={{ 
                  color: styleConfig?.textColor || '#1F2937',
                  fontFamily: styleConfig?.fontFamily || 'Inter'
                }}
              >
                <span 
                  className="w-4 h-4 mr-3"
                  style={{ 
                    backgroundColor: templateConfig.primaryColor,
                    borderRadius: `${styleConfig?.borderRadius || 4}px`
                  }}
                ></span>
                {section.name}
              </h2>
              <div className="relative">
                {section.items.map((item, index) => (
                  <div key={item.id} className="relative">
                    {index !== section.items.length - 1 && (
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
                            <h3 
                              className="font-bold text-lg mb-1"
                              style={{ 
                                color: styleConfig?.textColor || '#1F2937',
                                fontFamily: styleConfig?.fontFamily || 'Inter'
                              }}
                            >
                              {item.title}
                            </h3>
                            {item.subtitle && (
                              <p 
                                className="font-semibold"
                                style={{ color: templateConfig.primaryColor }}
                              >
                                {item.subtitle}
                              </p>
                            )}
                            {item.location && (
                              <p className="text-sm text-gray-600">{item.location}</p>
                            )}
                          </div>
                          {item.date && (
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-600">
                              {item.date}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <div 
                            className="text-sm leading-relaxed whitespace-pre-line"
                            style={{ 
                              color: styleConfig?.textColor || '#374151',
                              fontFamily: styleConfig?.fontFamily || 'Inter',
                              lineHeight: styleConfig?.lineHeight || 1.6
                            }}
                          >
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
            <p className="text-xl opacity-90">
              {resumeData.personalInfo.title || "Your Creative Title"}
            </p>
          </div>
        </div>
        
        {/* Contact Cards */}
        <div className="flex gap-4 px-8 -mt-8 relative z-10">
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
                  <div className="w-2/3">
                    <div className="bg-white rounded-2xl shadow-md p-6 relative">
                      <div 
                        className={`absolute top-6 w-4 h-4 rotate-45 bg-white ${
                          index % 2 === 0 ? '-right-2' : '-left-2'
                        }`}
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
              <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">Creative Skills</h2>
              <div className="space-y-4">
                {Object.entries(resumeData.skills.reduce((acc: { [key: string]: string[] }, skill) => {
                  if (!acc[skill.category]) {
                    acc[skill.category] = [];
                  }
                  acc[skill.category].push(skill.name);
                  return acc;
                }, {})).map(([category, skills]) => (
                  <div key={category} className="bg-white rounded-xl shadow-md p-4">
                    <h3 className="font-semibold text-gray-900 mb-3">{category}</h3>
                    <div className="flex flex-wrap gap-2">
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

        {/* Custom Sections */}
        {(resumeData.customSections || []).filter(section => section.isVisible && section.items.length > 0).map((section) => (
          <div key={section.id} className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
              {section.name}
            </h2>
            <div className="space-y-6">
              {section.items.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`flex ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
                >
                  <div className="w-2/3">
                    <div className="bg-white rounded-2xl shadow-md p-6 relative">
                      <div 
                        className={`absolute top-6 w-4 h-4 rotate-45 bg-white ${
                          index % 2 === 0 ? '-right-2' : '-left-2'
                        }`}
                      ></div>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{item.title}</h3>
                          {item.subtitle && (
                            <p className="font-semibold" style={{ color: templateConfig.primaryColor }}>
                              {item.subtitle}
                            </p>
                          )}
                          {item.location && (
                            <p className="text-sm text-gray-600">{item.location}</p>
                          )}
                        </div>
                        {item.date && (
                          <span 
                            className="px-3 py-1 rounded-full text-xs font-medium text-white"
                            style={{ backgroundColor: templateConfig.primaryColor }}
                          >
                            {item.date}
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
                          {item.description}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
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

  // Add placeholder templates for now
  const ExecutiveClassicTemplate = () => <div>Executive Template (Coming Soon)</div>;
  const MinimalistTemplate = () => <div>Minimalist Template (Coming Soon)</div>;
  const TechDeveloperTemplate = () => <div>Tech Developer Template (Coming Soon)</div>;
  const AcademicScholarTemplate = () => <div>Academic Scholar Template (Coming Soon)</div>;

  return (
    <div className="flex-1 bg-gray-100 p-2 sm:p-4 lg:p-8 overflow-auto">
      <div className={`mx-auto ${isMobile ? 'max-w-sm' : 'max-w-2xl'}`}>
        <div className={`${isMobile ? 'transform scale-75 origin-top' : ''}`}>
          {renderTemplate()}
        </div>
      </div>
    </div>
  );
}
