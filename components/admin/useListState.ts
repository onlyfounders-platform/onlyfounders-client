"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Filter + page state for admin lists, mirrored into the URL so a filtered
// view can be refreshed, bookmarked or shared. Search input is debounced.
export function useListState<T extends Record<string, string>>(defaults: T) {
  const params = useSearchParams();
  const router = useRouter();
  const init = Object.fromEntries(Object.keys(defaults).map(k => [k, params.get(k) ?? defaults[k]])) as T;
  const [filters, setFilters] = useState<T>(init);
  const [page, setPage] = useState(Number(params.get("page")) || 1);
  const [search, setSearch] = useState(params.get("search") ?? "");
  const [debounced, setDebounced] = useState(search);

  useEffect(() => { const t = setTimeout(() => setDebounced(search), 300); return () => clearTimeout(t); }, [search]);
  useEffect(() => { setPage(1); }, [debounced]);

  useEffect(() => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(filters)) if (v && v !== defaults[k]) q.set(k, v);
    if (debounced) q.set("search", debounced);
    if (page > 1) q.set("page", String(page));
    const next = q.toString();
    router.replace(next ? `?${next}` : "?", { scroll: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, debounced, page]);

  const setFilter = (k: keyof T, v: string) => { setFilters(f => ({ ...f, [k]: v })); setPage(1); };
  return { filters, setFilter, page, setPage, search, setSearch, debouncedSearch: debounced };
}
