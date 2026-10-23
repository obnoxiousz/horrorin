import { api } from "./client";

export interface UploadResult {
  url: string;
}

/**
 * POST /api/public/upload with JSON { dataUrl } → { url }.
 * Backed by the Upload table; images are served by /api/public/files/[id].
 */
export const uploadApi = {
  acceptDataUrl(dataUrl: string) {
    return api.post<UploadResult>("/public/upload", { dataUrl });
  },
};
