"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { investorLoginOrSignupAction } from "@/entities/session";
import { type InvestorLoginInput, investorLoginSchema } from "../model/schema";

export function InvestorLoginForm() {
  const adapter = useSnackbarAdapter();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<InvestorLoginInput>({
    resolver: zodResolver(investorLoginSchema),
  });

  const onSubmit = handleSubmit(async ({ studentId, name, password }) => {
    const result = await investorLoginOrSignupAction(
      studentId,
      name ?? "",
      password,
    );
    if (!result.ok) {
      const field = result.message.includes("이름") ? "name" : "studentId";
      setError(field, { message: result.message });
      return;
    }
    adapter.create({
      onClose: () => {},
      render: () => <Snackbar message="투자자로 로그인했어요" />,
    });
    router.push("/leaderboard");
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
          label="이름"
          description="처음 가입하는 경우에만 입력해주세요"
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput placeholder="홍길동" {...register("name")} />
        </TextField>
        <TextField
          label="비밀번호"
          description="처음 가입 시 입력한 비밀번호로 계속 로그인해요"
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
          가입/로그인
        </ActionButton>
      </VStack>
    </form>
  );
}
