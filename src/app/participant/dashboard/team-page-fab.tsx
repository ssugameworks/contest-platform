"use client";

import IconEyeFill from "@karrotmarket/react-monochrome-icon/IconEyeFill";
import { FloatingActionButton } from "@seed-design/react";
import Link from "next/link";

// 부모 레이아웃(layout.tsx)은 서버 컴포넌트라 @seed-design/react의
// FloatingActionButton 네임스페이스를 직접 import하면 RSC 경계에서
// "서버에서 클라이언트 export를 호출" 에러가 남 — 클라이언트 컴포넌트로
// 분리해 그 경계를 만들어줌.
export function TeamPageFab({ teamId }: { teamId: string }) {
  return (
    <div
      style={{
        position: "fixed",
        right: 20,
        bottom: "calc(var(--seed-safe-area-bottom) + 20px)",
        zIndex: 40,
      }}
    >
      <FloatingActionButton.Root asChild>
        <Link
          href={`/teams/${teamId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FloatingActionButton.Icon svg={<IconEyeFill />} />
          <FloatingActionButton.Label>
            내 팀 페이지 보기
          </FloatingActionButton.Label>
        </Link>
      </FloatingActionButton.Root>
    </div>
  );
}
