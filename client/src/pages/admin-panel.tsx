import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/navbar";
import { TemplateDialog } from "@/components/template-dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Users, 
  UserPlus, 
  LogIn, 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye,
  BarChart3,
  PieChart,
  TrendingUp,
  Calendar
} from "lucide-react";
import type { ResumeTemplate, InsertTemplate } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface AnalyticsData {
  totalUsers: number;
  dailySignups: number;
  dailyLogins: number;
  totalResumes: number;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  resumeCount: number;
  isActive: boolean;
}

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  // Check if user is admin
  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/admin/analytics"],
    enabled: user?.isAdmin,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/admin/analytics");
      return response.json();
    },
  });

  // Fetch all templates for admin management
  const { data: allTemplates, isLoading: templatesLoading } = useQuery<ResumeTemplate[]>({
    queryKey: ["/api/templates"],
    enabled: user?.isAdmin,
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/templates");
      return response.json();
    },
  });

  // Mock users data (in real app, this would come from API)
  const mockUsers: User[] = [
    {
      id: "1",
      email: "john.doe@email.com",
      firstName: "John",
      lastName: "Doe",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      resumeCount: 2,
      isActive: true,
    },
    {
      id: "2", 
      email: "jane.smith@email.com",
      firstName: "Jane",
      lastName: "Smith",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      resumeCount: 5,
      isActive: true,
    },
    {
      id: "3",
      email: "mike.wilson@email.com", 
      firstName: "Mike",
      lastName: "Wilson",
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      resumeCount: 1,
      isActive: false,
    },
  ];

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (data: InsertTemplate) => {
      const response = await apiRequest("POST", "/api/admin/templates", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template created!",
        description: "New template has been added successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create template.",
        variant: "destructive",
      });
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/admin/templates/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: "Template deleted!",
        description: "Template has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error", 
        description: "Failed to delete template.",
        variant: "destructive",
      });
    },
  });

  if (loading || analyticsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const filteredUsers = mockUsers.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDeleteTemplate = (id: string) => {
    if (window.confirm("Are you sure you want to delete this template?")) {
      deleteTemplateMutation.mutate(id);
    }
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
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
            <p className="text-gray-600">Manage users, templates, and application settings</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                        <UserPlus className="h-6 w-6 text-emerald-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Daily Signups</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.dailySignups || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                        <LogIn className="h-6 w-6 text-purple-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Daily Logins</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.dailyLogins || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-amber-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Resumes</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.totalResumes || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Admin Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card>
              <Tabs defaultValue="users" className="w-full">
                <CardHeader>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="users">Users</TabsTrigger>
                    <TabsTrigger value="templates">Templates</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  </TabsList>
                </CardHeader>

                <CardContent>
                  {/* Users Tab */}
                  <TabsContent value="users" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                      <div className="flex space-x-3">
                        <Input
                          placeholder="Search users..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-64"
                        />
                        <Button variant="outline">Export Data</Button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Email</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Joined</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Resumes</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredUsers.map((user) => (
                            <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-white text-sm font-medium">
                                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                                    </span>
                                  </div>
                                  <span className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-gray-700">{user.email}</td>
                              <td className="py-3 px-4 text-gray-700">
                                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
                              </td>
                              <td className="py-3 px-4 text-gray-700">{user.resumeCount}</td>
                              <td className="py-3 px-4">
                                <Badge variant={user.isActive ? "default" : "secondary"}>
                                  {user.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex space-x-2">
                                  <Button size="sm" variant="ghost">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700">
                                    Suspend
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </TabsContent>

                  {/* Templates Tab */}
                  <TabsContent value="templates" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h2 className="text-lg font-semibold text-gray-900">Template Management</h2>
                      <TemplateDialog />
                    </div>

                    {templatesLoading ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 6 }).map((_, index) => (
                          <div key={index} className="animate-pulse">
                            <div className="h-40 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {allTemplates?.map((template) => (
                          <Card key={template.id} className="overflow-hidden">
                            <div className="h-40 bg-gradient-to-br from-blue-50 to-blue-100 relative">
                              <div className="absolute top-2 right-2">
                                <div className="flex space-x-1">
                                  <TemplateDialog 
                                    template={template}
                                    trigger={
                                      <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                    }
                                  />
                                  <Button 
                                    size="sm" 
                                    variant="secondary" 
                                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleDeleteTemplate(template.id)}
                                    disabled={deleteTemplateMutation.isPending}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                            <CardContent className="p-4">
                              <h3 className="font-medium text-gray-900 mb-1">{template.name}</h3>
                              <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant={template.isActive ? "default" : "secondary"}>
                                  {template.isActive ? "Active" : "Inactive"}
                                </Badge>
                                <Button size="sm" variant="ghost">
                                  <Eye className="h-4 w-4 mr-1" />
                                  Preview
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900">Analytics Dashboard</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <TrendingUp className="mr-2 h-5 w-5" />
                            User Growth
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center">
                              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">User Growth Chart</p>
                              <p className="text-sm text-gray-400">Chart visualization would go here</p>
                            </div>  
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <PieChart className="mr-2 h-5 w-5" />
                            Template Usage
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-gray-50 rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <div className="text-center">
                              <PieChart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-500">Template Usage Chart</p>
                              <p className="text-sm text-gray-400">Chart visualization would go here</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Calendar className="mr-2 h-5 w-5" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                <UserPlus className="h-4 w-4 text-blue-600" />
                              </div>
                              <span className="text-gray-900">{analytics?.dailySignups || 0} new users registered today</span>
                            </div>
                            <span className="text-sm text-gray-500">Today</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mr-3">
                                <FileText className="h-4 w-4 text-emerald-600" />
                              </div>
                              <span className="text-gray-900">{analytics?.totalResumes || 0} total resumes created</span>
                            </div>
                            <span className="text-sm text-gray-500">All time</span>
                          </div>
                          <div className="flex items-center justify-between bg-gray-50 p-3 rounded">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                                <LogIn className="h-4 w-4 text-purple-600" />
                              </div>
                              <span className="text-gray-900">{analytics?.dailyLogins || 0} unique logins today</span>
                            </div>
                            <span className="text-sm text-gray-500">Today</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </CardContent>
              </Tabs>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
