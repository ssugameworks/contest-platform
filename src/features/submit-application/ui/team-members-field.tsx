"use client";

import IconQuestionmarkCircleLine from "@karrotmarket/react-monochrome-icon/IconQuestionmarkCircleLine";
import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { Box, HStack, Text, VStack } from "@seed-design/react";
import { useState } from "react";
import {
  type Control,
  type FieldErrors,
  type UseFormRegister,
  type UseFormSetValue,
  useFieldArray,
} from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import { HelpBubbleTrigger } from "seed-design/ui/help-bubble";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import type { ApplicationFormInput } from "../model/schema";
import { CollegeDepartmentFields } from "./college-department-select";

const MAX_TEAM_MEMBERS = 4; // 본인 포함 최대 5명

export function TeamMembersField({
  control,
  register,
  setValue,
  errors,
}: {
  control: Control<ApplicationFormInput>;
  register: UseFormRegister<ApplicationFormInput>;
  setValue: UseFormSetValue<ApplicationFormInput>;
  errors: FieldErrors<ApplicationFormInput>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "teamMembers",
  });
  // Opens the moment "팀 지원" is selected (this component only mounts
  // then) instead of waiting for the "?" to be tapped — the whole point is
  // that applicants easily miss this rule, so surface it immediately.
  const [helpOpen, setHelpOpen] = useState(true);

  return (
    <VStack gap="spacingY.componentDefault" width="full">
      <HStack justify="space-between" align="center" width="full">
        <HStack gap="x1" align="center">
          <Text textStyle="t4Regular" color="fg.neutralSubtle">
            팀원 정보
          </Text>
          <HelpBubbleTrigger
            title="팀원도 서로서로 적어야 해요"
            description="나만 팀원을 적으면 안 돼요! 같이 할 친구들도 각자 자기 지원서에 나머지 팀원을 빠짐없이 적어야 우리가 진짜 한 팀이라는 게 확인돼요."
            showCloseButton
            open={helpOpen}
            onOpenChange={setHelpOpen}
          >
            <button
              type="button"
              aria-label="팀원 입력 안내 더 보기"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "none",
                background: "transparent",
                color: "var(--seed-color-fg-neutral-subtle)",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <IconQuestionmarkCircleLine width={16} height={16} />
            </button>
          </HelpBubbleTrigger>
        </HStack>
        <Text textStyle="t3Regular" color="fg.neutralSubtle">
          본인 포함 {fields.length + 1}/5명
        </Text>
      </HStack>

      {errors.teamMembers?.message && (
        <Text textStyle="t3Regular" color="fg.critical">
          {errors.teamMembers.message}
        </Text>
      )}

      {fields.map((field, index) => (
        <Box
          key={field.id}
          bg="bg.neutralWeak"
          borderRadius="r2"
          padding="x4"
          width="full"
        >
          <VStack gap="x3" width="full">
            <HStack justify="flex-end" align="center" width="full">
              <button
                type="button"
                aria-label={`팀원 ${index + 1} 삭제`}
                onClick={() => remove(index)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 20,
                  height: 20,
                  border: "none",
                  background: "transparent",
                  color: "var(--seed-color-fg-neutral-subtle)",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <IconXmarkLine width={14} height={14} />
              </button>
            </HStack>

            <TextField
              label="이름"
              invalid={!!errors.teamMembers?.[index]?.name}
              errorMessage={errors.teamMembers?.[index]?.name?.message}
            >
              <TextFieldInput
                placeholder="홍길동"
                {...register(`teamMembers.${index}.name`)}
              />
            </TextField>

            <CollegeDepartmentFields
              control={control}
              setValue={setValue}
              collegeName={`teamMembers.${index}.college`}
              departmentName={`teamMembers.${index}.department`}
              collegeErrorMessage={
                errors.teamMembers?.[index]?.college?.message
              }
              departmentErrorMessage={
                errors.teamMembers?.[index]?.department?.message
              }
            />
          </VStack>
        </Box>
      ))}

      <ActionButton
        type="button"
        variant="neutralOutline"
        size="small"
        disabled={fields.length >= MAX_TEAM_MEMBERS}
        onClick={() => append({ name: "", college: "", department: "" })}
      >
        + 팀원 추가
      </ActionButton>
      {fields.length >= MAX_TEAM_MEMBERS && (
        <Text textStyle="t3Regular" color="fg.neutralSubtle">
          최대 5명(본인 포함)까지 지원할 수 있어요
        </Text>
      )}
    </VStack>
  );
}
