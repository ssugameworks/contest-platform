"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Text, VStack } from "@seed-design/react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { changeMyPasswordAction } from "../model/actions";
import {
  type ChangePasswordInput,
  changePasswordSchema,
} from "../model/schema";

export function ChangePasswordForm() {
  const adapter = useSnackbarAdapter();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmit = handleSubmit(async (data) => {
    const result = await changeMyPasswordAction({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });
    if (!result.ok) {
      setError("currentPassword", { message: result.message });
      return;
    }

    reset();
    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar variant="positive" message="비밀번호를 변경했어요" />
      ),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <Text textStyle="t5Bold">비밀번호 변경</Text>

        <TextField
          label="현재 비밀번호"
          invalid={!!errors.currentPassword}
          errorMessage={errors.currentPassword?.message}
        >
          <TextFieldInput
            type="password"
            placeholder="********"
            {...register("currentPassword")}
          />
        </TextField>

        <TextField
          label="새 비밀번호"
          invalid={!!errors.newPassword}
          errorMessage={errors.newPassword?.message}
        >
          <TextFieldInput
            type="password"
            placeholder="********"
            {...register("newPassword")}
          />
        </TextField>

        <TextField
          label="새 비밀번호 확인"
          invalid={!!errors.confirmNewPassword}
          errorMessage={errors.confirmNewPassword?.message}
        >
          <TextFieldInput
            type="password"
            placeholder="********"
            {...register("confirmNewPassword")}
          />
        </TextField>

        <ActionButton
          type="submit"
          variant="neutralWeak"
          loading={isSubmitting}
          className="w-full"
        >
          비밀번호 변경
        </ActionButton>
      </VStack>
    </form>
  );
}
