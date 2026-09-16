"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowRightLine } from "@karrotmarket/react-monochrome-icon";
import NumberFlow from "@number-flow/react";
import { Box, HStack, Icon, Text, VStack } from "@seed-design/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import {
  BottomSheetBody,
  BottomSheetContent,
  BottomSheetFooter,
  BottomSheetRoot,
  BottomSheetTrigger,
} from "seed-design/ui/bottom-sheet";
import {
  Snackbar,
  SnackbarAvoidOverlap,
  useSnackbarAdapter,
} from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { useSuspenseQuery } from "@/shared/lib/query/use-suspense-query";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";
import { getTradeContextAction, placeTradeAction } from "../model/actions";
import {
  createTradeAmountSchema,
  type TradeAmountInput,
} from "../model/schema";

const PRESET_UNITS = [10_000, 30_000, 50_000] as const;

type TradeType = "buy" | "sell";

function investButtonFallback(label: string) {
  return (
    <ActionButton variant="brandSolid" size="large" className="w-full" disabled>
      {label}
    </ActionButton>
  );
}

export function InvestButton(props: { teamId: string; teamName: string }) {
  return (
    <SuspenseQueryBoundary
      loadingFallback={investButtonFallback("불러오는 중...")}
      errorFallback={investButtonFallback("투자 정보를 불러오지 못했어요")}
    >
      <InvestButtonContent {...props} />
    </SuspenseQueryBoundary>
  );
}

function InvestButtonContent({
  teamId,
  teamName,
}: {
  teamId: string;
  teamName: string;
}) {
  const adapter = useSnackbarAdapter();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState<TradeType>("buy");

  const queryKey = ["trade-context", teamId];
  const { data: context } = useSuspenseQuery({
    queryKey,
    queryFn: () => getTradeContextAction(teamId),
  });
  // InvestButton only mounts once the parent has confirmed currentUser.kind
  // === "investor" (see team-showcase.tsx), so a null context here means
  // the investor session lapsed between that check and this query — an
  // error, not a normal empty state. Throwing surfaces SuspenseQueryBoundary's
  // errorFallback instead of silently showing a 0 budget with an active buy
  // button that would only fail once the user gets to submit.
  if (!context) throw new Error("투자 정보를 불러오지 못했어요");
  const remainingBudget = context.remainingBudget;
  const myHolding = context.holding;

  const maxAmount = tradeType === "buy" ? remainingBudget : myHolding;
  const schema = useMemo(
    () => createTradeAmountSchema(Math.max(maxAmount, 0)),
    [maxAmount],
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    setError,
    formState: { errors },
  } = useForm<TradeAmountInput>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const watchedAmount = useWatch({ control, name: "amount" });

  const tradeMutation = useMutation({
    mutationFn: ({ amount }: TradeAmountInput) => {
      return placeTradeAction(teamId, tradeType, amount);
    },
    onSuccess: (_, { amount }) => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ["transactions", teamId] });
      // amount/rank/investorCount on the team page are server-rendered
      // props, not react-query — refresh the route to pick up new totals.
      router.refresh();
      adapter.create({
        onClose: () => {},
        render: () => (
          <Snackbar
            message={`${amount.toLocaleString()}원 ${tradeType === "buy" ? "투자" : "매도"}했어요`}
          />
        ),
      });
      reset({ amount: 0 });
      setOpen(false);
    },
    onError: (error) => {
      setError("amount", { message: error.message });
    },
  });

  const onSubmit = handleSubmit((data) => tradeMutation.mutate(data));

  const openTrade = (type: TradeType) => {
    setTradeType(type);
    reset({ amount: 0 });
  };

  return (
    <BottomSheetRoot open={open} onOpenChange={setOpen}>
      <VStack gap="x2" width="full">
        <BottomSheetTrigger asChild>
          <ActionButton
            variant="brandSolid"
            size="large"
            className="w-full"
            onClick={() => openTrade("buy")}
          >
            매수
          </ActionButton>
        </BottomSheetTrigger>
        {myHolding > 0 && (
          <BottomSheetTrigger asChild>
            <ActionButton
              variant="neutralWeak"
              size="large"
              className="w-full"
              onClick={() => openTrade("sell")}
            >
              매도
            </ActionButton>
          </BottomSheetTrigger>
        )}
      </VStack>
      <BottomSheetContent aria-label={tradeType === "buy" ? "매수" : "매도"}>
        <BottomSheetBody style={{ paddingTop: "var(--seed-dimension-x7)" }}>
          <form id="trade-form" onSubmit={onSubmit}>
            <VStack gap="x4" width="full">
              <VStack gap="x2" width="full">
                <Box
                  display="grid"
                  width="full"
                  gap="x3"
                  style={{
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                  }}
                >
                  <Box display="flex" justifyContent="center">
                    <Text textStyle="t6Bold" color="fg.neutral">
                      {tradeType === "buy" ? context.investorName : teamName}
                    </Text>
                  </Box>
                  <Icon svg={<IconArrowRightLine />} />
                  <Box display="flex" justifyContent="center">
                    <Text textStyle="t6Bold" color="fg.neutral">
                      {tradeType === "buy" ? teamName : context.investorName}
                    </Text>
                  </Box>
                </Box>
                {/* Fixed height (t5's own line-height) so the row doesn't
                    grow the moment the value becomes visible — NumberFlow
                    pins its own line-height to 1, which doesn't match t5's
                    otherwise. NumberFlow also stays mounted at all times
                    (hidden via opacity, not conditionally rendered): a
                    fresh mount has no prior value to animate from, so
                    unmounting at 0 would skip the roll-in animation on the
                    very first amount — typed or from a preset/전액 button. */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  style={{ height: "var(--seed-line-height-t5)" }}
                >
                  <Text
                    as="p"
                    textStyle="t5Bold"
                    style={{
                      textAlign: "center",
                      fontVariantNumeric: "tabular-nums",
                      opacity: watchedAmount > 0 ? 1 : 0,
                      // Without a transition, opacity snaps to 0 the same
                      // instant the value drops to 0, hiding NumberFlow's
                      // roll-down before it's ever visible — fade it out
                      // instead so clearing the amount is seen rolling to
                      // zero, not just disappearing.
                      transition: "opacity 300ms ease",
                      color:
                        tradeType === "buy"
                          ? "var(--seed-color-fg-brand)"
                          : "var(--seed-color-fg-critical)",
                    }}
                  >
                    <NumberFlow
                      value={watchedAmount}
                      suffix="원"
                      locales="ko-KR"
                    />
                  </Text>
                </Box>
              </VStack>

              <Text textStyle="t4Regular" color="fg.neutralSubtle">
                {tradeType === "buy" ? "남은 투자금 " : "이 팀 보유금액 "}
                <NumberFlow
                  value={Math.max(0, maxAmount - watchedAmount)}
                  suffix="원"
                  locales="ko-KR"
                />
              </Text>

              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <TextField
                    label="금액"
                    invalid={!!errors.amount}
                    errorMessage={errors.amount?.message}
                  >
                    <TextFieldInput
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={field.value === 0 ? "" : field.value}
                      onBlur={field.onBlur}
                      onChange={(e) =>
                        field.onChange(e.target.valueAsNumber || 0)
                      }
                    />
                  </TextField>
                )}
              />

              <HStack gap="x2" wrap>
                {PRESET_UNITS.map((unit) => (
                  <ActionButton
                    key={unit}
                    type="button"
                    variant="neutralWeak"
                    size="small"
                    disabled={unit > maxAmount}
                    onClick={() =>
                      setValue("amount", unit, { shouldValidate: true })
                    }
                  >
                    {(unit / 10_000).toLocaleString()}만원
                  </ActionButton>
                ))}
                <ActionButton
                  type="button"
                  variant="neutralWeak"
                  size="small"
                  disabled={maxAmount <= 0}
                  onClick={() =>
                    setValue("amount", maxAmount, { shouldValidate: true })
                  }
                >
                  전액
                </ActionButton>
              </HStack>
            </VStack>
          </form>
        </BottomSheetBody>
        <SnackbarAvoidOverlap>
          <BottomSheetFooter>
            <ActionButton
              type="submit"
              form="trade-form"
              variant={tradeType === "buy" ? "brandSolid" : "criticalSolid"}
              className="w-full"
              loading={tradeMutation.isPending}
            >
              {tradeType === "buy" ? "매수 확정" : "매도 확정"}
            </ActionButton>
          </BottomSheetFooter>
        </SnackbarAvoidOverlap>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
