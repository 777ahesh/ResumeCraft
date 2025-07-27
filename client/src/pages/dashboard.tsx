import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/navbar";
import { useResumes } from "@/hooks/use-resumes";
import { Plus, Edit, Download, Trash2, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { resumes, isLoading } = useResumes();

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

  const handleEditResume = (resumeId: string) => {
    setLocation(`/editor/${resumeId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Resumes</h1>
            <p className="text-gray-600">Create and manage your professional resumes</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {/* Create New Resume Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card 
                className="border-2 border-dashed border-gray-300 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group h-80"
                onClick={handleCreateNew}
              >
                <CardContent className="flex flex-col items-center justify-center text-center h-full p-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Resume</h3>
                  <p className="text-sm text-gray-600">Start building a new resume from scratch</p>
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
                  <Card className="h-80 animate-pulse">
                    <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                    <CardContent className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                      <div className="flex justify-between items-center">
                        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        <div className="flex space-x-2">
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
                          <div className="h-6 w-6 bg-gray-200 rounded"></div>
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
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer group h-80">
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden rounded-t-lg">
                      {/* Miniature resume preview */}
                      <div className="absolute inset-4 bg-white rounded shadow-sm p-3">
                        <div className="w-6 h-6 bg-blue-400 rounded-full mb-2"></div>
                        <div className="space-y-1">
                          <div className="h-1 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-1 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-1 bg-gray-200 rounded w-full mt-2"></div>
                          <div className="h-1 bg-gray-200 rounded w-5/6"></div>
                        </div>
                      </div>
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button 
                          size="sm" 
                          variant="secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditResume(resume.id);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <CardContent className="p-4">
                      <h3 className="font-medium text-gray-900 mb-1 truncate">{resume.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Last edited {formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Template
                        </span>
                        <div className="flex space-x-2">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
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
