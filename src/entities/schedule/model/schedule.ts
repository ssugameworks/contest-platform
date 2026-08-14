import dayjs, { type Dayjs } from "dayjs";
import { throwIfError } from "@/shared/lib/supabase/query";
import { createClient } from "@/shared/lib/supabase/server";

export type ScheduleStatus = "done" | "current" | "upcoming";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  status: ScheduleStatus;
}

interface ScheduleRow {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
}

export function computeScheduleStatus(
  rows: ScheduleRow[],
  now: Dayjs = dayjs(),
): ScheduleItem[] {
  const sorted = [...rows].sort(
    (a, b) => dayjs(a.starts_at).valueOf() - dayjs(b.starts_at).valueOf(),
  );
  return sorted.map((row, index) => {
    const startsAt = dayjs(row.starts_at);
    const next = sorted[index + 1];
    const status: ScheduleStatus =
      next && !now.isBefore(dayjs(next.starts_at))
        ? "done"
        : now.isBefore(startsAt)
          ? "upcoming"
          : "current";
    return {
      id: row.id,
      time: startsAt.format("HH:mm"),
      title: row.title,
      description: row.description ?? undefined,
      status,
    };
  });
}

export async function listSchedule(): Promise<ScheduleItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("schedule_items")
    .select("id, title, description, starts_at")
    .order("starts_at", { ascending: true });
  throwIfError(error);
  return computeScheduleStatus(data ?? []);
}
