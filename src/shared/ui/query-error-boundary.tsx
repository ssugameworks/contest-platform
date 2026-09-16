"use client";

import {
  ErrorBoundary,
  useErrorBoundaryFallbackProps,
} from "@suspensive/react";
import { useQueryErrorResetBoundary } from "@tanstack/react-query";
import {
  type ComponentPropsWithoutRef,
  type ComponentRef,
  forwardRef,
  useEffect,
} from "react";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "문제가 발생했어요";
}

// The boundary's own default fallback: renders nothing and reports the
// error through the app's snackbar instead, with a retry action wired to
// the boundary's reset.
function DefaultQueryErrorFallback() {
  const { error, reset } = useErrorBoundaryFallbackProps();
  const adapter = useSnackbarAdapter();

  useEffect(() => {
    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar
          message={getErrorMessage(error)}
          actionLabel="다시 시도"
          onAction={reset}
        />
      ),
    });
    // Only a new error should raise a new toast, not every re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, adapter.create, reset]);

  return null;
}

/**
 * ErrorBoundary for suspense queries: resets TanStack Query's error cache
 * together with the boundary (see @suspensive/react-query-5's
 * suspensive-react composition skill — QueryErrorBoundary replacement),
 * and reports uncaught query errors through the seed Snackbar by default.
 */
export const QueryErrorBoundary = forwardRef<
  ComponentRef<typeof ErrorBoundary>,
  ComponentPropsWithoutRef<typeof ErrorBoundary>
>(({ onReset, fallback, ...props }, resetRef) => {
  const { reset } = useQueryErrorResetBoundary();
  return (
    <ErrorBoundary
      {...props}
      fallback={fallback ?? <DefaultQueryErrorFallback />}
      onReset={() => {
        onReset?.();
        reset();
      }}
      ref={resetRef}
    />
  );
});
QueryErrorBoundary.displayName = "QueryErrorBoundary";

export { getErrorMessage };
