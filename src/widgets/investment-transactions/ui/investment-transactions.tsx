"use client";

import { MannerTemp } from "@seed-design/react";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useState } from "react";
import { Avatar } from "seed-design/ui/avatar";
import { IdentityPlaceholder } from "seed-design/ui/identity-placeholder";
import { List, ListDivider, ListItem } from "seed-design/ui/list";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "seed-design/ui/segmented-control";
import { getSeedAvatarUrl } from "@/shared/lib/seed-avatar";
import { getTransactionsAction } from "../model/actions";

const FILTERS = [
  { value: "all", label: "전체" },
  { value: "buy", label: "매수" },
  { value: "sell", label: "매도" },
] as const;

type Filter = (typeof FILTERS)[number]["value"];

export function InvestmentTransactions({
  teamId,
  anonymize = false,
}: {
  teamId: string;
  anonymize?: boolean;
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const { data: allTransactions = [] } = useQuery({
    queryKey: ["transactions", teamId, anonymize],
    queryFn: () => getTransactionsAction(teamId, anonymize),
  });
  const transactions = allTransactions.filter(
    (tx) => filter === "all" || tx.type === filter,
  );

  return (
    <div className="flex w-full flex-col gap-4">
      <SegmentedControl
        value={filter}
        onValueChange={(value) => setFilter(value as Filter)}
        aria-label="거래 유형"
      >
        {FILTERS.map((f) => (
          <SegmentedControlItem key={f.value} value={f.value}>
            {f.label}
          </SegmentedControlItem>
        ))}
      </SegmentedControl>

      <List width="full">
        {transactions.map((tx, index) => (
          <Fragment key={tx.id}>
            <ListItem
              prefix={
                <Avatar
                  size="36"
                  src={getSeedAvatarUrl(tx.investorId)}
                  fallback={<IdentityPlaceholder />}
                />
              }
              title={tx.investorName}
              suffix={
                <MannerTemp
                  level={tx.type === "buy" ? "l9" : "l2"}
                  style={{
                    color:
                      tx.type === "buy"
                        ? "var(--seed-color-fg-brand)"
                        : "var(--seed-color-fg-critical)",
                  }}
                >
                  {`${tx.type === "buy" ? "+" : "-"}${tx.amount.toLocaleString()}원`}
                </MannerTemp>
              }
            />
            {index < transactions.length - 1 && <ListDivider />}
          </Fragment>
        ))}
      </List>
    </div>
  );
}
