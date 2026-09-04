"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Text, VStack } from "@seed-design/react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ActionButton } from "seed-design/ui/action-button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "seed-design/ui/segmented-control";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { submitApplicationAction } from "@/entities/application";
import {
  type ApplicationFormInput,
  applicationSchema,
  ROLE_OPTIONS,
} from "../model/schema";
import {
  clearApplicationDraft,
  loadApplicationDraft,
  useApplicationDraftAutosave,
} from "./apply-form-draft";
import { CollegeDepartmentFields } from "./college-department-select";
import { BirthDateField, PhoneField, StudentIdField } from "./formatted-fields";
import { SubmitApplicationResult } from "./submit-application-result";
import { TeamMembersField } from "./team-members-field";

const DEFAULT_VALUES: Partial<ApplicationFormInput> = {
  name: "",
  studentId: "",
  college: "",
  department: "",
  phone: "",
  birthDate: "",
  role: "pm",
  applicationType: "individual",
  teamMembers: [],
};

export function SubmitApplicationForm() {
  const adapter = useSnackbarAdapter();
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationFormInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: DEFAULT_VALUES,
  });

  // Runs client-side only, after the SSR-matching empty form has hydrated —
  // avoids a hydration mismatch between the server render and a
  // localStorage-backed draft that only exists in the browser.
  useEffect(() => {
    const draft = loadApplicationDraft();
    if (draft) reset({ ...DEFAULT_VALUES, ...draft });
  }, [reset]);

  useApplicationDraftAutosave(watch);

  const applicationType = watch("applicationType");

  const onSubmit = handleSubmit(async (data) => {
    const result = await submitApplicationAction({
      ...data,
      teamMembers: data.applicationType === "team" ? data.teamMembers : [],
    });
    if (!result.ok) {
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar variant="critical" message={result.message} />,
      });
      return;
    }
    clearApplicationDraft();
    setSubmitted(true);
  });

  if (submitted) {
    return <SubmitApplicationResult />;
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <VStack gap="spacingY.componentDefault" width="full">
        <TextField
          label="이름"
          invalid={!!errors.name}
          errorMessage={errors.name?.message}
        >
          <TextFieldInput placeholder="홍길동" {...register("name")} />
        </TextField>

        <StudentIdField control={control} />

        <CollegeDepartmentFields
          control={control}
          setValue={setValue}
          collegeName="college"
          departmentName="department"
          collegeErrorMessage={errors.college?.message}
          departmentErrorMessage={errors.department?.message}
        />

        <PhoneField control={control} name="phone" label="전화번호" />

        <BirthDateField control={control} />

        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Field.Root>
              <VStack gap="x2" width="full">
                <Field.Label>역할</Field.Label>
                <SegmentedControl
                  aria-label="역할 선택"
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  {ROLE_OPTIONS.map((option) => (
                    <SegmentedControlItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SegmentedControlItem>
                  ))}
                </SegmentedControl>
                {errors.role && (
                  <Text textStyle="t3Regular" color="fg.critical">
                    {errors.role.message}
                  </Text>
                )}
              </VStack>
            </Field.Root>
          )}
        />

        <Controller
          control={control}
          name="applicationType"
          render={({ field }) => (
            <Field.Root>
              <VStack gap="x2" width="full">
                <Field.Label>지원 방식</Field.Label>
                <SegmentedControl
                  aria-label="개인 지원 또는 팀 지원 선택"
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    if (value === "team" && watch("teamMembers").length === 0) {
                      setValue("teamMembers", [
                        { name: "", college: "", department: "" },
                      ]);
                    } else if (value === "individual") {
                      // Otherwise a row added while "팀 지원" was selected
                      // lingers in the hidden array and fails validation
                      // silently — submit just does nothing with no visible
                      // error, since the section that would show it is gone.
                      setValue("teamMembers", []);
                    }
                  }}
                >
                  <SegmentedControlItem value="individual">
                    개인 지원
                  </SegmentedControlItem>
                  <SegmentedControlItem value="team">
                    팀 지원
                  </SegmentedControlItem>
                </SegmentedControl>
              </VStack>
            </Field.Root>
          )}
        />

        {applicationType === "team" && (
          <TeamMembersField
            control={control}
            register={register}
            setValue={setValue}
            errors={errors}
          />
        )}

        <ActionButton
          type="submit"
          variant="brandSolid"
          loading={isSubmitting}
          className="w-full"
        >
          지원하기
        </ActionButton>
      </VStack>
    </form>
  );
}
