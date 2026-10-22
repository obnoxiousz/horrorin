import { api } from "./client";

// NOTE: /api/public/upload has no server-side route yet — every call fails
// with 404 today. This module models the existing call (JSON body with a
// dataUrl) exactly; creating the missing route is out of scope.
export const uploadApi = {
  acceptDataUrl(dataUrl: string) {
    return api.post<{ url: string }>("/upload", { dataUrl });
  },
};
