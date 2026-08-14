"use client";

import { HStack, Text, VStack } from "@seed-design/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  getInvestmentWeightAction,
  getScoreLeaderboardAction,
  setInvestmentWeightAction,
} from "@/entities/score/model/actions";
import { getEvaluationTotal } from "@/entities/score/model/pure";
import { listJudgesAction } from "@/entities/staff/model/actions";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  getEvaluationAction,
  unlockEvaluationAction,
} from "@/features/evaluate-team/model/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

type SortKey = "investmentScore" | "judgeScore" | "finalScore";

function JudgeCell({ judgeId, teamId }: { judgeId: string; teamId: string }) {
  const queryClient = useQueryClient();
  const queryKey = ["evaluation", judgeId, teamId];
  const { data: evaluation } = useQuery({
    queryKey,
    queryFn: () => getEvaluationAction(judgeId, teamId),
  });

  if (!evaluation?.submitted) {
    return (
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        미채점
      </Text>
    );
  }

  return (
    <HStack gap="x2" align="center">
      <Text
        textStyle="t4Regular"
        style={{ color: "var(--seed-color-fg-positive)" }}
      >
        {`제출완료 (${getEvaluationTotal(evaluation)}점)`}
      </Text>
      <ActionButton
        type="button"
        variant="ghost"
        size="xsmall"
        onClick={async () => {
          await unlockEvaluationAction(judgeId, teamId);
          queryClient.invalidateQueries({ queryKey });
        }}
      >
        잠금 해제
      </ActionButton>
    </HStack>
  );
}

export function AdminScoreTable() {
  const queryClient = useQueryClient();
  const [sortKey, setSortKey] = useState<SortKey>("finalScore");
  const [sortDesc, setSortDesc] = useState(true);

  const { data: entries = [] } = useQuery({
    queryKey: ["score-leaderboard"],
    queryFn: getScoreLeaderboardAction,
  });
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const { data: judges = [] } = useQuery({
    queryKey: ["judges"],
    queryFn: listJudgesAction,
  });
  const { data: weight = 50 } = useQuery({
    queryKey: ["investment-weight"],
    queryFn: getInvestmentWeightAction,
  });

  const rows = [...entries].sort((a, b) =>
    sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey],
  );

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((d) => !d);
    } else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <VStack gap="x4" width="full">
      <TextField
        label="투자 점수 가중치 (%)"
        description={`심사위원 점수 가중치는 자동으로 ${100 - weight}%가 돼요`}
      >
        <TextFieldInput
          type="number"
          inputMode="numeric"
          min={0}
          max={100}
          value={weight}
          onChange={async (e) => {
            const value = Math.min(
              100,
              Math.max(0, e.target.valueAsNumber || 0),
            );
            await setInvestmentWeightAction(value);
            queryClient.invalidateQueries({ queryKey: ["investment-weight"] });
            queryClient.invalidateQueries({ queryKey: ["score-leaderboard"] });
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
            const team = teams.find((t) => t.id === entry.teamId);
            return (
              <TableRow key={entry.teamId}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{team?.name ?? entry.teamId}</TableCell>
                {judges.map((judge) => (
                  <TableCell key={judge.id}>
                    <JudgeCell judgeId={judge.id} teamId={entry.teamId} />
                  </TableCell>
                ))}
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
