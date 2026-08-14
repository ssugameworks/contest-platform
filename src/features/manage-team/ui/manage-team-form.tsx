"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "seed-design/ui/checkbox";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import { listParticipantsAction } from "@/entities/participant/model/actions";
import type { Team } from "@/entities/team";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  type ManageTeamInput,
  manageTeamSchema,
} from "@/entities/team/model/schema";
import { createTeamAction, updateTeamAction } from "../model/actions";

export function ManageTeamForm({
  team,
  onSaved,
}: {
  team?: Team;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const [memberIds, setMemberIds] = useState<string[]>(team?.memberIds ?? []);
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const { data: participants = [] } = useQuery({
    queryKey: ["participants"],
    queryFn: listParticipantsAction,
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageTeamInput>({
    resolver: zodResolver(manageTeamSchema),
    defaultValues: {
      name: team?.name ?? "",
      description: team?.description ?? "",
      imageUrl: team?.imageUrl ?? "",
      tags: team?.tags.join(", ") ?? "",
      screenshotUrls: team?.screenshotUrls.join(", ") ?? "",
      landingPageUrl: team?.landingPageUrl ?? "",
    },
  });

  const toggleMember = (studentId: string, checked: boolean) => {
    setMemberIds((current) =>
      checked
        ? [...current, studentId]
        : current.filter((id) => id !== studentId),
    );
  };

  const findOtherTeam = (studentId: string) =>
    teams.find(
      (other) => other.id !== team?.id && other.memberIds.includes(studentId),
    );

  const onSubmit = handleSubmit(async (data) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const screenshotUrls = data.screenshotUrls
      ? data.screenshotUrls
          .split(",")
          .map((url) => url.trim())
          .filter(Boolean)
      : [];
    const input = {
      name: data.name,
      description: data.description,
      imageUrl: data.imageUrl || null,
      landingPageUrl: data.landingPageUrl || null,
      tags,
      screenshotUrls,
      memberIds,
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

        <TextField
          label="팀 로고 이미지 URL"
          defaultValue={team?.imageUrl ?? ""}
          invalid={!!errors.imageUrl}
          errorMessage={errors.imageUrl?.message}
        >
          <TextFieldInput
            type="url"
            placeholder="https://example.com/logo.png"
            {...register("imageUrl")}
          />
        </TextField>

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

        <TextField
          label="제품 스크린샷 URL"
          description="쉼표(,)로 구분해서 입력해주세요"
          defaultValue={team?.screenshotUrls.join(", ")}
          invalid={!!errors.screenshotUrls}
          errorMessage={errors.screenshotUrls?.message}
        >
          <TextFieldInput
            placeholder="https://example.com/1.png, https://example.com/2.png"
            {...register("screenshotUrls")}
          />
        </TextField>

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

        <VStack gap="x2" width="full">
          <Text textStyle="t3Bold" color="fg.neutralSubtle">
            팀원
          </Text>
          <VStack gap="x1" width="full">
            {participants.map((participant) => {
              const otherTeam = findOtherTeam(participant.studentId);
              return (
                <Checkbox
                  key={participant.studentId}
                  disabled={!!otherTeam}
                  checked={memberIds.includes(participant.studentId)}
                  onCheckedChange={(checked) =>
                    toggleMember(participant.studentId, checked === true)
                  }
                  label={
                    otherTeam
                      ? `${participant.name} (${otherTeam.name} 소속)`
                      : participant.name
                  }
                />
              );
            })}
          </VStack>
        </VStack>
      </VStack>
    </form>
  );
}
