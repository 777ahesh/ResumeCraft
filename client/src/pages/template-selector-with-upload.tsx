import React, { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Navbar } from '@/components/navbar';
import { ResumeUpload } from '@/components/resume-upload';
import { TemplateCard } from '@/components/template-card';
import { ArrowLeft, Upload, Plus, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useCreateResume } from '@/hooks/use-resumes';
import { useToast } from '@/hooks/use-toast';
import type { ResumeTemplate } from '@shared/schema';
import type { ResumeData } from '@/types/resume';

export default function TemplateSelectorWithUpload() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedResumeData, setUploadedResumeData] = useState<ResumeData | null>(null);
  const createResumeMutation = useCreateResume();
  const { toast } = useToast();

  const { data: templates, isLoading } = useQuery<ResumeTemplate[]>({
    queryKey: ['/api/templates'],
    queryFn: async () => {
      const response = await apiRequest('GET', '/api/templates');
      return response.json();
    },
  });

  const handleUploadSuccess = (extractedData: ResumeData) => {
    console.log('📥 Upload success! Received data:', JSON.stringify(extractedData, null, 2));
    setUploadedResumeData(extractedData);
    setShowUpload(false);
    toast({
      title: 'Resume uploaded successfully!',
      description: 'Now select a template to apply to your resume.',
    });
  };

  const handleTemplateSelect = async (templateId: string) => {
    console.log('🎨 Template selected:', templateId);
    console.log('📋 Current uploaded resume data:', JSON.stringify(uploadedResumeData, null, 2));
    
    try {
      const resumeData = uploadedResumeData || {
        personalInfo: {
          name: '',
          title: '',
          email: '',
          phone: '',
          location: '',
          summary: ''
        },
        experiences: [],
        education: [],
        skills: [],
        customSections: []
      };

      console.log('🚀 Resume data being sent to create resume:', JSON.stringify(resumeData, null, 2));

      const result = await createResumeMutation.mutateAsync({
        userId: user?.id || '',
        title: uploadedResumeData ? 
          `${uploadedResumeData.personalInfo.name}'s Resume` || 'Imported Resume' :
          'New Resume',
        templateId,
        resumeData
      });

      console.log('✅ Resume created successfully:', result);
      setLocation(`/editor/${result.id}`);
    } catch (error) {
      console.error('❌ Error creating resume:', error);
      toast({
        title: 'Error creating resume',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/');
    return null;
  }

  if (showUpload) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="py-8">
          <ResumeUpload
            onUploadSuccess={handleUploadSuccess}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => setLocation('/dashboard')}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Dashboard</span>
              </Button>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {uploadedResumeData ? 'Choose Your Template' : 'Create Your Resume'}
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {uploadedResumeData 
                ? 'Your resume has been processed! Now select a professional template to apply to your content.'
                : 'Start with a blank template or upload your existing resume to convert it to our professional templates.'
              }
            </p>
          </div>

          {/* Upload Success Banner */}
          {uploadedResumeData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-8"
            >
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-green-900">
                        Resume Imported Successfully!
                      </h3>
                      <p className="text-green-700">
                        Name: {uploadedResumeData.personalInfo.name || 'Not detected'}
                        {uploadedResumeData.personalInfo.email && (
                          <span> • Email: {uploadedResumeData.personalInfo.email}</span>
                        )}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        Select a template below to apply professional styling to your content.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setUploadedResumeData(null);
                        setShowUpload(false);
                      }}
                      className="text-green-700 border-green-300 hover:bg-green-100"
                    >
                      Upload Different Resume
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Action Cards */}
          {!uploadedResumeData && (
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Create New Resume */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                    <Plus className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Start Fresh</h3>
                    <p className="text-gray-600 mb-6">
                      Create a new resume from scratch using our professional templates.
                    </p>
                    <div className="mt-auto">
                      <p className="text-sm text-gray-500 mb-4">Perfect for first-time users</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Upload Existing Resume */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setShowUpload(true)}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                    <Upload className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2 text-blue-900">Upload & Convert</h3>
                    <p className="text-blue-700 mb-6">
                      Upload your existing resume and convert it to our professional templates.
                    </p>
                    <Button className="mb-4">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume
                    </Button>
                    <p className="text-sm text-blue-600">Supports PDF, Word, and Text files</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </motion.div>

        {/* Templates Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {uploadedResumeData ? 'Select a Template' : 'Choose a Template'}
          </h2>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates?.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300">
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
                      <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-3 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl">📄</span>
                          </div>
                          <p className="text-sm font-medium text-gray-600">Template Preview</p>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-lg mb-2">{template.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                      <Button 
                        onClick={() => handleTemplateSelect(template.id)}
                        className="w-full"
                        size="sm"
                      >
                        {uploadedResumeData ? 'Apply Template' : 'Use Template'}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
