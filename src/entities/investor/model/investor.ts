import { createClient } from "@/shared/lib/supabase/server";

export interface Investor {
  id: string;
  studentId: string;
  name: string;
  totalBudget: number;
}

function mapInvestor(row: {
  id: string;
  student_id: string;
  name: string;
  total_budget: number;
}): Investor {
  return {
    id: row.id,
    studentId: row.student_id,
    name: row.name,
    totalBudget: row.total_budget,
  };
}

export async function getInvestorById(id: string): Promise<Investor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investors")
    .select("id, student_id, name, total_budget")
    .eq("id", id)
    .maybeSingle();
  return data ? mapInvestor(data) : null;
}

export async function listInvestors(): Promise<Investor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investors")
    .select("id, student_id, name, total_budget");
  return (data ?? []).map(mapInvestor);
}

// 아직 학생 인증이 없어 "나"를 구분할 방법이 없다 — mockCurrentInvestor와 동일한
// 한계로, 고정 seed 투자자 한 명을 "나"로 취급한다. 인증이 붙으면 세션의
// student_id로 조회하도록 바꿀 것.
export async function getCurrentInvestor(): Promise<Investor | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investors")
    .select("id, student_id, name, total_budget")
    .eq("student_id", "20241001")
    .maybeSingle();
  return data ? mapInvestor(data) : null;
}

export async function getInvestorBudget(investorId: string): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("investor_budgets")
    .select("remaining_budget")
    .eq("investor_id", investorId)
    .maybeSingle();
  return data?.remaining_budget ?? 0;
}
