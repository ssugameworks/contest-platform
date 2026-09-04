import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";

export type ApplicationRole = "pm" | "design" | "developer";
export type ApplicationType = "individual" | "team";

export interface TeamMemberInput {
  name: string;
  college: string;
  department: string;
}

export interface ApplicationInput {
  name: string;
  studentId: string;
  college: string;
  department: string;
  phone: string;
  birthDate: string;
  role: ApplicationRole;
  applicationType: ApplicationType;
  teamMembers: TeamMemberInput[];
}

// applications has no public SELECT policy (contains PII) — reads go
// through the service-role client, same as participants.
export async function findApplicationByStudentId(
  studentId: string,
): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id")
    .eq("student_id", studentId)
    .maybeSingle();
  throwIfError(error);
  return !!data;
}

export async function createApplication(
  input: ApplicationInput,
): Promise<void> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      name: input.name,
      student_id: input.studentId,
      college: input.college,
      department: input.department,
      phone: input.phone,
      birth_date: input.birthDate,
      role: input.role,
      application_type: input.applicationType,
    })
    .select("id")
    .single();
  throwIfError(error);
  if (!data) throw new Error("지원서 생성에 실패했어요");

  if (input.applicationType === "team" && input.teamMembers.length > 0) {
    const { error: membersError } = await supabase
      .from("application_team_members")
      .insert(
        input.teamMembers.map((member, index) => ({
          application_id: data.id,
          position: index,
          name: member.name,
          college: member.college,
          department: member.department,
        })),
      );
    throwIfError(membersError);
  }
}
