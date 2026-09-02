import { sumBy } from "es-toolkit";

export interface RubricCriterion {
  id: string;
  label: string;
  maxScore: number;
}

export const rubricCriteria: RubricCriterion[] = [
  { id: "problem", label: "문제 정의 및 혁신성", maxScore: 10 },
  { id: "tech", label: "기술 완성도", maxScore: 10 },
  { id: "feasibility", label: "실행 가능성 및 사업성", maxScore: 10 },
  { id: "presentation", label: "발표력", maxScore: 10 },
];

export const rubricMaxTotal = sumBy(
  rubricCriteria,
  (criterion) => criterion.maxScore,
);
