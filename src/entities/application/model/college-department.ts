// Best-effort snapshot of 숭실대학교's 단과대/학과 structure, compiled from
// public sources (not scraped from an official, always-current listing) —
// verify against https://iphak.ssu.ac.kr before relying on this for a real
// application cycle, and update this single array if departments changed.
export const COLLEGE_DEPARTMENTS = [
  {
    college: "IT대학",
    departments: [
      "글로벌미디어학부",
      "컴퓨터학부",
      "전자정보공학부",
      "디지털미디어학과",
    ],
  },
  { college: "AI대학", departments: ["AI소프트웨어학부", "정보보호학과"] },
  {
    college: "인문대학",
    departments: [
      "기독교학과",
      "국어국문학과",
      "영어영문학과",
      "독어독문학과",
      "불어불문학과",
      "중어중문학과",
      "일어일문학과",
      "철학과",
      "사학과",
      "예술창작학부",
      "스포츠학부",
    ],
  },
  {
    college: "자연과학대학",
    departments: [
      "수학과",
      "물리학과",
      "화학과",
      "정보통계·보험수리학과",
      "의생명시스템학부",
    ],
  },
  { college: "법과대학", departments: ["법학과", "국제법무학과"] },
  {
    college: "사회과학대학",
    departments: [
      "사회복지학부",
      "행정학부",
      "정치외교학과",
      "정보사회학과",
      "언론홍보학과",
      "평생교육학과",
    ],
  },
  {
    college: "경제통상대학",
    departments: ["경제학과", "글로벌통상학과", "금융경제학과", "국제무역학과"],
  },
  {
    college: "경영대학",
    departments: ["경영학부", "벤처중소기업학과", "회계학과", "금융학부"],
  },
  {
    college: "공과대학",
    departments: [
      "화학공학과",
      "신소재공학과",
      "전기공학부",
      "기계공학부",
      "산업정보시스템공학과",
      "건축학부",
    ],
  },
  { college: "베어드학부대학", departments: ["자유전공학부"] },
] as const;

export type College = (typeof COLLEGE_DEPARTMENTS)[number]["college"];

export function departmentsFor(college: string): readonly string[] {
  return (
    COLLEGE_DEPARTMENTS.find((c) => c.college === college)?.departments ?? []
  );
}
