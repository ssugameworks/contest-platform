"use server";

import { type Investor, listInvestors } from "@/entities/investor";
import { requireAdmin } from "@/entities/staff/model/session";
import { createAdminClient } from "@/shared/lib/supabase/admin";
import { manageInvestorSchema } from "./schema";

export async function listInvestorsAction(): Promise<Investor[]> {
  await requireAdmin();
  return listInvestors();
}

export interface InvestorWriteInput {
  name: string;
  studentId: string;
  totalBudget: number;
}

export async function createInvestorAction(
  input: InvestorWriteInput,
): Promise<void> {
  await requireAdmin();
  const parsed = manageInvestorSchema.parse(input);
  const supabase = createAdminClient();
  const { error } = await supabase.from("investors").insert({
    name: parsed.name,
    student_id: parsed.studentId,
    total_budget: parsed.totalBudget,
  });
  if (error) throw new Error(error.message);
}

export async function updateInvestorAction(
  id: string,
  input: InvestorWriteInput,
): Promise<void> {
  await requireAdmin();
  const parsed = manageInvestorSchema.parse(input);
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("investors")
    .update({
      name: parsed.name,
      student_id: parsed.studentId,
      total_budget: parsed.totalBudget,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteInvestorAction(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("investors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
