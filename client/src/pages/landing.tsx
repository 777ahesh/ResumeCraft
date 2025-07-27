import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AuthModal } from "@/components/auth-modal";
import { useState } from "react";
import { FileText, Edit, Palette, Download, Cloud, Shield, Smartphone } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";

export default function Landing() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const handleAuthClick = (mode: "login" | "signup") => {
    if (user) {
      setLocation("/dashboard");
    } else {
      setAuthMode(mode);
      setAuthModalOpen(true);
    }
  };

  const features = [
    {
      icon: Edit,
      title: "Real-time Editor",
      description: "Edit your resume with our intuitive canvas-based editor and see changes instantly",
      color: "text-blue-600 bg-blue-100"
    },
    {
      icon: Palette,
      title: "6 Professional Templates",
      description: "Choose from carefully designed templates that pass ATS systems",
      color: "text-emerald-600 bg-emerald-100"
    },
    {
      icon: Download,
      title: "Multiple Formats",
      description: "Download your resume as PDF or Word document",
      color: "text-purple-600 bg-purple-100"
    },
    {
      icon: Cloud,
      title: "Cloud Storage",
      description: "Access your resumes from anywhere with automatic cloud backup",
      color: "text-amber-600 bg-amber-100"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Create and edit resumes on any device with our responsive design",
      color: "text-red-600 bg-red-100"
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your data is encrypted and stored securely in our servers",
      color: "text-indigo-600 bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-primary flex items-center">
                  <FileText className="mr-2" />
                  ResumeBuilder Pro
                </h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <a href="#features" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Features</a>
                <a href="#templates" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium transition-colors">Templates</a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => handleAuthClick("login")}>
                {user ? "Dashboard" : "Sign In"}
              </Button>
              <Button onClick={() => handleAuthClick("signup")}>
                {user ? "Dashboard" : "Get Started"}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 mb-6"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Create Professional Resumes
              <span className="text-primary block">In Minutes</span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Build stunning, ATS-friendly resumes with our intuitive editor. Choose from 6 professional templates and customize every detail.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button size="lg" onClick={() => handleAuthClick("signup")} className="text-lg">
                Start Building Free
              </Button>
              <Button size="lg" variant="outline" className="text-lg">
                View Templates
              </Button>
            </motion.div>
          </div>

          {/* Floating Resume Preview */}
          <motion.div 
            className="mt-16 relative"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <motion.div 
              className="w-64 h-80 mx-auto glassmorphism rounded-xl p-6 custom-shadow"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.9), rgba(255,255,255,0.6))" }}
            >
              <div className="w-12 h-12 bg-primary rounded-full mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-2 bg-gray-200 rounded w-full mt-4"></div>
                <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                <div className="h-2 bg-gray-200 rounded w-4/5"></div>
              </div>
              <div className="mt-6 space-y-1">
                <div className="h-2 bg-primary/30 rounded w-full"></div>
                <div className="h-2 bg-primary/30 rounded w-3/4"></div>
                <div className="h-2 bg-primary/30 rounded w-5/6"></div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to create the perfect resume</p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-6 hover:shadow-lg transition-shadow h-full">
                  <CardContent className="pt-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${feature.color}`}>
                      <feature.icon size={32} />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen}
        mode={authMode}
        onModeChange={setAuthMode}
      />
    </div>
  );
}
