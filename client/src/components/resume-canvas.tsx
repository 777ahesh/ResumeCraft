import type { ResumeData, StyleConfig, FieldStyle } from "@/types/resume";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect } from "react";
import DraggableResizable from "./ui/draggable-resizable";
import { ContextMenu, ContextMenuContent, ContextMenuItem } from "./ui/context-menu";

interface ResumeCanvasProps {
  resumeData: ResumeData;
  template: string;
  styleConfig?: StyleConfig;
  isInteractiveMode?: boolean;
  onResumeDataChange?: (data: ResumeData) => void;
  selectedField?: string | null;
  onFieldSelect?: (fieldId: string, fieldType: string) => void;
  onStylePanelOpen?: () => void;
  fieldStyles?: Record<string, FieldStyle>;
}

// EditableText Component for inline editing with field selection
interface EditableTextProps {
  value: string | undefined;
  onSave: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  fieldId: string;
  fieldType: string;
  fieldStyle?: FieldStyle;
  isSelected?: boolean;
  onFieldSelect?: (fieldId: string, fieldType: string) => void;
  onStylePanelOpen?: () => void;
}

const EditableText = ({ 
  value, 
  onSave, 
  placeholder, 
  multiline = false, 
  className = "",
  fieldId,
  fieldType,
  fieldStyle,
  isSelected = false,
  onFieldSelect,
  onStylePanelOpen
}: EditableTextProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      // Select this field and potentially open style panel
      onFieldSelect?.(fieldId, fieldType);
      onStylePanelOpen?.();
    }
    setIsEditing(true);
    setEditValue(value || "");
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || "");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && e.ctrlKey && multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  // Apply field-specific styles
  const fieldStyles: React.CSSProperties = {
    fontSize: fieldStyle?.fontSize,
    fontFamily: fieldStyle?.fontFamily,
    color: fieldStyle?.color,
    fontWeight: fieldStyle?.fontWeight,
    fontStyle: fieldStyle?.fontStyle,
    textAlign: fieldStyle?.textAlign as any,
    lineHeight: fieldStyle?.lineHeight,
  };

  if (isEditing) {
    return multiline ? (
      <textarea
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-blue-50 border border-blue-300 rounded px-2 py-1 w-full resize-none ${className}`}
        style={fieldStyles}
        autoFocus
        rows={3}
        placeholder={placeholder}
      />
    ) : (
      <input
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        className={`bg-blue-50 border border-blue-300 rounded px-2 py-1 w-full ${className}`}
        style={fieldStyles}
        autoFocus
        placeholder={placeholder}
      />
    );
  }

  return (
    <span
      onClick={handleClick}
      className={`cursor-pointer transition-all ${className} ${
        isSelected 
          ? 'bg-blue-100 outline-2 outline-blue-500 outline-dashed' 
          : 'hover:bg-blue-50 hover:outline-2 hover:outline-blue-300 hover:outline-dashed'
      } rounded px-1 py-0.5`}
      style={fieldStyles}
      title="Click to edit or style"
    >
      {value || placeholder || "Click to edit"}
    </span>
  );
};

export function ResumeCanvas({ 
  resumeData, 
  template, 
  styleConfig, 
  isInteractiveMode = false, 
  onResumeDataChange,
  selectedField,
  onFieldSelect,
  onStylePanelOpen,
  fieldStyles = {}
}: ResumeCanvasProps) {
  const isMobile = useIsMobile();

  // DEBUG: log incoming styleConfig to verify editor changes propagate
  console.log('ResumeCanvas render - styleConfig:', styleConfig);

  // Canvas elements state (text, shape, textarea, etc.)
  const [canvasElements, setCanvasElements] = useState<any[]>([]);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  // Reset canvas elements and context menu when leaving interactive mode
  useEffect(() => {
    if (!isInteractiveMode) {
      setCanvasElements([]);
      setContextMenu({ x: 0, y: 0, visible: false });
    }
  }, [isInteractiveMode]);

  // Add new element to canvas
  const addElement = (type: string, position: { x: number; y: number }) => {
    const newElement = {
      id: Date.now().toString(),
      type,
      x: position.x,
      y: position.y,
      width: 120,
      height: 40,
      content: type === "text" ? "New Text" : type === "textarea" ? "New Textarea" : "",
      color: "#222",
      background: type === "shape" ? "#e0e0e0" : "transparent",
      shape: type === "shape" ? "rect" : undefined,
    };
    setCanvasElements([...canvasElements, newElement]);
    setContextMenu({ ...contextMenu, visible: false });
  };

  // Handle right-click on canvas
  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Get canvas bounding rect to keep menu within bounds
    const canvasRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    let x = e.clientX - canvasRect.left;
    let y = e.clientY - canvasRect.top;
    // Clamp menu position to canvas bounds (assume menu is 120x100px)
    x = Math.max(0, Math.min(x, canvasRect.width - 120));
    y = Math.max(0, Math.min(y, canvasRect.height - 100));
    setContextMenu({ x, y, visible: true });
  };

  // Move element handler
  const handleElementMove = (id: string, x: number, y: number) => {
    setCanvasElements((elements: any[]) => elements.map((el: any) => el.id === id ? { ...el, x, y } : el));
  };

  // Resize element handler
  const handleElementResize = (id: string, width: number, height: number) => {
    setCanvasElements((elements: any[]) => elements.map((el: any) => el.id === id ? { ...el, width, height } : el));
  };

  // Edit element content
  const handleElementEdit = (id: string, content: string) => {
    setCanvasElements((elements: any[]) => elements.map((el: any) => el.id === id ? { ...el, content } : el));
  };

  // Template wrapper component for consistent responsive behavior
  const TemplateWrapper = ({ children }: { children: React.ReactNode }) => (
    <div 
      className={`bg-white ${isMobile ? 'rounded-none shadow-none w-full' : 'rounded-lg shadow-lg'} resume-canvas overflow-hidden`}
      style={{ 
        width: isMobile ? "100%" : "8.5in", 
        minHeight: isMobile ? "auto" : "11in"
      }}
    >
      {children}
    </div>
  );

  // Generate dynamic styles from styleConfig so editor changes apply immediately
  const getDynamicStyles = (): React.CSSProperties => {
    if (!styleConfig) return {};
    const spacingMap: Record<string, string> = {
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
      // expose as CSS variables for easier usage in child elements
      ['--primary-color' as any]: styleConfig.primaryColor,
      ['--secondary-color' as any]: styleConfig.secondaryColor,
      ['--text-color' as any]: styleConfig.textColor,
      ['--bg-color' as any]: styleConfig.backgroundColor,
      ['--border-radius' as any]: `${styleConfig.borderRadius}px`,
      ['--spacing' as any]: spacingMap[styleConfig.spacing],
    } as React.CSSProperties;
  };

  const dynamicStyles = getDynamicStyles();

  // update TemplateWrapper to include dynamic styles
  const StyledTemplateWrapper = ({ children }: { children: React.ReactNode }) => (
    <div 
      className={`bg-white ${isMobile ? 'rounded-none shadow-none w-full' : 'rounded-lg shadow-lg'} resume-canvas overflow-hidden`}
      style={{ 
        width: '100%',
        maxWidth: isMobile ? '100%' : '8.5in',
        boxSizing: 'border-box',
        minHeight: isMobile ? 'auto' : '11in',
        margin: '0 auto',
        ...dynamicStyles
      }}
    >
      {children}
    </div>
  );

  // Executive Classic Template with responsive design and inline editing
  const ExecutiveClassicTemplate = () => {
    // Use the FieldStyle type so props passed to EditableText match types
    const baseTextStyle: FieldStyle = {
      color: styleConfig?.textColor || '#1F2937',
      fontFamily: styleConfig?.fontFamily || 'Inter',
      fontSize: styleConfig?.fontSize,
      lineHeight: styleConfig?.lineHeight
    };

    // Helper to merge global baseTextStyle, per-field overrides from editor, and ad-hoc overrides
    const resolveFieldStyle = (fieldId: string, overrides: Partial<FieldStyle> = {}): FieldStyle => {
      const perField = fieldStyles?.[fieldId] || {};
      const merged: FieldStyle = { ...baseTextStyle, ...perField, ...overrides };
      // Make small mobile adjustments to prevent overflow and large fonts
      if (isMobile && merged.fontSize) {
        merged.fontSize = Math.max(10, Math.round((merged.fontSize as number) * 0.95));
      }
      return merged;
    };

    const accentColor = styleConfig?.primaryColor || '#374151';

    return (
      <StyledTemplateWrapper>
        <div className={`${isMobile ? 'p-4 text-sm' : 'p-8 text-base'}`}>
          {/* Executive Header with Letterhead Style */}
          <div className={`border-b-2`} style={{ borderColor: accentColor, paddingBottom: isMobile ? 16 : 24, marginBottom: isMobile ? 16 : 32 }}>
            <div className="text-center">
              <h1 style={{ marginBottom: isMobile ? 8 : 12 }}>
                <EditableText
                  value={resumeData.personalInfo.name?.toUpperCase()}
                  onSave={(value) => onResumeDataChange?.({ 
                    ...resumeData, 
                    personalInfo: { ...resumeData.personalInfo, name: value } 
                  })}
                  className="inline-block"
                  placeholder="YOUR NAME"
                  fieldId="personal-name"
                  fieldType="header"
                  fieldStyle={resolveFieldStyle('personal-name', { fontSize: (styleConfig?.fontSize ? styleConfig.fontSize * 2.5 : 40) })}
                  isSelected={selectedField === "personal-name"}
                  onFieldSelect={onFieldSelect}
                  onStylePanelOpen={onStylePanelOpen}
                />
              </h1>

              <div style={{ width: isMobile ? 64 : 96, height: isMobile ? 2 : 4, background: accentColor, margin: '8px auto 12px' }}></div>

              <p style={{ marginBottom: isMobile ? 8 : 16 }}>
                <EditableText
                  value={resumeData.personalInfo.title}
                  onSave={(value) => onResumeDataChange?.({ 
                    ...resumeData, 
                    personalInfo: { ...resumeData.personalInfo, title: value } 
                  })}
                  className="inline-block"
                  placeholder="Executive Professional"
                  fieldId="personal-title"
                  fieldType="subtitle"
                  fieldStyle={resolveFieldStyle('personal-title', { color: styleConfig?.secondaryColor || '#6B7280', fontSize: (styleConfig?.fontSize ? styleConfig.fontSize * 1.2 : 18) })}
                  isSelected={selectedField === "personal-title"}
                  onFieldSelect={onFieldSelect}
                  onStylePanelOpen={onStylePanelOpen}
                />
              </p>

              {/* Contact info */}
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-center items-center gap-8'}`} style={{ color: styleConfig?.secondaryColor || '#6B7280', fontFamily: styleConfig?.fontFamily || 'Inter' }}>
                {resumeData.personalInfo.email && (
                  <span className="flex items-center justify-center">
                    <span style={{ width: isMobile ? 4 : 8, height: isMobile ? 4 : 8, background: accentColor, borderRadius: '50%', marginRight: 8 }}></span>
                    <EditableText
                      value={resumeData.personalInfo.email}
                      onSave={(value) => onResumeDataChange?.({ 
                        ...resumeData, 
                        personalInfo: { ...resumeData.personalInfo, email: value } 
                      })}
                      placeholder="email@example.com"
                      fieldId="personal-email"
                      fieldType="contact"
                      fieldStyle={resolveFieldStyle('personal-email', { fontSize: styleConfig?.fontSize, color: styleConfig?.textColor })}
                      isSelected={selectedField === "personal-email"}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </span>
                )}

                {resumeData.personalInfo.phone && (
                  <span className="flex items-center justify-center">
                    <span style={{ width: isMobile ? 4 : 8, height: isMobile ? 4 : 8, background: accentColor, borderRadius: '50%', marginRight: 8 }}></span>
                    <EditableText
                      value={resumeData.personalInfo.phone}
                      onSave={(value) => onResumeDataChange?.({ 
                        ...resumeData, 
                        personalInfo: { ...resumeData.personalInfo, phone: value } 
                      })}
                      placeholder="(555) 123-4567"
                      fieldId="personal-phone"
                      fieldType="contact"
                      fieldStyle={resolveFieldStyle('personal-phone', { fontSize: styleConfig?.fontSize, color: styleConfig?.textColor })}
                      isSelected={selectedField === "personal-phone"}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </span>
                )}

                {resumeData.personalInfo.location && (
                  <span className="flex items-center justify-center">
                    <span style={{ width: isMobile ? 4 : 8, height: isMobile ? 4 : 8, background: accentColor, borderRadius: '50%', marginRight: 8 }}></span>
                    <EditableText
                      value={resumeData.personalInfo.location}
                      onSave={(value) => onResumeDataChange?.({ 
                        ...resumeData, 
                        personalInfo: { ...resumeData.personalInfo, location: value } 
                      })}
                      placeholder="City, State"
                      fieldId="personal-location"
                      fieldType="contact"
                      fieldStyle={resolveFieldStyle('personal-location', { fontSize: styleConfig?.fontSize, color: styleConfig?.textColor })}
                      isSelected={selectedField === "personal-location"}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          {resumeData.personalInfo.summary && (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
              <h2 style={{ borderBottom: `1px solid ${accentColor}`, paddingBottom: 8, marginBottom: 8 }}>
                <EditableText
                  value={"EXECUTIVE SUMMARY"}
                  onSave={() => { /* title static */ }}
                  className="inline-block"
                  placeholder="EXECUTIVE SUMMARY"
                  fieldId="section-summary-title"
                  fieldType="section"
                  fieldStyle={resolveFieldStyle('section-summary-title', { fontWeight: 'bold' })}
                />
              </h2>
              <div style={{ color: styleConfig?.textColor, fontFamily: styleConfig?.fontFamily }}>
                <EditableText
                  value={resumeData.personalInfo.summary}
                  onSave={(value) => onResumeDataChange?.({ 
                    ...resumeData, 
                    personalInfo: { ...resumeData.personalInfo, summary: value } 
                  })}
                  multiline
                  placeholder="Seasoned executive..."
                  fieldId="personal-summary"
                  fieldType="paragraph"
                  fieldStyle={resolveFieldStyle('personal-summary', { fontSize: styleConfig?.fontSize, lineHeight: styleConfig?.lineHeight })}
                  isSelected={selectedField === "personal-summary"}
                  onFieldSelect={onFieldSelect}
                  onStylePanelOpen={onStylePanelOpen}
                />
              </div>
            </div>
          )}

          {/* Experience */}
          {resumeData.experiences && resumeData.experiences.length > 0 && (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
              <h2 style={{ borderBottom: `1px solid ${accentColor}`, paddingBottom: 8, marginBottom: 12 }}>
                <EditableText
                  value={"PROFESSIONAL EXPERIENCE"}
                  onSave={() => { /* title static */ }}
                  fieldId="section-experience-title"
                  fieldType="section"
                  fieldStyle={resolveFieldStyle('section-experience-title', { fontWeight: 'bold' })}
                />
              </h2>
              {resumeData.experiences.map((exp, index) => (
                <div key={exp.id} style={{ marginBottom: isMobile ? 12 : 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <h3 style={{ margin: 0 }}>
                        <EditableText
                          value={exp.title}
                          onSave={(value) => {
                            const updatedExperiences = [...resumeData.experiences];
                            updatedExperiences[index] = { ...exp, title: value };
                            onResumeDataChange?.({ 
                              ...resumeData, 
                              experiences: updatedExperiences 
                            });
                          }}
                          placeholder="Position Title"
                          fieldId={`experience-title-${index}`}
                          fieldType="heading"
                          fieldStyle={resolveFieldStyle(`experience-title-${index}`, { fontWeight: '600' })}
                          isSelected={selectedField === `experience-title-${index}`}
                          onFieldSelect={onFieldSelect}
                          onStylePanelOpen={onStylePanelOpen}
                        />
                      </h3>
                      <p style={{ margin: '4px 0 0', color: styleConfig?.secondaryColor }}>
                        <EditableText
                          value={exp.company}
                          onSave={(value) => {
                            const updatedExperiences = [...resumeData.experiences];
                            updatedExperiences[index] = { ...exp, company: value };
                            onResumeDataChange?.({ 
                              ...resumeData, 
                              experiences: updatedExperiences 
                            });
                          }}
                          placeholder="Company Name"
                          fieldId={`experience-company-${index}`}
                          fieldType="subheading"
                          fieldStyle={resolveFieldStyle(`experience-company-${index}`, { color: styleConfig?.primaryColor })}
                          isSelected={selectedField === `experience-company-${index}`}
                          onFieldSelect={onFieldSelect}
                          onStylePanelOpen={onStylePanelOpen}
                        />
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', color: styleConfig?.secondaryColor }}>
                      <EditableText
                        value={`${exp.startYear} - ${exp.endYear}`}
                        onSave={(value) => {
                          const [start, end] = value.split(' - ');
                          const updatedExperiences = [...resumeData.experiences];
                          updatedExperiences[index] = { ...exp, startYear: start || '', endYear: end || '' };
                          onResumeDataChange?.({ 
                            ...resumeData, 
                            experiences: updatedExperiences 
                          });
                        }}
                        placeholder="Jan 2020 - Present"
                        fieldId={`experience-dates-${index}`}
                        fieldType="text"
                        fieldStyle={resolveFieldStyle(`experience-dates-${index}`, { color: styleConfig?.secondaryColor })}
                        isSelected={selectedField === `experience-dates-${index}`}
                        onFieldSelect={onFieldSelect}
                        onStylePanelOpen={onStylePanelOpen}
                      />
                    </div>
                  </div>

                  <div style={{ color: styleConfig?.textColor, fontFamily: styleConfig?.fontFamily }}>
                    <EditableText
                      value={exp.description}
                      onSave={(value) => {
                        const updatedExperiences = [...resumeData.experiences];
                        updatedExperiences[index] = { ...exp, description: value };
                        onResumeDataChange?.({ 
                          ...resumeData, 
                          experiences: updatedExperiences 
                        });
                      }}
                      multiline
                      placeholder="• Led strategic initiatives..."
                      fieldId={`experience-description-${index}`}
                      fieldType="paragraph"
                      fieldStyle={resolveFieldStyle(`experience-description-${index}`, { fontSize: styleConfig?.fontSize })}
                      isSelected={selectedField === `experience-description-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {resumeData.education && resumeData.education.length > 0 && (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
              <h2 style={{ borderBottom: `1px solid ${accentColor}`, paddingBottom: 8, marginBottom: 12 }}>
                <EditableText
                  value={"EDUCATION"}
                  onSave={() => {}}
                  fieldId="section-education-title"
                  fieldType="section"
                  fieldStyle={resolveFieldStyle('section-education-title', { fontWeight: 'bold' })}
                />
              </h2>
              {resumeData.education.map((edu, index) => (
                <div key={edu.id} style={{ marginBottom: isMobile ? 12 : 16 }}>
                  <h3 style={{ margin: 0 }}>
                    <EditableText
                      value={edu.degree}
                      onSave={(value) => {
                        const updatedEducation = [...resumeData.education];
                        updatedEducation[index] = { ...edu, degree: value };
                        onResumeDataChange?.({ 
                          ...resumeData, 
                          education: updatedEducation 
                        });
                      }}
                      placeholder="Master of Business Administration"
                      fieldId={`education-degree-${index}`}
                      fieldType="heading"
                      fieldStyle={resolveFieldStyle(`education-degree-${index}`, { fontWeight: '600' })}
                      isSelected={selectedField === `education-degree-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </h3>
                  <p style={{ margin: '4px 0 0', color: styleConfig?.secondaryColor }}>
                    <EditableText
                      value={edu.institution}
                      onSave={(value) => {
                        const updatedEducation = [...resumeData.education];
                        updatedEducation[index] = { ...edu, institution: value };
                        onResumeDataChange?.({ 
                          ...resumeData, 
                          education: updatedEducation 
                        });
                      }}
                      placeholder="Harvard Business School"
                      fieldId={`education-institution-${index}`}
                      fieldType="subheading"
                      fieldStyle={resolveFieldStyle(`education-institution-${index}`, { color: styleConfig?.primaryColor })}
                      isSelected={selectedField === `education-institution-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </p>
                  <div style={{ color: styleConfig?.textColor }}>
                    <EditableText
                      value={edu.graduationYear}
                      onSave={(value) => {
                        const updatedEducation = [...resumeData.education];
                        updatedEducation[index] = { ...edu, graduationYear: value };
                        onResumeDataChange?.({ 
                          ...resumeData, 
                          education: updatedEducation 
                        });
                      }}
                      placeholder="2018"
                      fieldId={`education-year-${index}`}
                      fieldType="text"
                      fieldStyle={resolveFieldStyle(`education-year-${index}`, { color: styleConfig?.secondaryColor })}
                      isSelected={selectedField === `education-year-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Skills */}
          {resumeData.skills && resumeData.skills.length > 0 && (
            <div style={{ marginBottom: isMobile ? 16 : 24 }}>
              <h2 style={{ borderBottom: `1px solid ${accentColor}`, paddingBottom: 8, marginBottom: 12 }}>
                <EditableText
                    value={"CORE COMPETENCIES"}
                    onSave={() => {}}
                    fieldId="section-skills-title"
                    fieldType="section"
                    fieldStyle={resolveFieldStyle('section-skills-title', { fontWeight: 'bold' })}
                />
              </h2>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {resumeData.skills.map((skill, index) => (
                  <div key={skill.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, background: `${accentColor}88`, borderRadius: 999 }}></div>
                    <EditableText
                      value={skill.name}
                      onSave={(value) => {
                        const updatedSkills = [...resumeData.skills];
                        updatedSkills[index] = { ...skill, name: value };
                        onResumeDataChange?.({ 
                          ...resumeData, 
                          skills: updatedSkills 
                        });
                      }}
                      placeholder="Strategic Planning"
                      fieldId={`skill-${index}`}
                      fieldType="text"
                      fieldStyle={resolveFieldStyle(`skill-${index}`, { fontSize: styleConfig?.fontSize })}
                      isSelected={selectedField === `skill-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </StyledTemplateWrapper>
    );
  };

  // Template selector - simplified: always render the single editable ExecutiveClassic template
  const renderTemplate = () => <ExecutiveClassicTemplate />;

  return (
    <div className="flex-1 bg-gray-100" style={{ overflowX: 'hidden' }}>
      {/* Debug badge to visualize the active style config on the canvas */}
      {/* <div style={{ position: 'absolute', right: 16, top: 80, zIndex: 60, }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#fff', borderRadius: 8, boxShadow: '0 2px 6px rgba(0,0,0,0.12)', fontSize: 12 }}>
          <div style={{ width: 14, height: 14, borderRadius: 3, background: styleConfig?.primaryColor || '#ccc', border: '1px solid #eee' }} />
          <div style={{ color: '#111' }}>{styleConfig?.primaryColor || 'no-primary'}</div>
          <div style={{ color: '#666' }}>{styleConfig?.fontFamily || 'no-font'}</div>
        </div>
      </div> */}

      <div className={`${isMobile ? 'p-2' : 'p-4 lg:p-8'} min-h-full`}>
        <div className="flex justify-center">
          <div className={`w-full ${isMobile ? 'max-w-full' : 'max-w-4xl'} relative`} style={{ minHeight: '600px' }}
            onContextMenu={isInteractiveMode ? handleCanvasContextMenu : undefined}>
            {isInteractiveMode ? (
              <>
                {/* Render draggable/resizable elements */}
                {canvasElements.map(el => (
                  <DraggableResizable
                    key={el.id}
                    x={el.x}
                    y={el.y}
                    width={el.width}
                    height={el.height}
                    onMove={(x, y) => handleElementMove(el.id, x, y)}
                    onResize={(w, h) => handleElementResize(el.id, w, h)}
                  >
                    {el.type === "text" && (
                      <input
                        type="text"
                        value={el.content}
                        onChange={e => handleElementEdit(el.id, e.target.value)}
                        style={{ width: "100%", height: "100%", color: el.color, background: "transparent", border: "none" }}
                      />
                    )}
                    {el.type === "textarea" && (
                      <textarea
                        value={el.content}
                        onChange={e => handleElementEdit(el.id, e.target.value)}
                        style={{ width: "100%", height: "100%", color: el.color, background: "transparent", border: "none" }}
                      />
                    )}
                    {el.type === "shape" && (
                      <div style={{ width: "100%", height: "100%", background: el.background, border: "1px solid #888" }} />
                    )}
                  </DraggableResizable>
                ))}
                {/* Context menu for adding elements */}
                {contextMenu.visible && (
                  <div
                    style={{
                      position: 'absolute',
                      left: contextMenu.x,
                      top: contextMenu.y,
                      zIndex: 1000,
                      background: 'white',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                      minWidth: 120,
                      padding: '8px',
                    }}
                    onContextMenu={e => e.preventDefault()}
                  >
                    <button style={{ display: 'block', width: '100%', marginBottom: 4 }} onClick={() => addElement("text", { x: contextMenu.x, y: contextMenu.y })}>Add Text</button>
                    <button style={{ display: 'block', width: '100%', marginBottom: 4 }} onClick={() => addElement("textarea", { x: contextMenu.x, y: contextMenu.y })}>Add Textarea</button>
                    <button style={{ display: 'block', width: '100%' }} onClick={() => addElement("shape", { x: contextMenu.x, y: contextMenu.y })}>Add Shape</button>
                    <button style={{ display: 'block', width: '100%', marginTop: 8, color: '#888' }} onClick={() => setContextMenu({ ...contextMenu, visible: false })}>Close</button>
                  </div>
                )}
              </>
            ) : null}
            {renderTemplate()}
           </div>
         </div>
       </div>
     </div>
   );
 }