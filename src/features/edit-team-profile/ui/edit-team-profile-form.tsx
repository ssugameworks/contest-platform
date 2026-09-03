"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import type { Team } from "@/entities/team";
import {
  type ManageTeamInput,
  manageTeamSchema,
} from "@/entities/team/model/schema";
import { TagInputField, TeamImageUploadField } from "@/features/manage-team";
import { updateMyTeamAction } from "../model/actions";

export function EditTeamProfileForm({ team }: { team: Team }) {
  const adapter = useSnackbarAdapter();
  const [imageUrl, setImageUrl] = useState<string[]>(
    team.imageUrl ? [team.imageUrl] : [],
  );
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(
    team.screenshotUrls,
  );
  const [tags, setTags] = useState<string[]>(team.tags);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ManageTeamInput>({
    resolver: zodResolver(manageTeamSchema),
    defaultValues: {
      name: team.name,
      description: team.description,
      githubUrl: team.githubUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    await updateMyTeamAction({
      name: data.name,
      description: data.description,
      imageUrl: imageUrl[0] ?? null,
      githubUrl: data.githubUrl || null,
      tags,
      screenshotUrls,
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
        <TextField
          label="팀 이름"
          defaultValue={team.name}
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
          defaultValue={team.description}
          invalid={!!errors.description}
          errorMessage={errors.description?.message}
        >
          <TextFieldTextarea
            placeholder="팀을 소개해주세요"
            {...register("description")}
          />
        </TextField>

        <TeamImageUploadField
          label="팀 로고 이미지"
          maxFiles={1}
          urls={imageUrl}
          onUrlsChange={setImageUrl}
        />

        <TagInputField label="태그" tags={tags} onTagsChange={setTags} />

        <TeamImageUploadField
          label="제품 스크린샷"
          maxFiles={5}
          urls={screenshotUrls}
          onUrlsChange={setScreenshotUrls}
        />

        <TextField
          label="GitHub 페이지"
          description="팀 프로젝트의 GitHub 저장소 링크를 입력해주세요"
          defaultValue={team.githubUrl ?? ""}
          invalid={!!errors.githubUrl}
          errorMessage={errors.githubUrl?.message}
        >
          <TextFieldInput
            type="url"
            placeholder="https://github.com/team/repo"
            {...register("githubUrl")}
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
