import { createAdminClient } from "@/shared/lib/supabase/admin";
import { throwIfError } from "@/shared/lib/supabase/query";

export type ApplicationRole = "pm" | "design" | "developer";
export type ApplicationType = "individual" | "team";
export type ApplicationStatus =
  | "submitted"
  | "reviewing"
  | "accepted"
  | "rejected";

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

export interface Application extends ApplicationInput {
  id: string;
  status: ApplicationStatus;
  createdAt: string;
}

// A single string literal (not a concatenation) — supabase-js parses this
// type at the type level to infer the query result shape, and a widened
// `string` from string concatenation defeats that, silently degrading the
// whole query to an untyped/error type.
const APPLICATION_SELECT =
  "id, name, student_id, college, department, phone, birth_date, role, application_type, status, created_at, application_team_members(name, college, department, position)" as const;

interface ApplicationRow {
  id: string;
  name: string;
  student_id: string;
  college: string;
  department: string;
  phone: string;
  birth_date: string;
  role: string;
  application_type: string;
  status: string;
  created_at: string;
  application_team_members: {
    name: string;
    college: string;
    department: string;
    position: number;
  }[];
}

function mapApplication(row: ApplicationRow): Application {
  return {
    id: row.id,
    name: row.name,
    studentId: row.student_id,
    college: row.college,
    department: row.department,
    phone: row.phone,
    birthDate: row.birth_date,
    role: row.role as ApplicationRole,
    applicationType: row.application_type as ApplicationType,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at,
    teamMembers: [...row.application_team_members]
      .sort((a, b) => a.position - b.position)
      .map((member) => ({
        name: member.name,
        college: member.college,
        department: member.department,
      })),
  };
}

// applications has no public SELECT policy (contains PII) — admin-only
// reads go through the service-role client, same as participants.
export async function listApplications(): Promise<Application[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("applications")
    .select(APPLICATION_SELECT)
    .order("created_at", { ascending: false });
  throwIfError(error);
  return (data ?? []).map(mapApplication);
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id);
  throwIfError(error);
}

export async function deleteApplication(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("applications").delete().eq("id", id);
  throwIfError(error);
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
