export type UserRole = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  can_upload: boolean;
  can_access_ai: boolean;
  status: 'active' | 'disabled';
  created_at: string;
}

export type DocumentStatus = 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Document {
  id: number;
  filename: string;
  title: string;
  category: string;
  file_size: number;
  mime_type: string;
  page_count: number;
  gemini_file_reference?: string | null;
  status: DocumentStatus;
  error_message?: string | null;
  uploaded_by: number;
  uploader_name?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SourceCitation {
  document_name: string;
  page_number?: number | null;
  snippet?: string | null;
}

export interface ChatMessage {
  id?: number | string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  created_at?: string;
  isPending?: boolean;
}

export interface ChatQueryResponse {
  answer: string;
  sources: SourceCitation[];
  disclaimer: string;
  document_id?: number | null;
  document_name?: string | null;
}

export interface AuditLog {
  id: number;
  user_id?: number | null;
  user_email: string;
  action: string;
  resource?: string | null;
  metadata_json?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_documents: number;
  total_users: number;
  ai_queries_today: number;
  storage_used_bytes: number;
  storage_used_formatted: string;
  active_document?: Document | null;
  recent_documents: Document[];
  recent_activity: AuditLog[];
}
