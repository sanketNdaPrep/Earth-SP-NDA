"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/ui/icons";
import { Input } from "@/components/ui/input";
import { Skeleton, SkeletonGroup } from "@/components/ui/skeleton";
import { resourceKind } from "@/lib/resources";
import { supabase } from "@/lib/supabaseClient";

interface Material {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  size: string | null;
  recommended_for: string | null;
  download_url: string;
  file_type: string | null;
  downloads: number;
}

const COLUMNS = "id, title, description, category, size, recommended_for, download_url, file_type, downloads";
const UNCATEGORISED = "Other";

/**
 * Every study material the admins have uploaded, as cards with search and
 * category filters. Anyone can use it, signed in or not.
 */
export function MaterialLibrary() {
  const [items, setItems] = React.useState<Material[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [counted, setCounted] = React.useState<ReadonlySet<string>>(new Set());

  React.useEffect(() => {
    let active = true;
    supabase
      .from("resources")
      .select(COLUMNS)
      .order("created_at", { ascending: false })
      .then(({ data, error: loadError }) => {
        if (!active) return;
        if (loadError) {
          setError(loadError.message);
          setItems([]);
          return;
        }
        setItems((data ?? []) as Material[]);
      });
    return () => {
      active = false;
    };
  }, []);

  const categories = React.useMemo(() => {
    const names = new Set((items ?? []).map((m) => m.category?.trim() || UNCATEGORISED));
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [items]);

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return (items ?? []).filter((m) => {
      const cat = m.category?.trim() || UNCATEGORISED;
      if (category !== "all" && cat !== category) return false;
      if (!q) return true;
      return [m.title, m.description, cat, m.recommended_for].some((field) => field?.toLowerCase().includes(q));
    });
  }, [items, search, category]);

  // Count each file once per visit. The counter is a convenience, so a failure is ignored.
  const countDownload = (id: string) => {
    if (counted.has(id)) return;
    setCounted((prev) => new Set(prev).add(id));
    // Supabase only sends the request once the call is awaited or chained with then.
    supabase
      .rpc("increment_resource_downloads", { p_resource_id: id })
      .then(() => undefined);
  };

  if (items === null) {
    return (
      <SkeletonGroup label="Loading study material" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-56 w-full rounded-panel" />
        ))}
      </SkeletonGroup>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-control border border-danger-500/40 bg-danger-500/10 p-3 text-xs font-semibold text-danger-400">
          Study material could not be loaded: {error}
        </p>
      ) : null}

      {items.length === 0 && !error ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-lg font-bold text-white">No study material yet</p>
            <p className="mt-2 text-sm text-steel-300">
              Notes, flashcards and papers show up here as soon as they are uploaded. Check back soon.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {items.length > 0 ? (
        <>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="w-full lg:max-w-sm">
              <label htmlFor="material-search" className="sr-only">
                Search study material
              </label>
              <Input
                id="material-search"
                type="search"
                placeholder="Search by title, topic or exam..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
              {["all", ...categories].map((name) => (
                <Button
                  key={name}
                  size="sm"
                  variant={category === name ? "primary" : "outline"}
                  aria-pressed={category === name}
                  onClick={() => setCategory(name)}
                >
                  {name === "all" ? "All" : name}
                </Button>
              ))}
            </div>
          </div>

          <p role="status" className="text-xs tabular-nums text-steel-300">
            {visible.length} {visible.length === 1 ? "file" : "files"}
          </p>

          {visible.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-sm text-steel-300">
                Nothing matches that search. Try a different word or choose All.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {visible.map((m) => {
                const kind = resourceKind(m);
                const usable = Boolean(m.download_url) && m.download_url !== "#";
                const shown = m.downloads + (counted.has(m.id) ? 1 : 0);
                return (
                  <Card key={m.id} className="flex flex-col justify-between">
                    <CardHeader className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{m.category?.trim() || UNCATEGORISED}</Badge>
                        <Badge variant={kind === "pdf" ? "gold" : "emerald"}>{kind === "pdf" ? "PDF" : "Image"}</Badge>
                      </div>
                      <CardTitle className="text-lg">{m.title}</CardTitle>
                      {m.description ? <p className="text-sm text-steel-300">{m.description}</p> : null}
                      {m.recommended_for ? (
                        <p className="text-xs text-steel-500">Recommended for {m.recommended_for}</p>
                      ) : null}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between gap-3 border-t border-steel-700/60 pt-4">
                        <span className="font-mono text-xs text-steel-300">
                          {m.size ? `${m.size} · ` : ""}
                          <span className="tabular-nums">{shown}</span> {shown === 1 ? "download" : "downloads"}
                        </span>
                        {usable ? (
                          <Button asChild variant="primary" size="sm">
                            <a
                              href={m.download_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => countDownload(m.id)}
                            >
                              <Icons.download className="size-4" />
                              Download<span className="sr-only"> {m.title} (opens in a new tab)</span>
                            </a>
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Unavailable
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      ) : null}
    </div>
  );
}
