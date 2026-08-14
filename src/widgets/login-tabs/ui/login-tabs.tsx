"use client";

import { VStack } from "@seed-design/react";
import { useState } from "react";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "seed-design/ui/segmented-control";
import { InvestorLoginForm } from "@/features/login-investor";
import { ParticipantLoginForm } from "@/features/login-participant";

const TABS = [
  { value: "investor", label: "투자자" },
  { value: "participant", label: "참가자" },
] as const;

type Tab = (typeof TABS)[number]["value"];

export function LoginTabs() {
  const [tab, setTab] = useState<Tab>("investor");

  return (
    <VStack gap="spacingY.componentDefault" width="full">
      <SegmentedControl
        value={tab}
        onValueChange={(value) => setTab(value as Tab)}
        aria-label="로그인 유형"
      >
        {TABS.map((t) => (
          <SegmentedControlItem key={t.value} value={t.value}>
            {t.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      {tab === "investor" ? <InvestorLoginForm /> : <ParticipantLoginForm />}
    </VStack>
  );
}
