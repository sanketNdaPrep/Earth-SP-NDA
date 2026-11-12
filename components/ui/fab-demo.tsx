"use client";

import * as React from "react";
import { Fab, type FabDirection } from "@/components/ui/fab";
import { Icons } from "@/components/ui/icons";

const frame = "relative h-80 w-full max-w-md overflow-hidden rounded-panel border border-steel-700 bg-navy-900";

/** The usual corner placement, with a button action that updates a status line. */
export function FabDemo() {
  const [message, setMessage] = React.useState("Open the menu and pick an action.");
  return (
    <div className="flex flex-col gap-3">
      <div className={frame}>
        <Fab
          label="Quick actions"
          className="absolute bottom-4 right-4"
          actions={[
            { label: "Start a mock test", href: "/quizzes", icon: <Icons.clipboardCheck className="size-5" /> },
            { label: "Open notes", href: "/#vault", icon: <Icons.book className="size-5" /> },
            {
              label: "Practise calculation",
              onClick: () => setMessage("Practise calculation chosen."),
              icon: <Icons.calculator className="size-5" />,
            },
          ]}
        />
      </div>
      <p role="status" data-fab-status className="text-sm text-steel-300">{message}</p>
    </div>
  );
}

const placements: Record<FabDirection, string> = {
  "up-left": "absolute bottom-4 right-4",
  up: "absolute bottom-4 left-1/2 -ml-7",
  "up-right": "absolute bottom-4 left-4",
};

/** The other two directions, with two actions and four actions. */
export function FabDirectionDemo({ direction }: { direction: Exclude<FabDirection, "up-left"> }) {
  const four = direction === "up";
  return (
    <div className={frame}>
      <Fab
        label={`Quick actions, opens ${direction}`}
        direction={direction}
        className={placements[direction]}
        actions={
          four
            ? [
                { label: "Start a mock test", href: "/quizzes", icon: <Icons.clipboardCheck className="size-5" /> },
                { label: "Open notes", href: "/#vault", icon: <Icons.book className="size-5" /> },
                { label: "Open dashboard", href: "/dashboard", icon: <Icons.layoutDashboard className="size-5" /> },
                { label: "Home", href: "/", icon: <Icons.home className="size-5" /> },
              ]
            : [
                { label: "Start a mock test", href: "/quizzes", icon: <Icons.clipboardCheck className="size-5" /> },
                { label: "Open notes", href: "/#vault", icon: <Icons.book className="size-5" /> },
              ]
        }
      />
    </div>
  );
}