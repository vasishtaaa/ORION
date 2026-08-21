'use client';
import React, { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={twMerge(
        clsx(
          'animate-pulse rounded-xl bg-[rgba(80,200,120,0.08)] border border-[rgba(80,200,120,0.05)]',
          className
        )
      )}
      {...props}
    />
  );
}

export function ChartSkeleton() {
  return (
    <div className="w-full h-full min-h-[380px] p-6 flex flex-col justify-between gap-4">
      <div className="flex justify-between items-center">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="flex-1 flex items-end gap-2 pt-8">
        {Array.from({ length: 24 }).map((_, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-t-sm"
            style={{ height: `${Math.max(15, Math.sin(i / 3) * 60 + 35)}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}
