"use client";

import { Box, HStack, ScrollFog, VStack } from "@seed-design/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  SidePanelBody,
  SidePanelContent,
  SidePanelFooter,
  SidePanelRoot,
} from "seed-design/ui/side-panel";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import type { Team } from "@/entities/team";
import { ManageTeamForm } from "@/features/manage-team";
import { deleteTeamAction } from "@/features/manage-team/model/actions";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";
import { listAdminTeamRows } from "../model/actions";

const QUERY_KEY = ["admin-team-rows"];

export function AdminTeamTable() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | undefined>(undefined);

  const { data: rowsData = [] } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listAdminTeamRows,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setOpen(false);
    },
  });

  const rows = useMemo(() => {
    const filtered = rowsData.filter((row) => row.team.name.includes(query));
    return [...filtered].sort((a, b) =>
      sortDesc ? b.amount - a.amount : a.amount - b.amount,
    );
  }, [rowsData, query, sortDesc]);

  const openCreate = () => {
    setEditingTeam(undefined);
    setOpen(true);
  };
  const openEdit = (team: Team) => {
    setEditingTeam(team);
    setOpen(true);
  };
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: QUERY_KEY });
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
          {rows.map((row) => (
            <TableRow
              key={row.team.id}
              interactive
              onClick={() => openEdit(row.team)}
            >
              <TableCell>{row.team.name}</TableCell>
              <TableCell align="right">{`${row.amount.toLocaleString()}원`}</TableCell>
              <TableCell align="right">{`${row.investorCount}명`}</TableCell>
              <TableCell align="right">{`${row.rank}위`}</TableCell>
              <TableCell>{row.boothLabel}</TableCell>
            </TableRow>
          ))}
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
                  onClick={() => deleteMutation.mutate(editingTeam.id)}
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
