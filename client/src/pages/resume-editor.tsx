import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation, useParams } from "wouter";
import { Navbar } from "@/components/navbar";
import { ResumeCanvas } from "@/components/resume-canvas";
import { ResumeControlPanel } from "@/components/resume-control-panel";
import { Button } from "@/components/ui/button";
import { useResume, useUpdateResume } from "@/hooks/use-resumes";
import { ArrowLeft, Save, Download, Undo, Redo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import type { ResumeData } from "@/types/resume";

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
      await updateResume.mutateAsync({
        id: resume.id,
        data: {
          resumeData,
        },
      });
      
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
            
            <Button className="bg-primary hover:bg-primary/90">
              <Download className="mr-1 h-4 w-4" />
              Download PDF
            </Button>
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
