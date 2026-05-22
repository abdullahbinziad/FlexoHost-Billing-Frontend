import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/utils/tokenManager";

export interface MigrationResult {
  success: boolean;
  import?: { success: boolean; message?: string };
  migration?: {
    clients?: { clients: number; users: number };
    products?: number;
    servers?: number;
    orders?: number;
    invoices?: number;
    services?: number;
    transactions?: number;
  };
  error?: string;
}

export async function uploadAndMigrateWhmcs(file: File): Promise<MigrationResult> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAccessToken();
  const res = await fetch(`${API_CONFIG.BASE_URL}/admin/migration/whmcs/upload-and-migrate`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message ?? (typeof data?.error === "string" ? data.error : data?.error?.error) ?? "Migration failed";
    throw new Error(msg);
  }
  return data?.data ?? data;
}
