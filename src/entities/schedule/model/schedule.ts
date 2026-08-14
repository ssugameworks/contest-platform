export type ScheduleStatus = "done" | "current" | "upcoming";

export interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  description?: string;
  status: ScheduleStatus;
}

export const mockSchedule: ScheduleItem[] = [
  { id: "schedule-1", time: "13:00", title: "부스 오픈", status: "done" },
  {
    id: "schedule-2",
    time: "14:00",
    title: "심사위원 부스 심사",
    status: "done",
  },
  {
    id: "schedule-3",
    time: "15:30",
    title: "투자 라운드",
    description: "가상 투자금 10만원으로 마음에 드는 팀에 투자해보세요",
    status: "current",
  },
  { id: "schedule-4", time: "17:00", title: "투자 마감", status: "upcoming" },
  {
    id: "schedule-5",
    time: "17:30",
    title: "결과 발표 및 시상식",
    status: "upcoming",
  },
];
