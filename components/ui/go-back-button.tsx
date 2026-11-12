"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

export interface GoBackButtonProps extends Omit<ButtonProps, "onClick" | "asChild"> {
  homeHref?: string;
}

function canGoBackOnSite(): boolean {
  const nav = (window as Window & { navigation?: { canGoBack: boolean } }).navigation;
  return nav ? nav.canGoBack : window.history.length > 1;
}

export function GoBackButton({ homeHref = "/", variant = "secondary", children = "Go back", ...props }: GoBackButtonProps) {
  const router = useRouter();
  return (
    <Button
      type="button"
      variant={variant}
      onClick={() => {
        if (canGoBackOnSite()) router.back();
        else router.push(homeHref);
      }}
      {...props}
    >
      <Icons.arrowLeft className="size-4 shrink-0" />
      {children}
    </Button>
  );
}

export default GoBackButton;