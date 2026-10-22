import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
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

export const categoryQueries = {
  all() {
    return {
      queryKey: queryKeys.categories.all,
      queryFn: (ctx: { signal?: AbortSignal }) =>
        categoriesApi.all({ signal: ctx.signal }),
    };
  },
};
