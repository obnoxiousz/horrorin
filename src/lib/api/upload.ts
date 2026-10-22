import { api } from "./client";

export interface UploadResult {
  url: string;
}

/**
 * POST /public/upload with JSON { dataUrl }.
 * NOTE: no route.ts exists under src/app/api/public/upload yet —
 * this call 404s server-side today; this file only models the existing client call.
 */
export const uploadApi = {
  acceptDataUrl(dataUrl: string) {
    return api.post<UploadResult>("/public/upload", { dataUrl });
  },
};
