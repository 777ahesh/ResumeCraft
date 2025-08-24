import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/navbar";
import { ResumeCanvas } from "@/components/resume-canvas";
import { ResumeControlPanel } from "@/components/resume-control-panel";
import { StyleConfigPanel } from "@/components/style-config-panel";
import { Button } from "@/components/ui/button";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ArrowLeft, Save, Download, Undo, Redo, FileText, ChevronDown, Palette, Menu, Settings, Move } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResumeData, StyleConfig } from "@/types/resume";
import { downloadResumePDF, resumePDFToBase64 } from "@/lib/pdf-generator";
import { downloadPDFFromElement, getPDFBase64FromElement } from "@/lib/html-to-pdf";
import { downloadResumeWord } from "@/lib/word-generator";
import { saveResumeToLocalStorage, savePDFToLocalStorage } from "@/lib/resume-utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { useRef } from "react";

export default function ResumeEditor() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { resumeId } = useParams();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const { data: resume, isLoading } = useResume(resumeId || "");
  const updateResume = useUpdateResume();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<string>("modern-professional");
  const [showControlPanel, setShowControlPanel] = useState(!isMobile);
  const [activePanel, setActivePanel] = useState<'content' | 'style'>('content');
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);
  const [fieldStyles, setFieldStyles] = useState<Record<string, any>>({});
  
  // Ref for capturing the resume canvas for PDF generation
  const resumeCanvasRef = useRef<HTMLDivElement>(null);

  // Default style configuration
  const defaultStyleConfig: StyleConfig = {
    fontFamily: 'Inter',
    fontSize: 14,
    primaryColor: '#3B82F6',
    secondaryColor: '#6B7280',
    textColor: '#1F2937',
    backgroundColor: '#FFFFFF',
    headerStyle: 'bold',
    spacing: 'normal',
    borderRadius: 4,
    lineHeight: 1.5,
  };

  const templateOptions = [
    { id: "modern-professional", name: "Modern Professional", description: "Two-column layout with sidebar" },
    { id: "creative-edge", name: "Creative Edge", description: "Zigzag timeline with modern cards" },
    { id: "executive-classic", name: "Executive Classic", description: "Newspaper/magazine style" },
    { id: "minimalist", name: "Minimalist", description: "Swiss design inspired" },
    { id: "tech-developer", name: "Tech Developer", description: "Terminal/IDE interface" },
    { id: "academic-scholar", name: "Academic Scholar", description: "Research paper style" }
  ];

  // Field selection handlers
  const handleFieldSelect = (fieldId: string) => {
    setSelectedField(fieldId);
  };

  const handleStylePanelOpen = () => {
    setIsStylePanelOpen(true);
    setActivePanel('style');
    if (isMobile) {
      setShowControlPanel(true);
    }
  };

  const handleFieldStyleChange = (fieldId: string, styles: any) => {
    setFieldStyles(prev => ({
      ...prev,
      [fieldId]: styles
    }));
    // Also update the resume data to persist the field styles
    if (resumeData) {
      const updatedResumeData = {
        ...resumeData,
        fieldStyles: {
          ...resumeData?.fieldStyles,
          [fieldId]: styles
        }
      };
      setResumeData(updatedResumeData);
      setHasChanges(true);
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (resume) {
      console.log('📝 Resume loaded in editor:', JSON.stringify(resume, null, 2));
      console.log('📊 Resume data structure:', resume.resumeData);
      
      const resumeDataWithDefaults = resume.resumeData as ResumeData;
      // Ensure styleConfig exists with defaults
      if (!resumeDataWithDefaults.styleConfig) {
        resumeDataWithDefaults.styleConfig = defaultStyleConfig;
      }
      // Ensure customSections exists with defaults
      if (!resumeDataWithDefaults.customSections) {
        resumeDataWithDefaults.customSections = [];
      }
      
      console.log('✅ Setting resume data in editor:', JSON.stringify(resumeDataWithDefaults, null, 2));
      setResumeData(resumeDataWithDefaults);
      setCurrentTemplate(resume.templateId || "modern-professional");
      
      // Initialize field styles if they exist
      if (resumeDataWithDefaults.fieldStyles) {
        setFieldStyles(resumeDataWithDefaults.fieldStyles);
      }
    }
  }, [resume]);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !resume || !resumeData) {
    return null;
  }

    const handleSave = async () => {
    if (!resumeData || !resume) return;
    
    try {
      console.log('Saving resume:', { 
        id: resume.id, 
        currentTemplate, 
        hasResumeData: !!resumeData 
      });
      
      // Save resume data and template to database
      await updateResume.mutateAsync({
        id: resume.id,
        data: {
          resumeData,
          templateId: currentTemplate, // Include the current template
        }
      });

      // Generate and save PDF using HTML canvas
      if (resumeCanvasRef.current) {
        const canvasElement = resumeCanvasRef.current.querySelector('.resume-canvas') as HTMLElement;
        if (canvasElement) {
          try {
            const pdfBase64 = await getPDFBase64FromElement(canvasElement, {
              quality: 0.95,
              scale: 2,
              useCORS: true,
              allowTaint: true
            });
            await savePDFToLocalStorage(resume.id, pdfBase64);
          } catch (pdfError) {
            console.warn('HTML-to-PDF generation failed, trying fallback:', pdfError);
            // Fallback to original PDF generator
            try {
              const fallbackPdfBase64 = await resumePDFToBase64(resumeData, currentTemplate);
              await savePDFToLocalStorage(resume.id, fallbackPdfBase64);
            } catch (fallbackError) {
              console.warn('Fallback PDF generation also failed, skipping PDF save:', fallbackError);
            }
          }
        }
      }
      
      setHasChanges(false);
      toast({
        title: "Resume saved successfully",
        description: "Your resume has been saved to the database and PDF generated.",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Error saving resume",
        description: "Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    setHasChanges(true);
  };

  const handleStyleChange = (newStyleConfig: StyleConfig) => {
    if (!resumeData) return;
    const updatedData = {
      ...resumeData,
      styleConfig: newStyleConfig,
    };
    setResumeData(updatedData);
    setHasChanges(true);
  };

  const handleTemplateChange = (templateId: string) => {
    console.log('Template changed to:', templateId);
    setCurrentTemplate(templateId);
    setHasChanges(true);
  };

  const handleDownloadPDF = async () => {
    if (!resumeData || !resumeCanvasRef.current) {
      console.error('Missing data for PDF generation:', { resumeData: !!resumeData, canvasRef: !!resumeCanvasRef.current });
      toast({
        title: "Error",
        description: "Unable to generate PDF. Please try again.",
        variant: "destructive",
      });
      return;
    }

    console.log('PDF download initiated');
    console.log('Resume canvas ref:', resumeCanvasRef.current);

    try {
      // Find the actual resume canvas element
      let canvasElement = resumeCanvasRef.current.querySelector('.resume-canvas') as HTMLElement;
      
      // Fallback: try to find any element with resume content
      if (!canvasElement) {
        canvasElement = resumeCanvasRef.current.querySelector('[class*="resume"]') as HTMLElement;
      }
      
      // Last resort: use the ref element itself if it has content
      if (!canvasElement && resumeCanvasRef.current.children.length > 0) {
        canvasElement = resumeCanvasRef.current.children[0] as HTMLElement;
      }
      
      console.log('Canvas element found:', canvasElement);
      
      if (!canvasElement) {
        throw new Error('Resume canvas element not found');
      }

      console.log('Starting HTML-to-PDF generation...');
      await downloadPDFFromElement(
        canvasElement,
        `${resume.title || "resume"}.pdf`,
        {
          quality: 0.95,
          scale: 2,
          useCORS: true,
          allowTaint: true
        }
      );
    } catch (error) {
      console.error('HTML-to-PDF download error:', error);
      toast({
        title: "Error",
        description: "Failed to generate PDF from the resume preview. Please check that your resume is visible and try again.",
        variant: "destructive",
      });
    }
// ...existing code...
  };  const handleDownloadWord = async () => {
    if (!resumeData) return;
    
    try {
      await downloadResumeWord(
        resumeData,
        resume.title || "resume",
        currentTemplate
      );
      toast({
        title: "Success!",
        description: "Word document downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download Word document. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              size={isMobile ? "sm" : "default"}
            >
              <ArrowLeft className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              {!isMobile && "Back"}
            </Button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                {isMobile ? "Editor" : "Resume Editor"}
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{resume.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Mobile Control Panel Toggle */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[90vh] rounded-t-xl p-0">
                  <Tabs defaultValue="content" className="h-full flex flex-col">
                    <div className="p-4 border-b bg-white shrink-0">
                      <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="content" className="text-sm">Content</TabsTrigger>
                        <TabsTrigger value="style" className="text-sm">Style</TabsTrigger>
                      </TabsList>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="content" className="h-full m-0 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                          <ResumeControlPanel
                            resumeData={resumeData}
                            onChange={handleDataChange}
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="style" className="h-full m-0 overflow-hidden">
                        <div className="h-full overflow-y-auto">
                          <StyleConfigPanel
                            styleConfig={resumeData?.styleConfig || defaultStyleConfig}
                            onChange={handleStyleChange}
                            selectedField={selectedField}
                            fieldStyles={fieldStyles}
                            onFieldStyleChange={handleFieldStyleChange}
                          />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </SheetContent>
              </Sheet>
            )}

            {isMobile ? (
              // Mobile compact toolbar
              <div className="flex items-center space-x-1">
                {/* Template Selector - More compact for mobile */}
                <Select value={currentTemplate} onValueChange={handleTemplateChange}>
                  <SelectTrigger className="w-20 text-xs h-8">
                    <Palette className="h-3 w-3" />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        <span className="text-xs">{template.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {/* Interactive Mode Toggle */}
                <Button
                  variant={isInteractiveMode ? "default" : "outline"}
                  onClick={() => setIsInteractiveMode(!isInteractiveMode)}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Move className="h-3 w-3" />
                </Button>
                
                {/* Save Button */}
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!hasChanges || updateResume.isPending}
                  size="sm"
                  className="h-8 px-2"
                >
                  <Save className="h-3 w-3" />
                </Button>
                
                {/* Download Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90 h-8 px-2" size="sm">
                      <Download className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadWord}>
                      <FileText className="mr-2 h-4 w-4" />
                      Word
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Desktop toolbar
              <>
                <Button variant="ghost" disabled size="sm">
                  <Undo className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Undo
                </Button>
                <Button variant="ghost" disabled size="sm">
                  <Redo className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Redo
                </Button>
                
                <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
                
                {/* Style Configuration Toggle */}
                <Button
                  variant={activePanel === 'style' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActivePanel(activePanel === 'style' ? 'content' : 'style')}
                >
                  <Settings className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Style
                </Button>
                
                <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
                
                {/* Template Selector */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
                  <Select value={currentTemplate} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="w-48 text-xs sm:text-sm">
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span className="font-medium text-xs sm:text-sm">{template.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-4 sm:h-6 w-px bg-gray-300"></div>
                
                {/* Interactive Mode Toggle */}
                <Button
                  variant={isInteractiveMode ? "default" : "outline"}
                  onClick={() => setIsInteractiveMode(!isInteractiveMode)}
                  size="default"
                >
                  <Move className="mr-1 h-4 w-4" />
                  {isInteractiveMode ? "Exit Move" : "Move Mode"}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleSave}
                  disabled={!hasChanges || updateResume.isPending}
                  size="default"
                >
                  <Save className="mr-1 h-4 w-4" />
                  {updateResume.isPending ? "Saving..." : "Save"}
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90" size="default">
                      <Download className="mr-1 h-4 w-4" />
                      Download
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDownloadPDF}>
                      <FileText className="mr-2 h-4 w-4" />
                      Download as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDownloadWord}>
                      <FileText className="mr-2 h-4 w-4" />
                      Download as Word
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && (
          <div className="w-80 border-r border-gray-200 bg-white overflow-y-auto" style={{ maxHeight: '100vh' }}>
            {activePanel === 'content' ? (
              <ResumeControlPanel
                resumeData={resumeData}
                onChange={handleDataChange}
              />
            ) : (
              <StyleConfigPanel
                styleConfig={resumeData?.styleConfig || defaultStyleConfig}
                onChange={handleStyleChange}
                selectedField={selectedField}
                fieldStyles={fieldStyles}
                onFieldStyleChange={handleFieldStyleChange}
              />
            )}
          </div>
        )}
        <div className="flex-1 bg-gray-100 overflow-auto" ref={resumeCanvasRef}>
          {isMobile ? (
            <div className="h-full w-full overflow-auto p-2">
              <div className="flex justify-center">
                <div className="w-full max-w-full">
                  <ResumeCanvas
                    resumeData={resumeData}
                    template={currentTemplate}
                    styleConfig={resumeData?.styleConfig}
                    isInteractiveMode={isInteractiveMode}
                    onResumeDataChange={handleDataChange}
                    selectedField={selectedField}
                    onFieldSelect={handleFieldSelect}
                    onStylePanelOpen={handleStylePanelOpen}
                    fieldStyles={fieldStyles}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 lg:p-8 min-h-full">
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <ResumeCanvas
                    resumeData={resumeData}
                    template={currentTemplate}
                    styleConfig={resumeData?.styleConfig}
                    isInteractiveMode={isInteractiveMode}
                    onResumeDataChange={handleDataChange}
                    selectedField={selectedField}
                    onFieldSelect={handleFieldSelect}
                    onStylePanelOpen={handleStylePanelOpen}
                    fieldStyles={fieldStyles}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
