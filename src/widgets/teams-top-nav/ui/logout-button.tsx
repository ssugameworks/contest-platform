"use client";

import IconArrowLeftBracketRightLine from "@karrotmarket/react-monochrome-icon/IconArrowLeftBracketRightLine";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

// Isolates the one interactive bit of TeamsTopNav (which otherwise renders
// fine as a Server Component) so the nav itself doesn't need "use client".
export function LogoutButton({
  action,
  redirectTo,
}: {
  action: () => Promise<void>;
  redirectTo: string;
}) {
  const router = useRouter();
  const [loggingOut, startLogout] = useTransition();

  return (
    <button
      type="button"
      aria-label="로그아웃"
      disabled={loggingOut}
      onClick={() =>
        startLogout(async () => {
          await action();
          router.push(redirectTo);
          router.refresh();
        })
      }
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 40,
        height: 40,
        border: "none",
        background: "transparent",
        color: "var(--seed-color-fg-neutral)",
        cursor: "pointer",
        opacity: loggingOut ? 0.5 : 1,
      }}
    >
      <IconArrowLeftBracketRightLine width={20} height={20} />
    </button>
  );
}
