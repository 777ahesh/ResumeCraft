import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth.tsx";
import { cleanOldLocalStorageBackups } from "@/lib/resume-utils";
import { useEffect } from "react";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import TemplateSelector from "@/pages/template-selector";
import TemplateSelectorWithUpload from "@/pages/template-selector-with-upload";
import ResumeEditor from "@/pages/resume-editor";
import UserProfile from "@/pages/user-profile";
import AdminPanel from "@/pages/admin-panel";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/templates" component={TemplateSelector} />
      <Route path="/upload-template-selector" component={TemplateSelectorWithUpload} />
      <Route path="/editor/:resumeId?" component={ResumeEditor} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    // Clean old localStorage backups on app start
    cleanOldLocalStorageBackups();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;