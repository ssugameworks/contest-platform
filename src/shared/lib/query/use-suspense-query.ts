"use client";

import {
  type DefaultError,
  type QueryClient,
  type QueryFunction,
  type QueryKey,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQuery as useTanstackSuspenseQuery,
} from "@tanstack/react-query";

// useSuspenseQuery calls queryFn synchronously mid-render to obtain a
// throwable promise (see fetchOptimistic in @tanstack/react-query's
// suspense.ts). Every queryFn in this app is a Next.js Server Action, and
// invoking one synchronously during another component's render trips
// React's "Cannot update a component while rendering a different
// component" check — Next's client dispatch wraps every Server Action call
// in startTransition. Deferring the actual call by one microtask breaks
// that same-call-stack coupling without changing when data resolves in any
// way that matters.
export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError> {
  const { queryFn, ...rest } = options;
  const deferredQueryFn =
    typeof queryFn === "function"
      ? (((context) =>
          Promise.resolve().then(() =>
            queryFn(context),
          )) satisfies QueryFunction<TQueryFnData, TQueryKey>)
      : queryFn;

  return useTanstackSuspenseQuery(
    { ...rest, queryFn: deferredQueryFn } as UseSuspenseQueryOptions<
      TQueryFnData,
      TError,
      TData,
      TQueryKey
    >,
    queryClient,
  );
}
