"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { participantLoginAction } from "@/entities/session";
import {
  type ParticipantLoginInput,
  participantLoginSchema,
} from "../model/schema";

export function ParticipantLoginForm() {
  const adapter = useSnackbarAdapter();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ParticipantLoginInput>({
    resolver: zodResolver(participantLoginSchema),
  });

  const onSubmit = handleSubmit(async ({ studentId }) => {
    try {
      await participantLoginAction(studentId);
    } catch (error) {
      setError("studentId", {
        message: error instanceof Error ? error.message : "로그인에 실패했어요",
      });
      return;
    }
    adapter.create({
      onClose: () => {},
      render: () => <Snackbar message="참가자로 로그인했어요" />,
    });
    router.push("/participant/dashboard");
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
