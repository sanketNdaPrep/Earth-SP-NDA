"use client";

import * as React from "react";
import { Dock, DockItem } from "@/components/ui/dock";
import { Icons } from "@/components/ui/icons";

/** Four real destinations, the same ones the 404 page offers. */
export function DockDemo({ current = "/" }: { current?: string }) {
  return (
    <Dock label="Quick links">
      <DockItem label="Home" href="/" current={current === "/"}>
        <Icons.home className="size-5" />
      </DockItem>
      <DockItem label="Practice tests" href="/quizzes" current={current === "/quizzes"}>
        <Icons.clipboardCheck className="size-5" />
      </DockItem>
      <DockItem label="Notes" href="/#vault">
        <Icons.book className="size-5" />
      </DockItem>
      <DockItem label="Dashboard" href="/dashboard" current={current === "/dashboard"}>
        <Icons.layoutDashboard className="size-5" />
      </DockItem>
    </Dock>
  );
}

/** Button items, for actions that are not page links. */
export function DockButtonDemo() {
  const [message, setMessage] = React.useState("Press an item.");
  return (
    <div className="flex flex-col items-start gap-3">
      <Dock label="Study actions">
        <DockItem label="Start a mock test" onClick={() => setMessage("Start a mock test pressed.")}>
          <Icons.clipboardCheck className="size-5" />
        </DockItem>
        <DockItem label="Open notes" onClick={() => setMessage("Open notes pressed.")}>
          <Icons.book className="size-5" />
        </DockItem>
        <DockItem label="Practise calculation" onClick={() => setMessage("Practise calculation pressed.")}>
          <Icons.calculator className="size-5" />
        </DockItem>
      </Dock>
      <p role="status" data-dock-status className="text-sm text-steel-300">{message}</p>
    </div>
  );
}