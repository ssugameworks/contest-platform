"use client";

import {
  Box,
  HStack,
  ResponsivePair,
  ScrollFog,
  VStack,
} from "@seed-design/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type ReactNode, useMemo, useState } from "react";
import { ActionButton } from "seed-design/ui/action-button";
import {
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogRoot,
  AlertDialogTitle,
} from "seed-design/ui/alert-dialog";
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: items = [], isError } = useQuery({ queryKey, queryFn });

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
    setConfirmDelete(false);
    setOpen(true);
  };
  const openEdit = (item: T) => {
    setEditing(item);
    setConfirmDelete(false);
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
                aria-sort={
                  column.sortValue
                    ? sortDesc
                      ? "descending"
                      : "ascending"
                    : undefined
                }
              >
                {column.sortValue ? (
                  <button
                    type="button"
                    onClick={() => setSortDesc((d) => !d)}
                    style={{
                      all: "unset",
                      cursor: "pointer",
                    }}
                  >
                    {`${column.header} ${sortDesc ? "↓" : "↑"}`}
                  </button>
                ) : (
                  column.header
                )}
              </TableHeadCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {isError && (
            <TableRow>
              <TableCell colSpan={columns.length}>
                목록을 불러오지 못했어요
              </TableCell>
            </TableRow>
          )}
          {!isError &&
            rows.map((item) => (
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
                  loading={deleteMutation.isPending}
                  disabled={deleteMutation.isPending}
                  onClick={() => setConfirmDelete(true)}
                >
                  삭제
                </ActionButton>
              )}
            </VStack>
          </SidePanelFooter>
        </SidePanelContent>
      </SidePanelRoot>

      <AlertDialogRoot open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ResponsivePair gap="x2">
              <AlertDialogAction
                variant="neutralWeak"
                onClick={() => setConfirmDelete(false)}
              >
                취소
              </AlertDialogAction>
              <AlertDialogAction
                variant="criticalSolid"
                onClick={() => {
                  setConfirmDelete(false);
                  if (editing) deleteMutation.mutate(getId(editing));
                }}
              >
                삭제
              </AlertDialogAction>
            </ResponsivePair>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>
    </VStack>
  );
}
