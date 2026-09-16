import IconChevronLeftLine from "@karrotmarket/react-monochrome-icon/IconChevronLeftLine";
import { Box, HStack, Text } from "@seed-design/react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

// SEED Design의 Top Navigation 스펙(Root/Standard 타입, Left/Main/Right 슬롯)을
// 그대로 따르되, React 구현체(seed-design/ui/app-bar.tsx)가 Stackflow
// 전용이라 plain 컴포넌트로 재구현함 — AppBarBackButton은 Stackflow의
// <Stack> 없이는 항상 null을 반환해서 이 프로젝트(순수 Next.js App
// Router)에서는 못 씀.
export function TeamsTopNav({
  variant,
  title,
  logout,
}: {
  variant: "root" | "standard";
  title?: string;
  /** 로그인된 사용자(참가자/투자자)일 때만 넘겨서 우측에 로그아웃 버튼을 보여줘요 — 이 화면들엔 별도 사이드바가 없어서 로그아웃할 방법이 따로 없어요. */
  logout?: { action: () => Promise<void>; redirectTo: string };
}) {
  return (
    <Box
      position="sticky"
      style={{ top: 0, zIndex: 30 }}
      bg="bg.layerDefault"
      width="full"
    >
      <HStack
        align="center"
        gap="x2"
        width="full"
        py="x3"
        px="spacingX.globalGutter"
      >
        <Box style={{ width: 40, height: 40, flexShrink: 0 }}>
          {variant === "standard" && (
            <Link
              href="/teams"
              aria-label="목록으로"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 40,
                height: 40,
                color: "var(--seed-color-fg-neutral)",
              }}
            >
              <IconChevronLeftLine width={24} height={24} />
            </Link>
          )}
        </Box>

        <Box
          flexGrow={1}
          style={{ textAlign: variant === "root" ? "left" : "center" }}
        >
          {title && <Text textStyle="t5Bold">{title}</Text>}
        </Box>

        <Box
          style={{
            width: 40,
            height: 40,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {logout && <LogoutButton {...logout} />}
        </Box>
      </HStack>
    </Box>
  );
}
