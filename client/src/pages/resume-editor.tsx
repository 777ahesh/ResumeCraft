import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/navbar";
import { ResumeCanvas } from "@/components/resume-canvas";
import { ResumeControlPanel } from "@/components/resume-control-panel";
import { Button } from "@/components/ui/button";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ArrowLeft, Save, Download, Undo, Redo, FileText, ChevronDown, Palette, Menu } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";
import { downloadResumePDF, resumePDFToBase64 } from "@/lib/pdf-generator";
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

  const templateOptions = [
    { id: "modern-professional", name: "Modern Professional", description: "Two-column layout with sidebar" },
    { id: "creative-edge", name: "Creative Edge", description: "Zigzag timeline with modern cards" },
    { id: "executive-classic", name: "Executive Classic", description: "Newspaper/magazine style" },
    { id: "minimalist", name: "Minimalist", description: "Swiss design inspired" },
    { id: "tech-developer", name: "Tech Developer", description: "Terminal/IDE interface" },
    { id: "academic-scholar", name: "Academic Scholar", description: "Research paper style" }
  ];

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (resume) {
      console.log('Resume loaded:', { id: resume.id, templateId: resume.templateId, title: resume.title });
      setResumeData(resume.resumeData as ResumeData);
      setCurrentTemplate(resume.templateId || "modern-professional");
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

      // Generate and save PDF
      const pdfBase64 = await resumePDFToBase64(resumeData, currentTemplate);
      await savePDFToLocalStorage(resume.id, pdfBase64);
      
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

  const handleTemplateChange = (templateId: string) => {
    console.log('Template changed to:', templateId);
    setCurrentTemplate(templateId);
    setHasChanges(true);
  };

  const handleDownloadPDF = async () => {
    if (!resumeData) return;
    
    try {
      await downloadResumePDF(
        resumeData,
        resume.title || "resume",
        currentTemplate
      );
      toast({
        title: "Success!",
        description: "PDF downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to download PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDownloadWord = async () => {
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
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            {/* Mobile Control Panel Toggle */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Menu className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <ResumeControlPanel
                    resumeData={resumeData}
                    onChange={handleDataChange}
                  />
                </SheetContent>
              </Sheet>
            )}

            {!isMobile && (
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
              </>
            )}

            {/* Template Selector */}
            <div className="flex items-center gap-1 sm:gap-2">
              <Palette className="h-3 w-3 sm:h-4 sm:w-4 text-gray-600" />
              <Select value={currentTemplate} onValueChange={handleTemplateChange}>
                <SelectTrigger className={`${isMobile ? 'w-32' : 'w-48'} text-xs sm:text-sm`}>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex flex-col">
                        <span className="font-medium text-xs sm:text-sm">{template.name}</span>
                        {!isMobile && (
                          <span className="text-xs text-gray-500">{template.description}</span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isMobile && <div className="h-4 sm:h-6 w-px bg-gray-300"></div>}
            
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || updateResume.isPending}
              size={isMobile ? "sm" : "default"}
            >
              <Save className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
              {updateResume.isPending ? (isMobile ? "..." : "Saving...") : (isMobile ? "Save" : "Save")}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90" size={isMobile ? "sm" : "default"}>
                  <Download className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  {!isMobile && "Download"}
                  <ChevronDown className="ml-1 h-2 w-2 sm:h-3 sm:w-3" />
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
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {!isMobile && (
          <ResumeControlPanel
            resumeData={resumeData}
            onChange={handleDataChange}
          />
        )}
        <ResumeCanvas
          resumeData={resumeData}
          template={currentTemplate}
        />
      </div>
    </div>
  );
}
