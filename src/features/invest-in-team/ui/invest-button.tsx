"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconArrowRightLine } from "@karrotmarket/react-monochrome-icon";
import { Box, HStack, Icon, Text, VStack } from "@seed-design/react";
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
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { mockCurrentInvestor } from "@/entities/investor";
import { mockTeam } from "@/entities/team";
import {
  createTradeAmountSchema,
  type TradeAmountInput,
} from "../model/schema";

const PRESET_UNITS = [10_000, 30_000, 50_000] as const;

type TradeType = "buy" | "sell";

export function InvestButton() {
  const adapter = useSnackbarAdapter();
  const [open, setOpen] = useState(false);
  const [tradeType, setTradeType] = useState<TradeType>("buy");
  const [remainingBudget, setRemainingBudget] = useState(
    mockCurrentInvestor.totalBudget,
  );
  const [myHolding, setMyHolding] = useState(0);

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
    formState: { errors },
  } = useForm<TradeAmountInput>({
    resolver: zodResolver(schema),
    defaultValues: { amount: 0 },
  });

  const watchedAmount = useWatch({ control, name: "amount" });

  const onSubmit = handleSubmit(({ amount }) => {
    if (tradeType === "buy") {
      setRemainingBudget((b) => b - amount);
      setMyHolding((h) => h + amount);
    } else {
      setRemainingBudget((b) => b + amount);
      setMyHolding((h) => h - amount);
    }
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
  });

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
                      {tradeType === "buy"
                        ? mockCurrentInvestor.name
                        : mockTeam.name}
                    </Text>
                  </Box>
                  <Icon svg={<IconArrowRightLine />} />
                  <Box display="flex" justifyContent="center">
                    <Text textStyle="t6Bold" color="fg.neutral">
                      {tradeType === "buy"
                        ? mockTeam.name
                        : mockCurrentInvestor.name}
                    </Text>
                  </Box>
                </Box>
                <Text
                  as="p"
                  textStyle="t5Bold"
                  style={{
                    textAlign: "center",
                    fontVariantNumeric: "tabular-nums",
                    color:
                      tradeType === "buy"
                        ? "var(--seed-color-fg-brand)"
                        : "var(--seed-color-fg-critical)",
                  }}
                >
                  {watchedAmount > 0
                    ? `${watchedAmount.toLocaleString()}원`
                    : " "}
                </Text>
              </VStack>

              <Text textStyle="t4Regular" color="fg.neutralSubtle">
                {tradeType === "buy"
                  ? `남은 투자금 ${remainingBudget.toLocaleString()}원`
                  : `이 팀 보유금액 ${myHolding.toLocaleString()}원`}
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
        <BottomSheetFooter>
          <ActionButton
            type="submit"
            form="trade-form"
            variant={tradeType === "buy" ? "brandSolid" : "criticalSolid"}
            className="w-full"
          >
            {tradeType === "buy" ? "매수 확정" : "매도 확정"}
          </ActionButton>
        </BottomSheetFooter>
      </BottomSheetContent>
    </BottomSheetRoot>
  );
}
