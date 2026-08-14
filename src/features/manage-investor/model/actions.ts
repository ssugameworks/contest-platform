"use server";

import { type Investor, listInvestors } from "@/entities/investor";
import { createAdminClient } from "@/shared/lib/supabase/admin";

export async function listInvestorsAction(): Promise<Investor[]> {
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
  const supabase = createAdminClient();
  const { error } = await supabase.from("investors").insert({
    name: input.name,
    student_id: input.studentId,
    total_budget: input.totalBudget,
  });
  if (error) throw new Error(error.message);
}

export async function updateInvestorAction(
  id: string,
  input: InvestorWriteInput,
): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("investors")
    .update({
      name: input.name,
      student_id: input.studentId,
      total_budget: input.totalBudget,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteInvestorAction(id: string): Promise<void> {
  const supabase = createAdminClient();
  const { error } = await supabase.from("investors").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
