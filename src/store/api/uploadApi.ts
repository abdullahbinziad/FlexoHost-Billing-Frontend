import { API_CONFIG } from "@/config/api";
import { getAccessToken } from "@/utils/tokenManager";

export async function uploadFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const token = getAccessToken();
  const res = await fetch(`${API_CONFIG.BASE_URL}/upload`, {
    method: "POST",
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.message || "Upload failed");
  }
  const data = await res.json();
  const url = data?.data?.url;
  if (!url) throw new Error("No URL in response");
  return url;
}
