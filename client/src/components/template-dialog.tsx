import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTemplateSchema } from "@shared/schema";
import type { ResumeTemplate, InsertTemplate } from "@shared/schema";
import { z } from "zod";

interface TemplateDialogProps {
  template?: ResumeTemplate;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

const formSchema = insertTemplateSchema.extend({
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  layout: z.string().min(1, "Layout is required"),
});

type FormData = z.infer<typeof formSchema>;

const TEMPLATE_CATEGORIES = [
  { value: "professional", label: "Professional" },
  { value: "creative", label: "Creative" },
  { value: "executive", label: "Executive" },
  { value: "minimal", label: "Minimal" },
  { value: "tech", label: "Tech" },
  { value: "academic", label: "Academic" },
];

const TEMPLATE_LAYOUTS = [
  { value: "modern", label: "Modern" },
  { value: "creative", label: "Creative" },
  { value: "classic", label: "Classic" },
  { value: "minimal", label: "Minimal" },
  { value: "tech", label: "Tech" },
  { value: "academic", label: "Academic" },
];

export function TemplateDialog({ template, trigger, onSuccess }: TemplateDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = !!template;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: template?.name || "",
      description: template?.description || "",
      category: template?.category || "",
      primaryColor: template?.templateData?.colors?.primary || "#3B82F6",
      secondaryColor: template?.templateData?.colors?.secondary || "#6B7280",
      layout: template?.templateData?.layout || "modern",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const templateData: InsertTemplate = {
        name: data.name,
        description: data.description,
        category: data.category,
        templateData: {
          layout: data.layout,
          colors: {
            primary: data.primaryColor,
            secondary: data.secondaryColor,
          },
          fonts: {
            heading: "Inter",
            body: "Inter",
          },
        },
      };

      if (isEditing) {
        const response = await apiRequest("PATCH", `/api/admin/templates/${template.id}`, templateData);
        return response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/templates", templateData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({
        title: isEditing ? "Template updated!" : "Template created!",
        description: `Template has been ${isEditing ? "updated" : "created"} successfully.`,
      });
      setOpen(false);
      form.reset();
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} template.`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  const defaultTrigger = (
    <Button size="sm">
      {isEditing ? (
        <>
          <Edit className="mr-2 h-4 w-4" />
          Edit Template
        </>
      ) : (
        <>
          <Plus className="mr-2 h-4 w-4" />
          Add New Template
        </>
      )}
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Template" : "Create New Template"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the template details below."
              : "Create a new resume template for users to choose from."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Modern Professional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this template and its ideal use cases..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEMPLATE_CATEGORIES.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="layout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Layout</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TEMPLATE_LAYOUTS.map((layout) => (
                          <SelectItem key={layout.value} value={layout.value}>
                            {layout.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          className="w-12 h-10 rounded cursor-pointer"
                          {...field}
                        />
                        <Input
                          placeholder="#3B82F6"
                          value={field.value}
                          onChange={field.onChange}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secondary Color</FormLabel>
                    <FormControl>
                      <div className="flex space-x-2">
                        <Input
                          type="color"
                          className="w-12 h-10 rounded cursor-pointer"
                          {...field}
                        />
                        <Input
                          placeholder="#6B7280"
                          value={field.value}
                          onChange={field.onChange}
                          className="flex-1"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {isEditing ? "Update Template" : "Create Template"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
