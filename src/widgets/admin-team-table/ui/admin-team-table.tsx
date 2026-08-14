"use client";

import { Box, HStack, ScrollFog, VStack } from "@seed-design/react";
import { useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  SidePanelBody,
  SidePanelContent,
  SidePanelFooter,
  SidePanelRoot,
} from "seed-design/ui/side-panel";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import { formatBoothLocation, getBoothByTeamId } from "@/entities/booth";
import {
  getInvestmentRank,
  getInvestorCount,
  mockLeaderboard,
} from "@/entities/investment";
import { deleteTeam, mockTeams, type Team } from "@/entities/team";
import { ManageTeamForm } from "@/features/manage-team";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

export function AdminTeamTable() {
  const [, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);

  const rows = useMemo(() => {
    const filtered = mockTeams.filter((team) => team.name.includes(query));
    return [...filtered].sort((a, b) => {
      const amountA =
        mockLeaderboard.find((entry) => entry.teamId === a.id)?.amount ?? 0;
      const amountB =
        mockLeaderboard.find((entry) => entry.teamId === b.id)?.amount ?? 0;
      return sortDesc ? amountB - amountA : amountA - amountB;
    });
    // rows re-derived from mockTeams on every render; setVersion forces a re-render after CRUD
  }, [query, sortDesc]);

  const openCreate = () => {
    setEditingTeam(undefined);
    setOpen(true);
  };
  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setOpen(true);
  };
  const refresh = () => {
    setVersion((v) => v + 1);
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <HStack gap="x2" width="full" justify="space-between" align="flex-end">
        <TextField label="팀 검색">
          <TextFieldInput
            placeholder="팀 이름으로 검색"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </TextField>
        <ActionButton
          type="button"
          variant="brandSolid"
          size="large"
          onClick={openCreate}
        >
          새 팀 추가
        </ActionButton>
      </HStack>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>팀명</TableHeadCell>
            <TableHeadCell align="right" onClick={() => setSortDesc((d) => !d)}>
              {`모금액 ${sortDesc ? "↓" : "↑"}`}
            </TableHeadCell>
            <TableHeadCell align="right">투자자 수</TableHeadCell>
            <TableHeadCell align="right">등수</TableHeadCell>
            <TableHeadCell>부스 위치</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((team) => {
            const amount =
              mockLeaderboard.find((entry) => entry.teamId === team.id)
                ?.amount ?? 0;
            const investorCount = getInvestorCount(team.id);
            const { rank } = getInvestmentRank(team.id);
            const booth = getBoothByTeamId(team.id);
            return (
              <TableRow
                key={team.id}
                interactive
                onClick={() => openEdit(team)}
              >
                <TableCell>{team.name}</TableCell>
                <TableCell align="right">{`${amount.toLocaleString()}원`}</TableCell>
                <TableCell align="right">{`${investorCount}명`}</TableCell>
                <TableCell align="right">{`${rank}위`}</TableCell>
                <TableCell>
                  {booth ? formatBoothLocation(booth) : "-"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <SidePanelRoot open={open} onOpenChange={setOpen}>
        <SidePanelContent title={editingTeam ? "팀 수정" : "팀 추가"}>
          <SidePanelBody paddingX="x6">
            <ScrollFog placement={["top", "bottom"]}>
              <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
                <ManageTeamForm
                  key={editingTeam?.id ?? "create"}
                  team={editingTeam}
                  onSaved={refresh}
                />
              </Box>
            </ScrollFog>
          </SidePanelBody>
          <SidePanelFooter>
            <VStack gap="x2" width="full">
              <ActionButton
                type="submit"
                form="manage-team-form"
                variant="brandSolid"
                size="large"
                className="w-full"
              >
                저장
              </ActionButton>
              {editingTeam && (
                <ActionButton
                  type="button"
                  variant="criticalSolid"
                  size="large"
                  className="w-full"
                  onClick={() => {
                    deleteTeam(editingTeam.id);
                    refresh();
                  }}
                >
                  삭제
                </ActionButton>
              )}
            </VStack>
          </SidePanelFooter>
        </SidePanelContent>
      </SidePanelRoot>
    </VStack>
  );
}
