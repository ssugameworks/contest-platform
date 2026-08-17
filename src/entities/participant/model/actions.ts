"use server";

import { requireAdmin } from "@/entities/staff/model/session";
import { listParticipants, type Participant } from "./participant";

export async function listParticipantsAction(): Promise<Participant[]> {
  await requireAdmin();
  return listParticipants();
}
