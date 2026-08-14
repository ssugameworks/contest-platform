"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { setCurrentStaff } from "@/entities/staff/model/pure";
import { findStaffById } from "@/entities/staff/model/staff-client";
import { type AdminLoginInput, adminLoginSchema } from "../model/schema";

export function AdminLoginForm() {
  const adapter = useSnackbarAdapter();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginInput>({ resolver: zodResolver(adminLoginSchema) });

  const onSubmit = handleSubmit(async ({ id }) => {
    const staff = await findStaffById(id);
    if (!staff) {
      setError("id", { message: "등록되지 않은 아이디예요" });
      return;
    }

    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar
          message={`${staff.role === "admin" ? "관리자" : "심사위원"}로 로그인했어요`}
        />
      ),
    });
    setCurrentStaff(staff);
    router.push(
      staff.role === "admin" ? "/admin/dashboard" : "/judge/dashboard",
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TextField
          label="아이디"
          invalid={!!errors.id}
          errorMessage={errors.id?.message}
        >
          <TextFieldInput type="text" placeholder="admin" {...register("id")} />
        </TextField>
        <TextField
          label="비밀번호"
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
