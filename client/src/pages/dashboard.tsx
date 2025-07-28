import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { useResumes, useDeleteResume } from "@/hooks/use-resumes";
import { useToast } from "@/hooks/use-toast";
import { Plus, Edit, Download, Trash2, Calendar, Upload } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { generateResumePDF } from "@/lib/pdf-generator";
import { apiRequest } from "@/lib/queryClient";
import { saveAs } from "file-saver";

export function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: resumes, isLoading } = useResumes();
  const { toast } = useToast();
  const deleteResumeMutation = useDeleteResume();

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleCreateNew = () => {
    setLocation("/templates");
  };

  const handleUploadResume = () => {
    setLocation("/upload-template-selector");
  };

  const handleEditResume = (resumeId: string) => {
    setLocation(`/editor/${resumeId}`);
  };

  const handleDownloadPDF = async (resumeId: string) => {
    try {
      // Fetch the resume data from MongoDB
      const response = await apiRequest("GET", `/api/resumes/${resumeId}`);
      const resumeData = await response.json();

      // Generate PDF
      const pdfBlob = await generateResumePDF(resumeData.data, resumeData.template);
      
      // Download the PDF
      saveAs(pdfBlob, `${resumeData.data.personalInfo.fullName || 'resume'}-resume.pdf`);
      
      toast({
        title: "PDF Downloaded",
        description: "Your resume has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error downloading PDF:", error);
      toast({
        title: "Download Failed",
        description: "Failed to download the PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteResume = async (resumeId: string) => {
    try {
      await deleteResumeMutation.mutateAsync(resumeId);
      toast({
        title: "Resume Deleted",
        description: "Your resume has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting resume:", error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Resumes</h1>
            <p className="text-sm sm:text-base text-gray-600">Create and manage your professional resumes</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Create New Resume Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card 
                className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group h-64 sm:h-72 lg:h-80"
                onClick={handleCreateNew}
              >
                <CardContent className="flex flex-col items-center justify-center text-center h-full p-4 sm:p-6 lg:p-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-primary" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Create New Resume</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Start building a new resume from scratch</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Upload Existing Resume Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Card 
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group h-64 sm:h-72 lg:h-80"
                onClick={handleUploadResume}
              >
                <CardContent className="flex flex-col items-center justify-center text-center h-full p-4 sm:p-6 lg:p-8">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-200 transition-colors">
                    <Upload className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Upload & Convert</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Import your existing resume and apply our templates</p>
                  <div className="mt-2 text-xs text-blue-600">
                    PDF, Word, Text supported
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Existing Resumes */}
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-64 sm:h-72 lg:h-80 animate-pulse">
                    <div className="h-32 sm:h-40 lg:h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-3 sm:p-4">
                      <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2 mb-3 sm:mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="flex space-x-1 sm:space-x-2">
                          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                          <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              resumes?.map((resume, index) => (
                <motion.div
                  key={resume.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-64 sm:h-72 lg:h-80">
                    <div className="h-32 sm:h-40 lg:h-48 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden rounded-t-lg">
                      {/* Miniature resume preview */}
                      <div className="absolute inset-2 sm:inset-3 lg:inset-4 bg-white rounded shadow-sm p-2 sm:p-3">
                        <div className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 bg-blue-400 rounded-full mb-1 sm:mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-0.5 sm:h-1 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-0.5 sm:h-1 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-0.5 sm:h-1 bg-gray-200 rounded w-full mt-1 sm:mt-2"></div>
                          <div className="h-0.5 sm:h-1 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                      <div className="absolute top-1 right-1 sm:top-2 sm:right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditResume(resume.id);
                          }}
                          className="h-6 w-6 sm:h-8 sm:w-8 p-0 sm:p-1"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-3 sm:p-4">
                      <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-1 truncate">{resume.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 mb-2 flex items-center">
                        <Calendar className="h-2 w-2 sm:h-3 sm:w-3 mr-1" />
                        <span className="truncate">Last edited {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}</span>
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Template
                        </span>
                        <div className="flex space-x-1 sm:space-x-2">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadPDF(resume.id);
                            }}
                          >
                            <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 sm:h-8 sm:w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteResume(resume.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card>
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {resumes?.slice(0, 3).map((resume) => (
                    <div key={resume.id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <Edit className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">Updated {resume.title}</p>
                        <p className="text-xs text-gray-600">
                          {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {(!resumes || resumes.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <p>No activity yet. Create your first resume to get started!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default Dashboard;
