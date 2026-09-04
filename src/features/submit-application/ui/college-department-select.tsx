"use client";

import {
  type Control,
  Controller,
  type UseFormSetValue,
  useWatch,
} from "react-hook-form";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "seed-design/ui/select";
import { COLLEGE_DEPARTMENTS, departmentsFor } from "@/entities/application";
import type { ApplicationFormInput } from "../model/schema";

type CollegePath = "college" | `teamMembers.${number}.college`;
type DepartmentPath = "department" | `teamMembers.${number}.department`;

// Reused for both the applicant's own 단과대/학과 and each team member row —
// the department list depends on the selected college, so picking a college
// resets whatever department was previously selected.
export function CollegeDepartmentFields({
  control,
  setValue,
  collegeName,
  departmentName,
  collegeErrorMessage,
  departmentErrorMessage,
}: {
  control: Control<ApplicationFormInput>;
  setValue: UseFormSetValue<ApplicationFormInput>;
  collegeName: CollegePath;
  departmentName: DepartmentPath;
  collegeErrorMessage?: string;
  departmentErrorMessage?: string;
}) {
  const college = useWatch({ control, name: collegeName }) || "";

  return (
    <>
      <Controller
        control={control}
        name={collegeName}
        render={({ field }) => (
          <SelectRoot
            label="단과대"
            value={field.value ? [field.value] : []}
            invalid={!!collegeErrorMessage}
            errorMessage={collegeErrorMessage}
            onValueChange={(values) => {
              field.onChange(values[0] ?? "");
              // Not shouldValidate: true — that would immediately flash a
              // "select a department" error the instant the college
              // changes, before the applicant has had a chance to open the
              // now-enabled department dropdown.
              setValue(departmentName, "");
            }}
          >
            <SelectTrigger placeholder="단과대를 선택해주세요" />
            <SelectContent>
              <SelectGroup>
                {COLLEGE_DEPARTMENTS.map((c) => (
                  <SelectItem
                    key={c.college}
                    value={c.college}
                    label={c.college}
                  />
                ))}
              </SelectGroup>
            </SelectContent>
          </SelectRoot>
        )}
      />
      <Controller
        control={control}
        name={departmentName}
        render={({ field }) => (
          <SelectRoot
            label="학과/학부"
            value={field.value ? [field.value] : []}
            disabled={!college}
            invalid={!!departmentErrorMessage}
            errorMessage={departmentErrorMessage}
            onValueChange={(values) => field.onChange(values[0] ?? "")}
          >
            <SelectTrigger
              placeholder={
                college
                  ? "학과/학부를 선택해주세요"
                  : "단과대를 먼저 선택해주세요"
              }
            />
            <SelectContent>
              <SelectGroup>
                {departmentsFor(college).map((d) => (
                  <SelectItem key={d} value={d} label={d} />
                ))}
              </SelectGroup>
            </SelectContent>
          </SelectRoot>
        )}
      />
    </>
  );
}
