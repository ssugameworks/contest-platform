"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconILowercaseSerifCircleLine } from "@karrotmarket/react-monochrome-icon";
import { VStack } from "@seed-design/react";
import { useQueryClient } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { Callout } from "seed-design/ui/callout";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import type { Investor } from "@/entities/investor";
import { createInvestorAction, updateInvestorAction } from "../model/actions";
import {
  type ManageInvestorInput,
  manageInvestorSchema,
} from "../model/schema";

export function ManageInvestorForm({
  investor,
  onSaved,
}: {
  investor?: Investor;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageInvestorInput>({
    resolver: zodResolver(manageInvestorSchema),
    defaultValues: {
      name: investor?.name ?? "",
      studentId: investor?.studentId ?? "",
      totalBudget: investor?.totalBudget ?? 100_000,
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (investor) {
        await updateInvestorAction(investor.id, data);
      } else {
        await createInvestorAction(data);
      }
    } catch (error) {
      adapter.create({
        onClose: () => {},
        render: () => (
          <Snackbar
            message={
              error instanceof Error ? error.message : "저장에 실패했어요"
            }
          />
        ),
      });
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-investors"] });
    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar variant="positive" message="성공적으로 저장했어요" />
      ),
    });
    onSaved();
  });

  return (
    <form id="manage-investor-form" onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TextField
          label="이름"
          defaultValue={investor?.name}
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput
            placeholder="이름을 입력해주세요"
            {...register("name")}
          />
        </TextField>

        <TextField
          label="학번"
          defaultValue={investor?.studentId}
          invalid={!!errors.studentId}
          errorMessage={errors.studentId?.message}
        >
          <TextFieldInput
            inputMode="numeric"
            placeholder="20231234"
            {...register("studentId")}
          />
        </TextField>

        <Controller
          control={control}
          name="totalBudget"
          render={({ field }) => (
            <TextField
              label="보유 예산"
              invalid={!!errors.totalBudget}
              errorMessage={errors.totalBudget?.message}
            >
              <TextFieldInput
                type="number"
                inputMode="numeric"
                placeholder="100000"
                value={field.value === 0 ? "" : field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
              />
            </TextField>
          )}
        />

        {!investor && (
          <Callout
            prefixIcon={<IconILowercaseSerifCircleLine />}
            description="비밀번호는 투자자가 처음 로그인할 때 입력한 비밀번호가 그대로 등록됩니다."
          />
        )}
      </VStack>
    </form>
  );
}
