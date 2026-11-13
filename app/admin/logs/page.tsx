"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { describeLog, type AdminLogAction, type AdminLogRow } from "@/lib/adminLog";
import { supabase } from "@/lib/supabaseClient";

const ACTION_BADGE: Record<AdminLogAction, "emerald" | "gold" | "outline" | "danger"> = {
  added: "emerald",
  edited: "gold",
  activated: "emerald",
  deactivated: "outline",
  deleted: "danger",
};

const LIMIT = 100;

export default function AdminLogsPage() {
  const [rows, setRows] = React.useState<AdminLogRow[] | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState(0);
  const [entity, setEntity] = React.useState<"all" | "subject" | "question">("all");

  React.useEffect(() => {
    let active = true;
    let query = supabase
      .from("admin_logs")
      .select("id, action, entity_type, details, created_at, admin_profiles(full_name, email)")
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    if (entity !== "all") query = query.eq("entity_type", entity);
    query.then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) {
        setError(queryError.message);
        return;
      }
      setError(null);
      setRows((data ?? []) as unknown as AdminLogRow[]);
    });
    return () => {
      active = false;
    };
  }, [entity, version]);

  return (
    <div className="space-y-8">
      <div>
        <Badge variant="gold" className="mb-2">Security</Badge>
        <h1 className="text-3xl font-bold tracking-tight text-white">Audit Logs</h1>
        <p className="mt-1 text-sm text-steel-300">
          The latest {LIMIT} admin actions on subjects and questions. Entries cannot be edited or deleted.
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3">
          <CardTitle className="text-lg">Recent Actions</CardTitle>
          <div className="flex items-center gap-3">
            <label htmlFor="log-filter" className="sr-only">Filter by type</label>
            <Select id="log-filter" value={entity} onChange={(e) => setEntity(e.target.value as typeof entity)}>
              <option value="all">All actions</option>
              <option value="subject">Subjects only</option>
              <option value="question">Questions only</option>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setVersion((v) => v + 1)}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <p role="alert" className="text-xs text-danger-300">Could not load the logs: {error}</p> : null}
          {!rows && !error ? <p className="text-xs text-steel-300">Loading logs...</p> : null}
          {rows && rows.length === 0 ? <p className="text-xs text-steel-300">No actions recorded yet.</p> : null}
          {rows && rows.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-lg text-left text-xs">
                <caption className="sr-only">Recent admin actions, newest first</caption>
                <thead className="text-steel-500">
                  <tr className="border-b border-steel-700/60">
                    <th scope="col" className="py-2 pr-4 font-semibold uppercase tracking-wider">When</th>
                    <th scope="col" className="py-2 pr-4 font-semibold uppercase tracking-wider">Action</th>
                    <th scope="col" className="py-2 font-semibold uppercase tracking-wider">What happened</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-steel-700/40">
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td className="whitespace-nowrap py-3 pr-4 text-steel-300">
                        <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={ACTION_BADGE[row.action]}>{row.action}</Badge>
                      </td>
                      <td className="py-3 text-steel-100">{describeLog(row)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
