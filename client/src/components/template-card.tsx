import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCreateResume } from "@/hooks/use-resumes";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { ResumeTemplate } from "@shared/schema";
import type { ResumeData } from "@/types/resume";

interface TemplateCardProps {
  template: ResumeTemplate;
}

export function TemplateCard({ template }: TemplateCardProps) {
  const createResume = useCreateResume();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const getGradientClass = (category: string) => {
    const gradients = {
      professional: "from-blue-50 to-blue-100",
      creative: "from-emerald-50 to-emerald-100",
      executive: "from-gray-50 to-gray-100",
      minimal: "from-purple-50 to-purple-100",
      tech: "from-indigo-50 to-indigo-100",
      academic: "from-amber-50 to-amber-100",
    };
    return gradients[category as keyof typeof gradients] || gradients.professional;
  };

  const getAccentColor = (category: string) => {
    const colors = {
      professional: "bg-blue-500",
      creative: "bg-emerald-500",
      executive: "bg-gray-800",
      minimal: "bg-purple-500",
      tech: "bg-indigo-500",
      academic: "bg-amber-500",
    };
    return colors[category as keyof typeof colors] || colors.professional;
  };

  const handleUseTemplate = async () => {
    try {
      const defaultResumeData: ResumeData = {
        personalInfo: {
          name: "Your Name",
          title: "Your Job Title",
          email: "your.email@example.com",
          phone: "(555) 123-4567",
          location: "Your City, State",
          summary: "A brief summary of your professional background and skills. This is where you can highlight your key achievements and career objectives.",
        },
        experiences: [
          {
            id: crypto.randomUUID(),
            title: "Job Title",
            company: "Company Name",
            startYear: "2022",
            endYear: "Present",
            description: "• Describe your key responsibilities and achievements\n• Include specific metrics and results when possible\n• Use action verbs to start each bullet point"
          }
        ],
        education: [
          {
            id: crypto.randomUUID(),
            degree: "Bachelor of Science in Computer Science",
            institution: "University Name",
            graduationYear: "2022"
          }
        ],
        skills: [
          {
            id: crypto.randomUUID(),
            name: "JavaScript",
            category: "Programming Languages"
          },
          {
            id: crypto.randomUUID(),
            name: "React",
            category: "Frameworks"
          },
          {
            id: crypto.randomUUID(),
            name: "Node.js",
            category: "Backend"
          }
        ],
      };

      const newResume = await createResume.mutateAsync({
        templateId: template.id,
        title: `New ${template.name}`,
        resumeData: defaultResumeData,
        userId: "", // This will be set by the backend
      });

      toast({
        title: "Resume created!",
        description: "Your new resume has been created successfully.",
      });

      setLocation(`/editor/${newResume.id}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create resume. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group">
      <div className={`h-64 sm:h-72 lg:h-80 bg-gradient-to-br ${getGradientClass(template.category)} relative p-4 sm:p-6`}>
        {/* Template Preview */}
        <div className="bg-white rounded shadow-sm p-3 sm:p-4 h-full relative">
          {template.category === "professional" && (
            <div className="flex items-center mb-3">
              <div className={`w-12 h-12 ${getAccentColor(template.category)} rounded-full mr-3`}></div>
              <div>
                <div className="h-3 bg-gray-800 rounded w-24 mb-1"></div>
                <div className="h-2 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          )}
          
          {template.category === "creative" && (
            <div className="flex mb-3">
              <div className={`w-1 ${getAccentColor(template.category)} mr-3`}></div>
              <div className="flex-1">
                <div className="h-3 bg-gray-800 rounded w-24 mb-1"></div>
                <div className="h-2 bg-gray-600 rounded w-20"></div>
              </div>
            </div>
          )}
          
          {template.category === "executive" && (
            <div className="text-center mb-3 border-t-4 border-gray-800 pt-2">
              <div className="h-3 bg-gray-800 rounded w-24 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-600 rounded w-20 mx-auto"></div>
            </div>
          )}
          
          {template.category === "minimal" && (
            <div className="mb-3">
              <div className="h-3 bg-gray-800 rounded w-24 mb-1"></div>
              <div className={`h-1 ${getAccentColor(template.category)} rounded w-16 mb-2`}></div>
              <div className="h-2 bg-gray-600 rounded w-20"></div>
            </div>
          )}
          
          {template.category === "tech" && (
            <div className="bg-gray-900 rounded p-2 text-white mb-3">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mr-2"></div>
                <div className="h-2 bg-white rounded w-24"></div>
              </div>
            </div>
          )}
          
          {template.category === "academic" && (
            <div className="text-center mb-3 border-b border-amber-200 pb-2">
              <div className="h-3 bg-gray-800 rounded w-24 mx-auto mb-1"></div>
              <div className="h-2 bg-gray-600 rounded w-20 mx-auto"></div>
            </div>
          )}
          
          <div className="space-y-2">
            <div className="h-2 bg-gray-300 rounded w-full"></div>
            <div className="h-2 bg-gray-300 rounded w-5/6"></div>
            <div className="h-2 bg-gray-300 rounded w-4/5"></div>
          </div>
          
          <div className="mt-4">
            <div className={`h-3 ${getAccentColor(template.category)} rounded w-16 mb-2`}></div>
            <div className="space-y-1">
              <div className="h-2 bg-gray-200 rounded w-full"></div>
              <div className="h-2 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all flex items-center justify-center">
          <Button 
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleUseTemplate}
            disabled={createResume.isPending}
            size="sm"
          >
            {createResume.isPending ? "Creating..." : "Use Template"}
          </Button>
        </div>
      </div>
      
      <CardContent className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">{template.name}</h3>
        <p className="text-xs sm:text-sm text-gray-600">{template.description}</p>
      </CardContent>
    </Card>
  );
}
