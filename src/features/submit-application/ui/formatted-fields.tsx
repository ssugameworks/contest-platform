"use client";

import { IconExclamationmarkCircleFill } from "@karrotmarket/react-monochrome-icon";
import { VStack } from "@seed-design/react";
import { useState } from "react";
import { type Control, Controller } from "react-hook-form";
import { Callout } from "seed-design/ui/callout";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { checkStudentIdAvailableAction } from "@/entities/application";
import type { ApplicationFormInput } from "../model/schema";

// "Custom Input" per SEED Design's TextField docs: TextFieldInput takes a
// plain controlled value/onChange, so formatting is just intercepting
// onChange before it reaches react-hook-form — no masking library needed.
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  // Seoul's area code is 2 digits (02-XXXX-XXXX); every other area code and
  // every mobile prefix is 3 digits — grouping everything as 3 would print
  // "021-234-5678" for a Seoul landline instead of "02-1234-5678".
  const areaLength = digits.startsWith("02") ? 2 : 3;
  if (digits.length <= areaLength) return digits;

  const area = digits.slice(0, areaLength);
  const rest = digits.slice(areaLength);
  if (rest.length <= 4) return `${area}-${rest}`;

  const last = rest.slice(-4);
  const middle = rest.slice(0, rest.length - 4);
  return `${area}-${middle}-${last}`;
}

function formatDate(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length < 5) return digits;
  if (digits.length < 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function PhoneField({
  control,
  name,
  label,
  description,
}: {
  control: Control<ApplicationFormInput>;
  name: "phone";
  label: string;
  description?: string;
}) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          description={description}
          invalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        >
          <TextFieldInput
            inputMode="tel"
            placeholder="010-1234-5678"
            value={field.value}
            onChange={(event) =>
              field.onChange(formatPhone(event.target.value))
            }
            onBlur={field.onBlur}
          />
        </TextField>
      )}
    />
  );
}

export function BirthDateField({
  control,
}: {
  control: Control<ApplicationFormInput>;
}) {
  return (
    <Controller
      control={control}
      name="birthDate"
      render={({ field, fieldState }) => (
        <TextField
          label="생년월일"
          invalid={!!fieldState.error}
          errorMessage={fieldState.error?.message}
        >
          <TextFieldInput
            inputMode="numeric"
            placeholder="2003-05-14"
            value={field.value}
            onChange={(event) => field.onChange(formatDate(event.target.value))}
            onBlur={field.onBlur}
          />
        </TextField>
      )}
    />
  );
}

export function StudentIdField({
  control,
}: {
  control: Control<ApplicationFormInput>;
}) {
  const [duplicate, setDuplicate] = useState(false);

  return (
    <Controller
      control={control}
      name="studentId"
      render={({ field, fieldState }) => (
        <VStack gap="x2" width="full">
          <TextField
            label="학번"
            invalid={!!fieldState.error}
            errorMessage={fieldState.error?.message}
          >
            <TextFieldInput
              inputMode="numeric"
              placeholder="20231234"
              value={field.value}
              onChange={(event) => {
                setDuplicate(false);
                field.onChange(
                  event.target.value.replace(/\D/g, "").slice(0, 8),
                );
              }}
              onBlur={async () => {
                field.onBlur();
                if (/^\d{8}$/.test(field.value)) {
                  const available = await checkStudentIdAvailableAction(
                    field.value,
                  );
                  setDuplicate(!available);
                }
              }}
            />
          </TextField>
          {duplicate && (
            <Callout
              tone="warning"
              prefixIcon={<IconExclamationmarkCircleFill />}
              description="이미 이 학번으로 지원 내역이 있어요. 다시 제출해도 반영되지 않아요."
            />
          )}
        </VStack>
      )}
    />
  );
}
