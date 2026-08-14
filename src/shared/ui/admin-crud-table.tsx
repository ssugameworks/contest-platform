"use client";

import { Box, HStack, ScrollFog, VStack } from "@seed-design/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  SidePanelBody,
  SidePanelContent,
  SidePanelFooter,
  SidePanelRoot,
} from "seed-design/ui/side-panel";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

export interface AdminCrudColumn<T> {
  header: string;
  align?: "left" | "right" | "center";
  cell: (item: T) => ReactNode;
  // present on at most one column — that column's header becomes a sort toggle
  sortValue?: (item: T) => number;
}

export interface AdminCrudTableProps<T> {
  queryKey: unknown[];
  queryFn: () => Promise<T[]>;
  getId: (item: T) => string;
  columns: AdminCrudColumn<T>[];
  searchLabel: string;
  searchPlaceholder: string;
  searchPredicate: (item: T, query: string) => boolean;
  addButtonLabel: string;
  panelTitle: { create: string; edit: string };
  formId: string;
  renderForm: (item: T | undefined, onSaved: () => void) => ReactNode;
  deleteAction: (id: string) => Promise<void>;
  defaultSortDesc?: boolean;
}

export function AdminCrudTable<T>({
  queryKey,
  queryFn,
  getId,
  columns,
  searchLabel,
  searchPlaceholder,
  searchPredicate,
  addButtonLabel,
  panelTitle,
  formId,
  renderForm,
  deleteAction,
  defaultSortDesc = true,
}: AdminCrudTableProps<T>) {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const [query, setQuery] = useState("");
  const [sortDesc, setSortDesc] = useState(defaultSortDesc);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | undefined>(undefined);

  const { data: items = [] } = useQuery({ queryKey, queryFn });

  const deleteMutation = useMutation({
    mutationFn: deleteAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setOpen(false);
    },
    onError: (error) => {
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar message={error.message} />,
      });
    },
  });

  const sortColumn = columns.find((column) => column.sortValue);

  const rows = useMemo(() => {
    const filtered = items.filter((item) => searchPredicate(item, query));
    const sortValue = sortColumn?.sortValue;
    if (!sortValue) return filtered;
    return [...filtered].sort((a, b) =>
      sortDesc ? sortValue(b) - sortValue(a) : sortValue(a) - sortValue(b),
    );
  }, [items, query, sortDesc, searchPredicate, sortColumn]);

  const openCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };
  const openEdit = (item: T) => {
    setEditing(item);
    setOpen(true);
  };
  const refresh = () => {
    queryClient.invalidateQueries({ queryKey });
    setOpen(false);
  };

  return (
    <VStack gap="x4" width="full">
      <HStack gap="x2" width="full" justify="space-between" align="flex-end">
        <TextField label={searchLabel}>
          <TextFieldInput
            placeholder={searchPlaceholder}
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
          {addButtonLabel}
        </ActionButton>
      </HStack>

      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableHeadCell
                key={column.header}
                align={column.align}
                onClick={
                  column.sortValue ? () => setSortDesc((d) => !d) : undefined
                }
              >
                {column.sortValue
                  ? `${column.header} ${sortDesc ? "↓" : "↑"}`
                  : column.header}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((item) => (
            <TableRow
              key={getId(item)}
              interactive
              onClick={() => openEdit(item)}
            >
              {columns.map((column) => (
                <TableCell key={column.header} align={column.align}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SidePanelRoot open={open} onOpenChange={setOpen}>
        <SidePanelContent title={editing ? panelTitle.edit : panelTitle.create}>
          <SidePanelBody paddingX="x6">
            <ScrollFog placement={["top", "bottom"]}>
              <Box style={{ paddingTop: 20, paddingBottom: 20 }}>
                {renderForm(editing, refresh)}
              </Box>
            </ScrollFog>
          </SidePanelBody>
          <SidePanelFooter>
            <VStack gap="x2" width="full">
              <ActionButton
                type="submit"
                form={formId}
                variant="brandSolid"
                size="large"
                className="w-full"
              >
                저장
              </ActionButton>
              {editing && (
                <ActionButton
                  type="button"
                  variant="criticalSolid"
                  size="large"
                  className="w-full"
                  onClick={() => deleteMutation.mutate(getId(editing))}
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
