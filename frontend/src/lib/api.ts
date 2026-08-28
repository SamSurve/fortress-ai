import {
  User,
  Document,
  ChatMessage,
  ChatQueryResponse,
  AuditLog,
  DashboardStats
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const TOKEN_KEY = "fortress_auth_token";
const USER_KEY = "fortress_user_data";

export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: User | null) {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers["Authorization"]) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${API_BASE}${endpoint}`;

  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (err: any) {
    throw new Error(`Cannot connect to FORTRESS AI server at ${API_BASE}. Please ensure the backend is running.`);
  }

  if (response.status === 401) {
    // Clear credentials on unauthorized
    if (typeof window !== "undefined" && !endpoint.includes("/auth/login")) {
      setStoredToken(null);
      setStoredUser(null);
    }
  }

  if (!response.ok) {
    let errorDetail = `Request failed (${response.status})`;
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errData.message || errorDetail;
    } catch {
      // ignore
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

// ----------------- AUTH API -----------------
export const authApi = {
  login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request<{ access_token: string; user: User }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
  signup: async (name: string, email: string, password: string): Promise<{ access_token: string; user: User }> => {
    return request<{ access_token: string; user: User }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
  },
  logout: async (): Promise<{ message: string }> => {
    try {
      return await request<{ message: string }>("/auth/logout", { method: "POST" });
    } finally {
      setStoredToken(null);
      setStoredUser(null);
    }
  },
  getMe: async (): Promise<User> => {
    return request<User>("/auth/me");
  },
};

// ----------------- DOCUMENTS API -----------------
export const docApi = {
  upload: async (file: File, title?: string, category?: string): Promise<Document> => {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (category) formData.append("category", category);

    return request<Document>("/documents/upload", {
      method: "POST",
      body: formData,
    });
  },
  list: async (): Promise<Document[]> => {
    return request<Document[]>("/documents");
  },
  getActive: async (): Promise<{ has_active_document: boolean; document: Document | null }> => {
    return request<{ has_active_document: boolean; document: Document | null }>("/documents/active/latest");
  },
  getById: async (id: number): Promise<Document> => {
    return request<Document>(`/documents/${id}`);
  },
  delete: async (id: number): Promise<{ message: string }> => {
    return request<{ message: string }>(`/documents/${id}`, {
      method: "DELETE",
    });
  },
};

// ----------------- CHAT API -----------------
export const chatApi = {
  query: async (question: string, document_id?: number | null): Promise<ChatQueryResponse> => {
    return request<ChatQueryResponse>("/chat/query", {
      method: "POST",
      body: JSON.stringify({ question, document_id }),
    });
  },
  getHistory: async (): Promise<ChatMessage[]> => {
    return request<ChatMessage[]>("/chat/history");
  },
  clearHistory: async (): Promise<{ message: string }> => {
    return request<{ message: string }>("/chat/history", {
      method: "DELETE",
    });
  },
};

// ----------------- USERS & RBAC API -----------------
export const userApi = {
  list: async (): Promise<User[]> => {
    return request<User[]>("/users");
  },
  updatePermissions: async (
    userId: number,
    perms: { can_upload?: boolean; can_access_ai?: boolean; status?: string; role?: string }
  ): Promise<User> => {
    return request<User>(`/users/${userId}/permissions`, {
      method: "PATCH",
      body: JSON.stringify(perms),
    });
  },
  create: async (data: { name: string; email: string; password: string; role: string; can_upload?: boolean; can_access_ai?: boolean }): Promise<User> => {
    return request<User>("/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
};

// ----------------- AUDIT & STATS API -----------------
export const auditApi = {
  getLogs: async (limit: number = 50, offset: number = 0, action?: string): Promise<AuditLog[]> => {
    let q = `?limit=${limit}&offset=${offset}`;
    if (action) q += `&action=${encodeURIComponent(action)}`;
    return request<AuditLog[]>(`/audit-logs${q}`);
  },
  getDashboardStats: async (): Promise<DashboardStats> => {
    return request<DashboardStats>("/dashboard/stats");
  },
};
