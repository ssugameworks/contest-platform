"use client";

import { HStack, Text, VStack } from "@seed-design/react";
import { useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  getEvaluation,
  getEvaluationTotal,
  getScoreLeaderboard,
  scoreWeights,
  setInvestmentWeight,
  upsertEvaluation,
} from "@/entities/score";
import { mockStaff } from "@/entities/staff";
import { getTeamById } from "@/entities/team";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

type SortKey = "investmentScore" | "judgeScore" | "finalScore";

const judges = mockStaff.filter((staff) => staff.role === "judge");

export function AdminScoreTable() {
  const [, setVersion] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>("finalScore");
  const [sortDesc, setSortDesc] = useState(true);
  const [weightInput, setWeightInput] = useState(
    scoreWeights.investmentPercent,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: weightInput drives getScoreLeaderboard() via mutated module state, not a direct reference
  const rows = useMemo(() => {
    const entries = getScoreLeaderboard();
    return [...entries].sort((a, b) =>
      sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
    );
  }, [sortKey, sortDesc, weightInput]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  const unlock = (judgeId: string, teamId: string) => {
    upsertEvaluation(judgeId, teamId, { submitted: false });
    setVersion((v) => v + 1);
  };

  return (
    <VStack gap="x4" width="full">
      <TextField
        label="투자 점수 가중치 (%)"
        description={`심사위원 점수 가중치는 자동으로 ${100 - weightInput}%가 돼요`}
      >
        <TextFieldInput
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={weightInput}
          onChange={(e) => {
            const value = Math.min(
              100,
              Math.max(0, e.target.valueAsNumber || 0),
            );
            setWeightInput(value);
            setInvestmentWeight(value);
          }}
        />
      </TextField>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>순위</TableHeadCell>
            <TableHeadCell>팀명</TableHeadCell>
            {judges.map((judge) => (
              <TableHeadCell key={judge.id}>{judge.name}</TableHeadCell>
            ))}
            <TableHeadCell
              align="right"
              onClick={() => toggleSort("judgeScore")}
            >
              {`심사위원 평균 ${sortKey === "judgeScore" ? (sortDesc ? "↓" : "↑") : ""}`}
            </TableHeadCell>
            <TableHeadCell
              align="right"
              onClick={() => toggleSort("investmentScore")}
            >
              {`투자 점수 ${sortKey === "investmentScore" ? (sortDesc ? "↓" : "↑") : ""}`}
            </TableHeadCell>
            <TableHeadCell
              align="right"
              onClick={() => toggleSort("finalScore")}
            >
              {`최종 점수 ${sortKey === "finalScore" ? (sortDesc ? "↓" : "↑") : ""}`}
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((entry, index) => {
            const team = getTeamById(entry.teamId);
            return (
              <TableRow key={entry.teamId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{team?.name ?? entry.teamId}</TableCell>
                {judges.map((judge) => {
                  const evaluation = getEvaluation(judge.id, entry.teamId);
                  return (
                    <TableCell key={judge.id}>
                      {evaluation?.submitted ? (
                        <HStack gap="x2" align="center">
                          <Text
                            textStyle="t4Regular"
                            style={{
                              color: "var(--seed-color-fg-positive)",
                            }}
                          >
                            {`제출완료 (${getEvaluationTotal(evaluation)}점)`}
                          </Text>
                          <ActionButton
                            type="button"
                            variant="ghost"
                            size="xsmall"
                            onClick={() => unlock(judge.id, entry.teamId)}
                          >
                            잠금 해제
                          </ActionButton>
                        </HStack>
                      ) : (
                        <Text textStyle="t4Regular" color="fg.neutralSubtle">
                          미채점
                        </Text>
                      )}
                    </TableCell>
                  );
                })}
                <TableCell align="right">{entry.judgeScore}</TableCell>
                <TableCell align="right">{entry.investmentScore}</TableCell>
                <TableCell align="right">{entry.finalScore}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </VStack>
  );
}
