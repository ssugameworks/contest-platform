"use server";

import { listParticipants, type Participant } from "./participant";

export async function listParticipantsAction(): Promise<Participant[]> {
  return listParticipants();
}
