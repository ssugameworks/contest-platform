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
import {
  deleteInvestor,
  type Investor,
  mockInvestors,
} from "@/entities/investor";
import { ManageInvestorForm } from "@/features/manage-investor";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

export function AdminInvestorTable() {
  const [, setVersion] = useState(0);
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | undefined>(
    undefined,
  );

  const rows = useMemo(() => {
    const filtered = mockInvestors.filter(
      (investor) =>
        investor.name.includes(query) || investor.studentId.includes(query),
    );
    return [...filtered].sort((a, b) =>
      sortDesc ? b.totalBudget - a.totalBudget : a.totalBudget - b.totalBudget,
    );
  }, [query, sortDesc]);

  const openCreate = () => {
    setEditingInvestor(undefined);
    setOpen(true);
  };
  const openEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setOpen(true);
  };
  const refresh = () => {
    setVersion((v) => v + 1);
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <HStack gap="x2" width="full" justify="space-between" align="flex-end">
        <TextField label="투자자 검색">
          <TextFieldInput
            placeholder="이름 또는 학번으로 검색"
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
          새 투자자 추가
        </ActionButton>
      </HStack>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>이름</TableHeadCell>
            <TableHeadCell>학번</TableHeadCell>
            <TableHeadCell align="right" onClick={() => setSortDesc((d) => !d)}>
              {`보유 예산 ${sortDesc ? "↓" : "↑"}`}
            </TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((investor) => (
            <TableRow
              key={investor.id}
              interactive
              onClick={() => openEdit(investor)}
            >
              <TableCell>{investor.name}</TableCell>
              <TableCell>{investor.studentId}</TableCell>
              <TableCell align="right">{`${investor.totalBudget.toLocaleString()}원`}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SidePanelRoot open={open} onOpenChange={setOpen}>
        <SidePanelContent
          title={editingInvestor ? "투자자 수정" : "투자자 추가"}
        >
          <SidePanelBody paddingX="x6">
            <ScrollFog placement={["top", "bottom"]}>
              <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
                <ManageInvestorForm
                  key={editingInvestor?.id ?? "create"}
                  investor={editingInvestor}
                  onSaved={refresh}
                />
              </Box>
            </ScrollFog>
          </SidePanelBody>
          <SidePanelFooter>
            <VStack gap="x2" width="full">
              <ActionButton
                type="submit"
                form="manage-investor-form"
                variant="brandSolid"
                size="large"
                className="w-full"
              >
                저장
              </ActionButton>
              {editingInvestor && (
                <ActionButton
                  type="button"
                  variant="criticalSolid"
                  size="large"
                  className="w-full"
                  onClick={() => {
                    deleteInvestor(editingInvestor.id);
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
