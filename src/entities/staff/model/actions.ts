"use server";

import { listJudges, type Staff } from "./staff";

export async function listJudgesAction(): Promise<Staff[]> {
  return listJudges();
}
