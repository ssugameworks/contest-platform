"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import type { FileEntry } from "@seed-design/react/primitive";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import {
  AttachmentField,
  AttachmentInput,
} from "seed-design/ui/attachment-field";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import { mockTeam } from "@/entities/team";
import {
  type EditTeamProfileInput,
  editTeamProfileSchema,
} from "../model/schema";

export function EditTeamProfileForm() {
  const adapter = useSnackbarAdapter();
  const [imageEntries, setImageEntries] = useState<FileEntry[]>([]);
  const [screenshotEntries, setScreenshotEntries] = useState<FileEntry[]>([]);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTeamProfileInput>({
    resolver: zodResolver(editTeamProfileSchema),
    defaultValues: {
      name: mockTeam.name,
      description: mockTeam.description,
      tags: mockTeam.tags.join(", "),
      landingPageUrl: mockTeam.landingPageUrl ?? "",
    },
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
        <AttachmentField
          label="팀 로고"
          maxFiles={1}
          accept="image/*"
          acceptedFileEntries={imageEntries}
          onAcceptedFileEntriesChange={setImageEntries}
        >
          <AttachmentInput />
        </AttachmentField>

        <TextField
          label="팀 이름"
          defaultValue={mockTeam.name}
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput
            placeholder="팀 이름을 입력해주세요"
            {...register("name")}
          />
        </TextField>

        <TextField
          label="팀 소개"
          defaultValue={mockTeam.description}
          invalid={!!errors.description}
          errorMessage={errors.description?.message}
        >
          <TextFieldTextarea
            placeholder="팀을 소개해주세요"
            {...register("description")}
          />
        </TextField>

        <TextField
          label="태그"
          description="쉼표(,)로 구분해서 입력해주세요"
          defaultValue={mockTeam.tags.join(", ")}
          invalid={!!errors.tags}
          errorMessage={errors.tags?.message}
        >
          <TextFieldInput
            placeholder="AI, 커머스, 캠퍼스"
            {...register("tags")}
          />
        </TextField>

        <AttachmentField
          label="제품 스크린샷"
          maxFiles={5}
          accept="image/*"
          acceptedFileEntries={screenshotEntries}
          onAcceptedFileEntriesChange={setScreenshotEntries}
        >
          <AttachmentInput />
        </AttachmentField>

        <TextField
          label="랜딩페이지 링크"
          description="팀 소개 페이지나 서비스 링크가 있다면 입력해주세요"
          defaultValue={mockTeam.landingPageUrl ?? ""}
          invalid={!!errors.landingPageUrl}
          errorMessage={errors.landingPageUrl?.message}
        >
          <TextFieldInput
            type="url"
            placeholder="https://example.com"
            {...register("landingPageUrl")}
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
