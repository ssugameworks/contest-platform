"use client";

import {
  type DefaultError,
  type QueryClient,
  type QueryFunction,
  type QueryKey,
  type SuspenseQueriesOptions,
  type SuspenseQueriesResults,
  type UseSuspenseQueryOptions,
  type UseSuspenseQueryResult,
  useSuspenseQueries as useTanstackSuspenseQueries,
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
function deferQueryFn<TQueryFnData, TQueryKey extends QueryKey>(
  queryFn: QueryFunction<TQueryFnData, TQueryKey> | undefined,
): QueryFunction<TQueryFnData, TQueryKey> | undefined {
  return typeof queryFn === "function"
    ? (context) => Promise.resolve().then(() => queryFn(context))
    : queryFn;
}

export function useSuspenseQuery<
  TQueryFnData = unknown,
  TError = DefaultError,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
  queryClient?: QueryClient,
): UseSuspenseQueryResult<TData, TError> {
  return useTanstackSuspenseQuery(
    {
      ...options,
      queryFn: deferQueryFn(options.queryFn),
    } as UseSuspenseQueryOptions<TQueryFnData, TError, TData, TQueryKey>,
    queryClient,
  );
}

// A component calling useSuspenseQuery multiple times in a row suspends on
// the first unresolved query, so later hooks in that render don't even run
// until the first one settles — independent queries end up fetched one
// after another instead of in parallel. useSuspenseQueries fires every
// queryFn up front and suspends once until all of them settle. Each
// queryFn still gets the same microtask deferral as useSuspenseQuery above.
export function useSuspenseQueries<
  T extends Array<unknown>,
  TCombinedResult = SuspenseQueriesResults<T>,
>(
  options: {
    queries: readonly [...SuspenseQueriesOptions<T>];
    combine?: (result: SuspenseQueriesResults<T>) => TCombinedResult;
  },
  queryClient?: QueryClient,
): TCombinedResult {
  const queries = (
    options.queries as ReadonlyArray<UseSuspenseQueryOptions>
  ).map((query) => ({
    ...query,
    queryFn: deferQueryFn(query.queryFn),
  })) as unknown as typeof options.queries;

  return useTanstackSuspenseQueries(
    { queries, combine: options.combine },
    queryClient,
  );
}
