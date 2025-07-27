// Auth utility functions only - no hooks to avoid circular imports

// Additional auth utilities can be added here
export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("token", token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  const token = getAuthToken();
  return !!token;
};

// Auth headers for API requests
export const getAuthHeaders = (): Record<string, string> => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
