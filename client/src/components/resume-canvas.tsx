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

  // Executive Classic Template with responsive design and inline editing
  const ExecutiveClassicTemplate = () => (
    <TemplateWrapper>
      <div className={`${isMobile ? 'p-4 text-sm' : 'p-8 text-base'}`}>
        {/* Executive Header with Letterhead Style */}
        <div className={`border-b-2 border-gray-900 ${isMobile ? 'pb-4 mb-6' : 'pb-6 mb-8'}`}>
          <div className="text-center">
            <h1 className={`${isMobile ? 'text-2xl' : 'text-5xl'} font-serif font-bold text-gray-900 ${isMobile ? 'mb-2' : 'mb-3'} tracking-wider`}>
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
                isSelected={selectedField === "personal-name"}
                onFieldSelect={onFieldSelect}
                onStylePanelOpen={onStylePanelOpen}
              />
            </h1>
            <div className={`${isMobile ? 'w-16 h-0.5' : 'w-24 h-1'} bg-gray-900 mx-auto ${isMobile ? 'mb-2' : 'mb-4'}`}></div>
            <p className={`${isMobile ? 'text-base' : 'text-lg'} text-gray-700 ${isMobile ? 'mb-2' : 'mb-4'} font-serif italic`}>
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
                fieldStyle={fieldStyles["personal-title"]}
                isSelected={selectedField === "personal-title"}
                onFieldSelect={onFieldSelect}
                onStylePanelOpen={onStylePanelOpen}
              />
            </p>
            
            {/* Contact info in newspaper style */}
            <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-center items-center gap-8'} ${isMobile ? 'text-xs' : 'text-sm'} text-gray-600 font-serif`}>
              {resumeData.personalInfo.email && (
                <span className="flex items-center justify-center">
                  <span className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-gray-900 rounded-full mr-2`}></span>
                  <EditableText
                    value={resumeData.personalInfo.email}
                    onSave={(value) => onResumeDataChange?.({ 
                      ...resumeData, 
                      personalInfo: { ...resumeData.personalInfo, email: value } 
                    })}
                    placeholder="email@example.com"
                    fieldId="personal-email"
                    fieldType="contact"
                    fieldStyle={fieldStyles["personal-email"]}
                    isSelected={selectedField === "personal-email"}
                    onFieldSelect={onFieldSelect}
                    onStylePanelOpen={onStylePanelOpen}
                  />
                </span>
              )}
              {resumeData.personalInfo.phone && (
                <span className="flex items-center justify-center">
                  <span className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-gray-900 rounded-full mr-2`}></span>
                  <EditableText
                    value={resumeData.personalInfo.phone}
                    onSave={(value) => onResumeDataChange?.({ 
                      ...resumeData, 
                      personalInfo: { ...resumeData.personalInfo, phone: value } 
                    })}
                    placeholder="(555) 123-4567"
                    fieldId="personal-phone"
                    fieldType="contact"
                    isSelected={selectedField === "personal-phone"}
                    onFieldSelect={onFieldSelect}
                    onStylePanelOpen={onStylePanelOpen}
                  />
                </span>
              )}
              {resumeData.personalInfo.location && (
                <span className="flex items-center justify-center">
                  <span className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-gray-900 rounded-full mr-2`}></span>
                  <EditableText
                    value={resumeData.personalInfo.location}
                    onSave={(value) => onResumeDataChange?.({ 
                      ...resumeData, 
                      personalInfo: { ...resumeData.personalInfo, location: value } 
                    })}
                    placeholder="City, State"
                    fieldId="personal-location"
                    fieldType="contact"
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
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-serif font-bold text-gray-900 ${isMobile ? 'mb-3' : 'mb-4'} border-b border-gray-300 pb-2`}>
              EXECUTIVE SUMMARY
            </h2>
            <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-serif leading-relaxed`}>
              <EditableText
                value={resumeData.personalInfo.summary}
                onSave={(value) => onResumeDataChange?.({ 
                  ...resumeData, 
                  personalInfo: { ...resumeData.personalInfo, summary: value } 
                })}
                multiline
                placeholder="Seasoned executive with expertise in strategic leadership, operational excellence, and driving organizational growth."
                fieldId="personal-summary"
                fieldType="paragraph"
                fieldStyle={fieldStyles["personal-summary"]}
                isSelected={selectedField === "personal-summary"}
                onFieldSelect={onFieldSelect}
                onStylePanelOpen={onStylePanelOpen}
              />
            </div>
          </div>
        )}

        {/* Experience */}
        {resumeData.experiences && resumeData.experiences.length > 0 && (
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-serif font-bold text-gray-900 ${isMobile ? 'mb-3' : 'mb-4'} border-b border-gray-300 pb-2`}>
              PROFESSIONAL EXPERIENCE
            </h2>
            {resumeData.experiences.map((exp, index) => (
              <div key={exp.id} className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-start'} ${isMobile ? 'mb-1' : 'mb-2'}`}>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-serif font-semibold text-gray-900`}>
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
                      fieldStyle={fieldStyles[`experience-title-${index}`]}
                      isSelected={selectedField === `experience-title-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </h3>
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 font-serif italic ${isMobile ? 'mb-1' : ''}`}>
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
                      isSelected={selectedField === `experience-dates-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </span>
                </div>
                <h4 className={`${isMobile ? 'text-sm' : 'text-base'} font-serif text-gray-800 ${isMobile ? 'mb-2' : 'mb-3'} italic`}>
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
                    fieldType="heading"
                    isSelected={selectedField === `experience-company-${index}`}
                    onFieldSelect={onFieldSelect}
                    onStylePanelOpen={onStylePanelOpen}
                  />
                </h4>
                <div className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-serif leading-relaxed`}>
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
                    placeholder="• Led strategic initiatives resulting in 25% revenue growth
• Managed cross-functional teams of 50+ professionals
• Implemented operational improvements reducing costs by 15%"
                    fieldId={`experience-description-${index}`}
                    fieldType="paragraph"
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
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-serif font-bold text-gray-900 ${isMobile ? 'mb-3' : 'mb-4'} border-b border-gray-300 pb-2`}>
              EDUCATION
            </h2>
            {resumeData.education.map((edu, index) => (
              <div key={edu.id} className={`${isMobile ? 'mb-3' : 'mb-4'}`}>
                <div className={`flex ${isMobile ? 'flex-col' : 'justify-between items-start'}`}>
                  <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-serif font-semibold text-gray-900`}>
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
                      isSelected={selectedField === `education-degree-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </h3>
                  <span className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-600 font-serif italic`}>
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
                      isSelected={selectedField === `education-year-${index}`}
                      onFieldSelect={onFieldSelect}
                      onStylePanelOpen={onStylePanelOpen}
                    />
                  </span>
                </div>
                <p className={`${isMobile ? 'text-sm' : 'text-base'} text-gray-800 font-serif italic`}>
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
                    fieldType="heading"
                    isSelected={selectedField === `education-institution-${index}`}
                    onFieldSelect={onFieldSelect}
                    onStylePanelOpen={onStylePanelOpen}
                  />
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
            <h2 className={`${isMobile ? 'text-lg' : 'text-xl'} font-serif font-bold text-gray-900 ${isMobile ? 'mb-3' : 'mb-4'} border-b border-gray-300 pb-2`}>
              CORE COMPETENCIES
            </h2>
            <div className={`grid ${isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-3 gap-4'} ${isMobile ? 'text-sm' : 'text-base'} text-gray-700 font-serif`}>
              {resumeData.skills.map((skill, index) => (
                <div key={skill.id} className="flex items-center">
                  <span className={`${isMobile ? 'w-1 h-1' : 'w-2 h-2'} bg-gray-900 rounded-full mr-2`}></span>
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
                    fieldStyle={fieldStyles[`skill-${index}`]}
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
    </TemplateWrapper>
  );

  // Template selector - for now just showing Executive Classic
  const renderTemplate = () => {
    switch (template) {
      case "executive-classic":
        return <ExecutiveClassicTemplate />;
      default:
        return <ExecutiveClassicTemplate />;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-auto">
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