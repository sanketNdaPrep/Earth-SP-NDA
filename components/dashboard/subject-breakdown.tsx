"use client";

import * as React from "react";

export interface SubjectStat {
  name?: string;
  subject?: string;
  accuracy?: number;
  score?: number;
  [key: string]: any;
}

export interface SubjectBreakdownProps {
  stats?: SubjectStat[] | any;
  delay?: number;
  subjects?: any;
  items?: any;
  className?: string;
  [key: string]: any;
}

export function SubjectBreakdown({
  stats,
  delay,
  subjects,
  items,
  className,
  ...props
}: SubjectBreakdownProps) {
  const list = stats || subjects || items || [];
  return (
    <div className={className} {...props}>
      {Array.isArray(list) &&
        list.map((item: any, idx: number) => (
          <div key={idx} className="flex items-center justify-between py-2 text-xs">
            <span className="text-white">{item.name || item.subject}</span>
            <span className="font-mono text-gold-300">{item.accuracy || item.score}%</span>
          </div>
        ))}
    </div>
  );
}

export default SubjectBreakdown;