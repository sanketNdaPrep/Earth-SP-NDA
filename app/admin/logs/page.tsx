"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { describeLog, type AdminLogAction, type AdminLogRow } from "@/lib/adminLog";
import { supabase } from "@/lib/supabaseClient";
import { Table, TableShell, TBody, Td, THead, Th, Tr } from "@/components/ui/data-table";
import { Notice } from "@/components/ui/notice";

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
  const [entity, setEntity] = React.useState<"all" | "subject" | "question" | "resource" | "mock_test">("all");

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
          The latest {LIMIT} admin actions on subjects, questions and study materials. Entries cannot be edited or deleted.
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
              <option value="resource">Study materials only</option>
              <option value="mock_test">Mock tests only</option>
            </Select>
            <Button variant="outline" size="sm" onClick={() => setVersion((v) => v + 1)}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error ? <Notice kind="error" reveal={false} title="Could not load">Could not load the logs: {error}</Notice> : null}
          {!rows && !error ? <p className="text-xs text-steel-300">Loading logs...</p> : null}
          {rows && rows.length === 0 ? <p className="text-xs text-steel-300">No actions recorded yet.</p> : null}
          {rows && rows.length > 0 ? (
            <TableShell>
              <Table>
                <caption className="sr-only">Recent admin actions, newest first</caption>
                <THead>
                  <Tr>
                    <Th>When</Th>
                    <Th>Action</Th>
                    <Th>What happened</Th>
                  </Tr>
                </THead>
                <TBody>
                  {rows.map((row) => (
                    <Tr key={row.id}>
                      <Td className="whitespace-nowrap text-steel-300">
                        <time dateTime={row.created_at}>{new Date(row.created_at).toLocaleString()}</time>
                      </Td>
                      <Td>
                        <Badge variant={ACTION_BADGE[row.action]}>{row.action}</Badge>
                      </Td>
                      <Td className="text-steel-100">{describeLog(row)}</Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </TableShell>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
