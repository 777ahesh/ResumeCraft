import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Resume, InsertResume, UpdateResume } from "@shared/schema";

export function useResumes() {
  return useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/resumes");
      return response.json();
    },
  });
}

export function useResume(id: string) {
  return useQuery<Resume>({
    queryKey: ["/api/resumes", id],
    enabled: !!id,
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/resumes/${id}`);
      return response.json();
    },
  });
}

export function useCreateResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: InsertResume) => {
      const response = await apiRequest("POST", "/api/resumes", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
    onError: (error) => {
      console.error("Failed to create resume:", error);
    },
  });
}

export function useUpdateResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateResume }) => {
      const response = await apiRequest("PATCH", `/api/resumes/${id}`, data);
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes", id] });
    },
  });
}

export function useDeleteResume() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/resumes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
    },
  });
}
