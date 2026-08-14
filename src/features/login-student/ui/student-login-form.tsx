"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { type StudentLoginInput, studentLoginSchema } from "../model/schema";

export function StudentLoginForm() {
  const adapter = useSnackbarAdapter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StudentLoginInput>({ resolver: zodResolver(studentLoginSchema) });

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
          label="학교 이메일"
          description="로그인 링크를 받을 이메일 주소예요"
          invalid={!!errors.email}
          errorMessage={errors.email?.message}
        >
          <TextFieldInput
            type="email"
            placeholder="you@soongsil.ac.kr"
            {...register("email")}
          />
        </TextField>
        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={isSubmitting}
          className="w-full"
        >
          로그인 링크 받기
        </ActionButton>
      </VStack>
    </form>
  );
}
