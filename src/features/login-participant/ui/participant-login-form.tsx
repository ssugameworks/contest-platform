"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  type ParticipantLoginInput,
  participantLoginSchema,
} from "../model/schema";

export function ParticipantLoginForm() {
  const adapter = useSnackbarAdapter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ParticipantLoginInput>({
    resolver: zodResolver(participantLoginSchema),
  });

  const onSubmit = handleSubmit(() => {
    adapter.create({
      onClose: () => {},
      render: () => <Snackbar message="아직 연결되지 않았어요" />,
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TextField
          label="학번"
          invalid={!!errors.studentId}
          errorMessage={errors.studentId?.message}
        >
          <TextFieldInput
            type="text"
            inputMode="numeric"
            placeholder="20231234"
            {...register("studentId")}
          />
        </TextField>
        <TextField
          label="비밀번호"
          description="임원진에게 받은 초기 비밀번호예요"
          invalid={!!errors.password}
          errorMessage={errors.password?.message}
        >
          <TextFieldInput
            type="password"
            placeholder="********"
            {...register("password")}
          />
        </TextField>
        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={isSubmitting}
          className="w-full"
        >
          로그인
        </ActionButton>
      </VStack>
    </form>
  );
}
