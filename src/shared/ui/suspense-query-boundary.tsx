"use client";

import { Suspense, type SuspenseProps } from "@suspensive/react";
import type { ComponentProps, ReactNode } from "react";
import { LoadingSpinner } from "./loading-spinner";
import { QueryErrorBoundary } from "./query-error-boundary";

/**
 * Standard suspensive wiring for a subtree that reads data via
 * useSuspenseQuery: an ErrorBoundary that resets the query error cache and
 * reports failures through the seed Snackbar, plus a Suspense fallback.
 * Override loadingFallback/errorFallback for sections with bespoke UI (e.g.
 * a disabled button, a table-row fallback, a dark-themed page).
 *
 * clientOnly defaults to true: queryFn here is always a Next.js Server
 * Action, and this fork of Next.js throws "Server Functions cannot be
 * called during initial render" if useSuspenseQuery's synchronous
 * fetchOptimistic call happens while the tree is server-rendered. Skipping
 * SSR for the boundary sidesteps that entirely. Pass clientOnly={false}
 * only for a query that can never suspend during the initial render (e.g.
 * seeded via `initialData` from a Server Component prop).
 */
export function SuspenseQueryBoundary({
  children,
  loadingFallback = <LoadingSpinner />,
  errorFallback,
  clientOnly = true,
}: {
  children: ReactNode;
  loadingFallback?: SuspenseProps["fallback"];
  errorFallback?: ComponentProps<typeof QueryErrorBoundary>["fallback"];
  clientOnly?: boolean;
}) {
  return (
    <QueryErrorBoundary fallback={errorFallback}>
      <Suspense clientOnly={clientOnly} fallback={loadingFallback}>
        {children}
      </Suspense>
    </QueryErrorBoundary>
  );
}
