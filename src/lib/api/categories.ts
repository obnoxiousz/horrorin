import { api, type ClientOptions } from "./client";
import type { CategoryWithCount, TemplateDTO } from "@/types";

export interface CategoryListResponse {
  categories: CategoryWithCount[];
  templates: TemplateDTO[];
}

export const categoriesApi = {
  all(opts?: ClientOptions) {
    return api.get<CategoryListResponse>("/categories", {
      signal: opts?.signal,
    });
  },
};
