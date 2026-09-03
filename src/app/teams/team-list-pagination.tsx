"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Pagination } from "seed-design/ui/pagination";

export function TeamListPagination({
  page,
  totalPages,
}: {
  page: number;
  totalPages: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePageChange = (nextPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Pagination
      totalPages={totalPages}
      page={page}
      onPageChange={handlePageChange}
      aria-label="팀 목록 페이지"
    />
  );
}
