"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { TeamImageUploadField } from "@/features/manage-team";
import { updateMyProfileAction } from "../model/actions";
import {
  type EditParticipantProfileInput,
  editParticipantProfileSchema,
} from "../model/schema";

export function EditParticipantProfileForm({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const adapter = useSnackbarAdapter();
  const [avatarUrls, setAvatarUrls] = useState<string[]>(
    avatarUrl ? [avatarUrl] : [],
  );
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditParticipantProfileInput>({
    resolver: zodResolver(editParticipantProfileSchema),
    defaultValues: { name },
  });

  const onSubmit = handleSubmit(async (data) => {
    await updateMyProfileAction({
      name: data.name,
      avatarUrl: avatarUrls[0] ?? null,
    });

    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar variant="positive" message="성공적으로 저장했어요" />
      ),
    });
  });

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TeamImageUploadField
          label="프로필 사진"
          maxFiles={1}
          urls={avatarUrls}
          onUrlsChange={setAvatarUrls}
        />

        <TextField
          label="이름"
          defaultValue={name}
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput
            placeholder="이름을 입력해주세요"
            {...register("name")}
          />
        </TextField>

        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={isSubmitting}
          className="w-full"
        >
          저장
        </ActionButton>
      </VStack>
    </form>
  );
}
