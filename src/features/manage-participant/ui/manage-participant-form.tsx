"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { IconILowercaseSerifCircleLine } from "@karrotmarket/react-monochrome-icon";
import { VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Callout } from "seed-design/ui/callout";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "seed-design/ui/select";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import type { Participant } from "@/entities/participant";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  createParticipantAction,
  updateParticipantAction,
} from "../model/actions";
import {
  type ManageParticipantInput,
  manageParticipantSchema,
} from "../model/schema";

const UNASSIGNED = "__unassigned__";

export function ManageParticipantForm({
  participant,
  onSaved,
}: {
  participant?: Participant;
  onSaved: () => void;
}) {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ManageParticipantInput>({
    resolver: zodResolver(manageParticipantSchema),
    defaultValues: {
      studentId: participant?.studentId ?? "",
      name: participant?.name ?? "",
      teamId: participant?.teamId ?? null,
    },
  });

  // The save button lives outside this <form> (AdminCrudTable's footer,
  // wired via form="manage-participant-form"), so it can't be disabled by
  // formState.isSubmitting — guard re-entrancy here instead, otherwise a
  // fast double-click fires createParticipantAction twice and the second
  // call fails on the 학번 the first call just created.
  const submittingRef = useRef(false);
  const onSubmit = handleSubmit(async (data) => {
    if (submittingRef.current) return;
    submittingRef.current = true;
    try {
      if (participant) {
        await updateParticipantAction(participant.studentId, {
          name: data.name,
          teamId: data.teamId,
        });
      } else {
        await createParticipantAction(data);
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
    } finally {
      submittingRef.current = false;
    }
    await queryClient.invalidateQueries({ queryKey: ["admin-participants"] });
    onSaved();
  });

  return (
    <form id="manage-participant-form" onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        {!participant && (
          <Callout
            prefixIcon={<IconILowercaseSerifCircleLine />}
            description="비밀번호는 참가자가 처음 로그인할 때 입력한 비밀번호가 그대로 등록됩니다."
          />
        )}

        <TextField
          label="학번"
          defaultValue={participant?.studentId}
          disabled={!!participant}
          invalid={!!errors.studentId}
          errorMessage={errors.studentId?.message}
        >
          <TextFieldInput placeholder="20231234" {...register("studentId")} />
        </TextField>

        <TextField
          label="이름"
          defaultValue={participant?.name}
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput
            placeholder="이름을 입력해주세요"
            {...register("name")}
          />
        </TextField>

        <Controller
          control={control}
          name="teamId"
          render={({ field }) => (
            <SelectRoot
              label="소속 팀"
              value={field.value ? [field.value] : [UNASSIGNED]}
              onValueChange={(values) =>
                field.onChange(
                  values[0] === UNASSIGNED ? null : (values[0] ?? null),
                )
              }
            >
              <SelectTrigger placeholder="미배정" />
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={UNASSIGNED} label="미배정" />
                  {teams.map((team) => (
                    <SelectItem
                      key={team.id}
                      value={team.id}
                      label={team.name}
                    />
                  ))}
                </SelectGroup>
              </SelectContent>
            </SelectRoot>
          )}
        />
      </VStack>
    </form>
  );
}
