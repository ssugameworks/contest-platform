"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Text, VStack } from "@seed-design/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Checkbox } from "seed-design/ui/checkbox";
import {
  TextField,
  TextFieldInput,
  TextFieldTextarea,
} from "seed-design/ui/text-field";
import { mockParticipants } from "@/entities/participant";
import { addTeam, mockTeams, type Team, updateTeam } from "@/entities/team";
import { type ManageTeamInput, manageTeamSchema } from "../model/schema";

export function ManageTeamForm({
  team,
  onSaved,
}: {
  team?: Team;
  onSaved: () => void;
}) {
  const [memberIds, setMemberIds] = useState<string[]>(team?.memberIds ?? []);
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

  const toggleMember = (studentId: string, checked: boolean) => {
    setMemberIds((current) =>
      checked
        ? [...current, studentId]
        : current.filter((id) => id !== studentId),
    );
  };

  const findOtherTeam = (studentId: string) =>
    mockTeams.find(
      (other) => other.id !== team?.id && other.memberIds.includes(studentId),
    );

  const onSubmit = handleSubmit((data) => {
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    const landingPageUrl = data.landingPageUrl || null;

    // a participant can only belong to one team at a time
    for (const studentId of memberIds) {
      const otherTeam = findOtherTeam(studentId);
      if (otherTeam) {
        updateTeam(otherTeam.id, {
          memberIds: otherTeam.memberIds.filter((id) => id !== studentId),
        });
      }
    }

    if (team) {
      updateTeam(team.id, {
        name: data.name,
        description: data.description,
        tags,
        landingPageUrl,
        memberIds,
      });
    } else {
      addTeam({
        id: `team-${Date.now()}`,
        name: data.name,
        description: data.description,
        imageUrl: null,
        landingPageUrl,
        memberIds,
        tags,
        screenshotUrls: [],
      });
    }
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
            {mockParticipants.map((participant) => {
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
