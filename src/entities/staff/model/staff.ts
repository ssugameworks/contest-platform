export type StaffRole = "admin" | "judge";

export interface Staff {
  id: string;
  name: string;
  role: StaffRole;
}

export const mockStaff: Staff[] = [
  { id: "admin", name: "운영진", role: "admin" },
  { id: "judge1", name: "심사위원 1", role: "judge" },
  { id: "judge2", name: "심사위원 2", role: "judge" },
];

export function findStaffById(id: string): Staff | undefined {
  return mockStaff.find((staff) => staff.id === id);
}

let currentStaff: Staff | null = null;

export function setCurrentStaff(staff: Staff | null): void {
  currentStaff = staff;
}

export function getCurrentStaff(): Staff | null {
  return currentStaff;
}
