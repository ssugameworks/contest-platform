import { describe, expect, mock, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import type { ApplicationFormInput } from "../model/schema";

// CollegeDepartmentFields (rendered inside TeamMembersField) imports college
// data from the "@/entities/application" barrel, which also re-exports
// server actions from a "use server" file pulling in the Supabase
// server-only client — that chain isn't importable outside Next's RSC
// bundling, so it's mocked here rather than loaded for real.
mock.module("@/entities/application", () => ({
  COLLEGE_DEPARTMENTS: [{ college: "IT대학", departments: ["컴퓨터학부"] }],
  departmentsFor: (college: string) =>
    college === "IT대학" ? ["컴퓨터학부"] : [],
}));

const { TeamMembersField } = await import("./team-members-field");

// TeamMembersField only consumes react-hook-form's control/register/setValue,
// so a thin host component gives it a real form context without pulling in
// the whole application form.
function TeamMembersFieldHost() {
  const {
    control,
    register,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormInput>({
    defaultValues: {
      name: "",
      studentId: "",
      college: "",
      department: "",
      phone: "",
      birthDate: "",
      role: "developer",
      applicationType: "team",
      teamMembers: [],
    },
  });

  return (
    <TeamMembersField
      control={control}
      register={register}
      setValue={setValue}
      errors={errors}
    />
  );
}

describe("TeamMembersField", () => {
  test("starts with no members and the count reflecting just the applicant", () => {
    render(<TeamMembersFieldHost />);
    expect(screen.getByText("본인 포함 1/5명")).toBeVisible();
  });

  test("adds a member row and updates the headcount when '+ 팀원 추가' is clicked", async () => {
    const user = userEvent.setup();
    render(<TeamMembersFieldHost />);

    await user.click(screen.getByRole("button", { name: "+ 팀원 추가" }));

    expect(screen.getByText("본인 포함 2/5명")).toBeVisible();
    expect(screen.getByPlaceholderText("홍길동")).toBeVisible();
  });

  test("removes a member row when its delete button is clicked", async () => {
    const user = userEvent.setup();
    render(<TeamMembersFieldHost />);

    await user.click(screen.getByRole("button", { name: "+ 팀원 추가" }));
    expect(screen.getByText("본인 포함 2/5명")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "팀원 1 삭제" }));

    expect(screen.getByText("본인 포함 1/5명")).toBeVisible();
  });

  test("disables adding once the max of 4 team members is reached", async () => {
    const user = userEvent.setup();
    render(<TeamMembersFieldHost />);

    const addButton = screen.getByRole("button", { name: "+ 팀원 추가" });
    for (let i = 0; i < 4; i++) {
      await user.click(addButton);
    }

    expect(screen.getByText("본인 포함 5/5명")).toBeVisible();
    expect(addButton).toBeDisabled();
    expect(
      screen.getByText("최대 5명(본인 포함)까지 지원할 수 있어요"),
    ).toBeVisible();
  });

  test("shows the help bubble copy explaining every member must self-report", () => {
    render(<TeamMembersFieldHost />);
    expect(
      screen.getByText(
        "나만 팀원을 적으면 안 돼요! 같이 할 친구들도 각자 자기 지원서에 나머지 팀원을 빠짐없이 적어주세요.",
      ),
    ).toBeVisible();
  });
});
