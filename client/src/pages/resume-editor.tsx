import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/navbar";
import { ResumeCanvas } from "@/components/resume-canvas";
import { ResumeControlPanel } from "@/components/resume-control-panel";
import { Button } from "@/components/ui/button";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ArrowLeft, Save, Download, Undo, Redo, FileText, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";
import { downloadResumePDF, resumePDFToBase64 } from "@/lib/pdf-generator";
import { downloadResumeWord } from "@/lib/word-generator";
import { saveResumeToLocalStorage, savePDFToLocalStorage } from "@/lib/resume-utils";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function ResumeEditor() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { resumeId } = useParams();
  const { toast } = useToast();
  
  const { data: resume, isLoading } = useResume(resumeId || "");
  const updateResume = useUpdateResume();
  
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  useEffect(() => {
    if (resume) {
      setResumeData(resume.resumeData as ResumeData);
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
    try {
      // Generate and store PDF as base64
      const pdfBase64 = await resumePDFToBase64(resumeData, resume.templateId);
      
      await updateResume.mutateAsync({
        id: resume.id,
        data: {
          resumeData,
          pdfData: pdfBase64, // Store PDF as base64 in database
        },
      });
      
      // Also save to localStorage as backup
      saveResumeToLocalStorage(resume.id, resumeData);
      savePDFToLocalStorage(resume.id, pdfBase64);
      
      setHasChanges(false);
      toast({
        title: "Resume saved!",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDataChange = (newData: ResumeData) => {
    setResumeData(newData);
    setHasChanges(true);
  };

  const handleDownloadPDF = async () => {
    if (!resumeData) return;
    
    try {
      await downloadResumePDF(
        resumeData,
        resume.title || "resume",
        resume.templateId
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
        resume.templateId
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Resume Editor</h1>
              <p className="text-sm text-gray-600">{resume.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" disabled>
              <Undo className="mr-1 h-4 w-4" />
              Undo
            </Button>
            <Button variant="ghost" disabled>
              <Redo className="mr-1 h-4 w-4" />
              Redo
            </Button>
            
            <div className="h-6 w-px bg-gray-300"></div>
            
            <Button
              variant="outline"
              onClick={handleSave}
              disabled={!hasChanges || updateResume.isPending}
            >
              <Save className="mr-1 h-4 w-4" />
              {updateResume.isPending ? "Saving..." : "Save"}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
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
          </div>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        <ResumeControlPanel
          resumeData={resumeData}
          onChange={handleDataChange}
        />
        <ResumeCanvas
          resumeData={resumeData}
          template={resume.templateId}
        />
      </div>
    </div>
  );
}
