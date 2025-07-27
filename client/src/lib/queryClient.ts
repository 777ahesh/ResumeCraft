import { QueryClient } from "@tanstack/react-query";

const API_BASE_URL = "";

// Simple function to get auth token
const getToken = (): string | null => {
  return localStorage.getItem("token");
};

// Unified API request function that ALWAYS includes auth token
export async function apiRequest(
  method: string,
  path: string,
  body?: any
): Promise<Response> {
  const url = `${API_BASE_URL}${path}`;
  
  // Always include Authorization header if token exists
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(url, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(errorData.message || `HTTP ${response.status}`);
  }

  return response;
}

// Simple QueryClient with no default queryFn - forces explicit queryFn usage
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});