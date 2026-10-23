import { api, type ClientOptions } from "./client";
import { queryKeys } from "@/lib/query-keys";
import { queryOptions } from "@tanstack/react-query";
import type { CategoryWithCount } from "@/types";

export interface CategoriesResponse {
  categories: CategoryWithCount[];
}

export const categoriesApi = {
  all(opts?: ClientOptions) {
    return api.get<CategoriesResponse>("/public/categories", {
      signal: opts?.signal,
    });
  },
};

export const categoryQueries = {
  all() {
    return queryOptions({
      queryKey: queryKeys.categories.list(),
      queryFn: (ctx: { signal?: AbortSignal }) =>
        categoriesApi.all({ signal: ctx.signal }),
      staleTime: 5 * 60_000,
    });
  },
};
