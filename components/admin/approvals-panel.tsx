"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AdminRow = {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
  approved: boolean;
};

/** Lists admin accounts and lets an approved admin approve or revoke them. */
export function ApprovalsPanel() {
  const [rows, setRows] = React.useState<AdminRow[] | null>(null);
  const [meId, setMeId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const [version, setVersion] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    fetch("/api/admin/approvals", { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (!data.ok) {
          setError(data.error ?? "Could not load admin accounts.");
          return;
        }
        setRows(data.admins);
        setMeId(data.meId);
        setError(null);
      })
      .catch(() => {
        if (!cancelled) setError("Network error while loading admin accounts.");
      });
    return () => {
      cancelled = true;
    };
  }, [version]);

  const decide = async (userId: string, approve: boolean) => {
    setBusyId(userId);
    try {
      const res = await fetch("/api/admin/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, approve }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.error ?? "Could not update this account.");
      else setVersion((v) => v + 1);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const pending = rows?.filter((r) => !r.approved).length ?? 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Admin Approvals</CardTitle>
        {rows ? (
          <Badge variant={pending > 0 ? "gold" : "outline"}>{pending} pending</Badge>
        ) : null}
      </CardHeader>
      <CardContent>
        {error ? (
          <p role="alert" className="mb-3 text-xs text-danger-300">
            {error}
          </p>
        ) : null}
        {rows === null && !error ? (
          <p className="text-xs text-steel-300">Loading admin accounts...</p>
        ) : null}
        {rows && rows.length === 0 ? (
          <p className="text-xs text-steel-300">No admin accounts yet.</p>
        ) : null}
        {rows && rows.length > 0 ? (
          <ul className="divide-y divide-steel-700/50">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-3 text-xs">
                <div>
                  <div className="font-semibold text-white">{r.fullName || r.email}</div>
                  <div className="text-steel-500">{r.email}</div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.approved ? "emerald" : "outline"}>
                    {r.approved ? "Approved" : "Pending"}
                  </Badge>
                  {r.approved ? (
                    r.id === meId ? null : (
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busyId === r.id}
                        onClick={() => decide(r.id, false)}
                        aria-label={`Revoke access for ${r.email}`}
                      >
                        Revoke
                      </Button>
                    )
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={busyId === r.id}
                      onClick={() => decide(r.id, true)}
                      aria-label={`Approve ${r.email}`}
                    >
                      Approve
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
