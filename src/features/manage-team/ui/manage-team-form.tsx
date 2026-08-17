"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { VStack } from "@seed-design/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { createTeamAction, updateTeamAction } from "../model/actions";
import { TeamImageUploadField } from "./team-image-upload-field";

export function ManageTeamForm({
  team,
  onSaved,
}: {
  team?: Team;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const [imageUrl, setImageUrl] = useState<string[]>(
    team?.imageUrl ? [team.imageUrl] : [],
  );
  const [screenshotUrls, setScreenshotUrls] = useState<string[]>(
    team?.screenshotUrls ?? [],
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageTeamInput>({
    resolver: zodResolver(manageTeamSchema),
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
      tags: team?.tags.join(", ") ?? "",
      landingPageUrl: team?.landingPageUrl ?? "",
    },
  });

  const onSubmit = handleSubmit(async (data) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const input = {
      name: data.name,
      description: data.description,
      imageUrl: imageUrl[0] ?? null,
      landingPageUrl: data.landingPageUrl || null,
      tags,
      screenshotUrls,
    };

    try {
      if (team) {
        await updateTeamAction(team.id, input);
      } else {
        await createTeamAction(input);
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
    await queryClient.invalidateQueries({ queryKey: ["admin-team-rows"] });
    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar variant="positive" message="성공적으로 저장했어요" />
      ),
    });
    onSaved();
  });

  return (
    <form id="manage-team-form" onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TextField
          label="팀 이름"
          defaultValue={team?.name}
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
          defaultValue={team?.description}
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

        <TextField
          label="태그"
          description="쉼표(,)로 구분해서 입력해주세요"
          defaultValue={team?.tags.join(", ")}
          invalid={!!errors.tags}
          errorMessage={errors.tags?.message}
        >
          <TextFieldInput
            placeholder="AI, 커머스, 캠퍼스"
            {...register("tags")}
          />
        </TextField>

        <TeamImageUploadField
          label="제품 스크린샷"
          maxFiles={5}
          urls={screenshotUrls}
          onUrlsChange={setScreenshotUrls}
        />

        <TextField
          label="랜딩페이지 링크"
          defaultValue={team?.landingPageUrl ?? ""}
          invalid={!!errors.landingPageUrl}
          errorMessage={errors.landingPageUrl?.message}
        >
          <TextFieldInput
            type="url"
            placeholder="https://example.com"
            {...register("landingPageUrl")}
          />
        </TextField>
      </VStack>
    </form>
  );
}
