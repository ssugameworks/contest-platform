"use client";

import { Box, HStack, ResponsivePair, Text, VStack } from "@seed-design/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Checkbox } from "seed-design/ui/checkbox";
import {
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectRoot,
  SelectTrigger,
} from "seed-design/ui/select";
import {
  SidePanelBody,
  SidePanelContent,
  SidePanelFooter,
  SidePanelRoot,
} from "seed-design/ui/side-panel";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";
import {
  getBoothMatrixConfigAction,
  listBoothsAction,
} from "@/entities/booth/model/actions";
import { type Booth, formatBoothLocation } from "@/entities/booth/model/pure";
import { listTeamsAction } from "@/entities/team/model/actions";
import {
  assignTeamToBoothAction,
  createBoothAction,
  deleteBoothAction,
  setBoothBlockedAction,
  setBoothMatrixConfigAction,
} from "@/features/manage-booths/model/actions";

const UNASSIGNED = "__unassigned__";
const BOOTHS_QUERY_KEY = ["admin-booths"];
const MATRIX_CONFIG_QUERY_KEY = ["admin-booth-matrix-config"];
const CELL_MIN_SIZE = 36;
const CELL_MAX_SIZE = 64;
const LABEL_WIDTH = 32;
const ZONE_START_CODE = "A".charCodeAt(0);

function zoneRangeEndingAt(endLetter: string): string[] {
  const endCode = Math.max(ZONE_START_CODE, endLetter.charCodeAt(0));
  return Array.from({ length: endCode - ZONE_START_CODE + 1 }, (_, i) =>
    String.fromCharCode(ZONE_START_CODE + i),
  );
}

type CellState = "undecided" | "blocked" | "available" | "occupied";

function cellStyle(state: CellState): React.CSSProperties {
  switch (state) {
    case "undecided":
      return {
        background: "transparent",
        border: "1px dashed var(--seed-color-stroke-neutral-weak)",
        color: "var(--seed-color-fg-neutral-subtle)",
      };
    case "blocked":
      return {
        background:
          "repeating-linear-gradient(45deg, var(--seed-color-bg-neutral-weak), var(--seed-color-bg-neutral-weak) 4px, transparent 4px, transparent 8px)",
        border: "1px solid var(--seed-color-stroke-neutral-weak)",
        color: "var(--seed-color-fg-neutral-subtle)",
      };
    case "occupied":
      return {
        background: "var(--seed-color-bg-brand-solid)",
        border: "1px solid var(--seed-color-bg-brand-solid)",
        color: "var(--seed-color-palette-static-white)",
      };
    case "available":
      return {
        background: "var(--seed-color-bg-layer-default)",
        border: "1px solid var(--seed-color-stroke-neutral-weak)",
        color: "var(--seed-color-fg-neutral)",
      };
  }
}

interface PendingChange {
  zones: string[];
  columns: number;
  hiddenCount: number;
}

export function AdminBoothGrid() {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const [zoneEndDraft, setZoneEndDraft] = useState<string | null>(null);
  const [columnsDraft, setColumnsDraft] = useState<number | null>(null);
  const [selectedBooth, setSelectedBooth] = useState<Booth | undefined>();
  const [panelOpen, setPanelOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [pendingChange, setPendingChange] = useState<PendingChange | null>(
    null,
  );
  const [editMode, setEditMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  const { data: booths = [] } = useQuery({
    queryKey: BOOTHS_QUERY_KEY,
    queryFn: listBoothsAction,
  });
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const { data: matrixConfig } = useQuery({
    queryKey: MATRIX_CONFIG_QUERY_KEY,
    queryFn: getBoothMatrixConfigAction,
  });
  const isLoading = matrixConfig === undefined;
  // matrixConfig가 로딩되기 전 잠깐 가짜 기본값이 보였다가 실제 저장값으로
  // 바뀌는 게 거슬려서, 로딩 끝날 때까지 아예 안 그려요.
  const persistedZones = matrixConfig?.zones ?? [];
  const columns = columnsDraft ?? matrixConfig?.columns;
  const currentZoneEnd = [...persistedZones].sort().at(-1) ?? "A";
  const zoneEnd = zoneEndDraft ?? currentZoneEnd;
  const zones = zoneRangeEndingAt(zoneEnd);

  const showError = (error: unknown) => {
    adapter.create({
      onClose: () => {},
      render: () => (
        <Snackbar
          message={error instanceof Error ? error.message : "실패했어요"}
        />
      ),
    });
  };

  const createMutation = useMutation({
    mutationFn: ({ zone, number }: { zone: string; number: number }) =>
      createBoothAction(zone, number),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BOOTHS_QUERY_KEY }),
    onError: showError,
  });

  const configMutation = useMutation({
    mutationFn: ({ zones, columns }: { zones: string[]; columns: number }) =>
      setBoothMatrixConfigAction(zones, columns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATRIX_CONFIG_QUERY_KEY });
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar variant="positive" message="저장했어요" />,
      });
    },
    onError: showError,
  });

  const assignMutation = useMutation({
    mutationFn: ({
      boothId,
      teamId,
    }: {
      boothId: string;
      teamId: string | null;
    }) => assignTeamToBoothAction(boothId, teamId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BOOTHS_QUERY_KEY }),
    onError: showError,
  });

  const blockMutation = useMutation({
    mutationFn: ({ boothId, blocked }: { boothId: string; blocked: boolean }) =>
      setBoothBlockedAction(boothId, blocked),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: BOOTHS_QUERY_KEY }),
    onError: showError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBoothAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOTHS_QUERY_KEY });
      setPanelOpen(false);
    },
    onError: showError,
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: string[]) =>
      Promise.all(ids.map((id) => deleteBoothAction(id))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: BOOTHS_QUERY_KEY });
      setSelectedIds(new Set());
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar variant="positive" message="삭제했어요" />,
      });
    },
    onError: showError,
  });

  const handleCellClick = (zone: string, number: number) => {
    const existing = booths.find(
      (booth) => booth.zone === zone && booth.number === number,
    );
    if (editMode) {
      // 편집 모드에선 클릭이 즉시 만들기/열기가 아니라 일괄 삭제용 선택
      // 토글이에요. 아직 없는 자리는 선택할 게 없어서 무시해요.
      if (!existing) return;
      setSelectedIds((current) => {
        const next = new Set(current);
        if (next.has(existing.id)) next.delete(existing.id);
        else next.add(existing.id);
        return next;
      });
      return;
    }
    if (existing) {
      setSelectedBooth(existing);
      setConfirmDelete(false);
      setPanelOpen(true);
    } else {
      createMutation.mutate({ zone, number });
    }
  };

  // 구역 범위/번호 개수를 줄이면 그 밖으로 밀려나는 부스는 매트릭스에서
  // 안 보이게 돼요(삭제되진 않음). 팀 배정이 없는 빈 자리는 다시 만들면
  // 그만이라 굳이 안 물어보고, 실제로 팀이 배정된 부스가 걸릴 때만
  // 확인을 받아요 — 그게 진짜 되돌리기 아까운 상황이라서요.
  const commitMatrixChange = (nextZones: string[], nextColumns: number) => {
    const zoneSet = new Set(nextZones);
    const hiddenCount = booths.filter(
      (booth) =>
        booth.teamId !== null &&
        (!zoneSet.has(booth.zone) || booth.number > nextColumns),
    ).length;
    if (hiddenCount > 0) {
      setPendingChange({ zones: nextZones, columns: nextColumns, hiddenCount });
    } else {
      configMutation.mutate({ zones: nextZones, columns: nextColumns });
    }
  };

  const handleSaveZoneEnd = () => {
    if (columns === undefined) return;
    const letter = zoneEnd.trim().toUpperCase().slice(0, 1) || "A";
    if (letter !== currentZoneEnd) {
      commitMatrixChange(zoneRangeEndingAt(letter), columns);
    }
    setZoneEndDraft(null);
  };

  const handleSaveColumns = () => {
    if (columns === undefined || columns === matrixConfig?.columns) return;
    commitMatrixChange(persistedZones, columns);
    setColumnsDraft(null);
  };

  const assignedTeamIds = new Set(
    booths
      .filter((booth) => booth.id !== selectedBooth?.id)
      .map((booth) => booth.teamId)
      .filter((id): id is string => id !== null),
  );
  const teamOptions = teams.filter(
    (team) =>
      team.id === selectedBooth?.teamId || !assignedTeamIds.has(team.id),
  );

  if (isLoading || columns === undefined) {
    return (
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        불러오는 중...
      </Text>
    );
  }

  return (
    <VStack gap="x6" width="full">
      <VStack gap="x4" width="full">
        <HStack gap="x2" width="full" justify="space-between" align="flex-end">
          <TextField label="구역 범위">
            <TextFieldInput
              maxLength={1}
              value={zoneEnd}
              onChange={(e) => setZoneEndDraft(e.target.value.toUpperCase())}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveZoneEnd();
              }}
            />
          </TextField>
          <ActionButton
            type="button"
            variant="brandSolid"
            size="large"
            onClick={handleSaveZoneEnd}
          >
            저장
          </ActionButton>
        </HStack>
        <HStack gap="x2" width="full" justify="space-between" align="flex-end">
          <TextField label="구역당 번호 개수">
            <TextFieldInput
              type="number"
              min={1}
              value={columns}
              onChange={(e) => setColumnsDraft(Number(e.target.value) || 1)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveColumns();
              }}
            />
          </TextField>
          <ActionButton
            type="button"
            variant="brandSolid"
            size="large"
            onClick={handleSaveColumns}
          >
            저장
          </ActionButton>
        </HStack>
      </VStack>

      <HStack gap="x4" wrap>
        {(
          [
            ["available", "사용가능"],
            ["occupied", "배정됨"],
            ["blocked", "불가"],
            ["undecided", "미정"],
          ] as [CellState, string][]
        ).map(([state, label]) => (
          <HStack key={state} gap="x1" align="center">
            <Box
              borderRadius="r1"
              style={{ width: 16, height: 16, ...cellStyle(state) }}
            />
            <Text textStyle="t3Regular" color="fg.neutralSubtle">
              {label}
            </Text>
          </HStack>
        ))}
      </HStack>

      <HStack gap="x3" align="center" wrap>
        <ActionButton
          type="button"
          variant={editMode ? "brandSolid" : "neutralWeak"}
          onClick={() => {
            setEditMode((current) => !current);
            setSelectedIds(new Set());
          }}
        >
          {editMode ? "편집 모드 끄기" : "편집 모드 (여러 개 선택해서 삭제)"}
        </ActionButton>
        {editMode && selectedIds.size > 0 && (
          <>
            <Text textStyle="t4Regular" color="fg.neutralSubtle">
              {selectedIds.size}개 선택됨
            </Text>
            <ActionButton
              type="button"
              variant="criticalSolid"
              loading={bulkDeleteMutation.isPending}
              disabled={bulkDeleteMutation.isPending}
              onClick={() => setConfirmBulkDelete(true)}
            >
              선택 삭제
            </ActionButton>
          </>
        )}
      </HStack>

      <Box style={{ overflowX: "auto", width: "100%" }}>
        <div
          style={{
            display: "grid",
            // 열이 적을 때 1fr로만 두면 한 칸이 화면 폭만큼 늘어나 버려서,
            // 최대 크기를 못박아 커봤자 CELL_MAX_SIZE에서 멈추게 해요.
            gridTemplateColumns: `${LABEL_WIDTH}px repeat(${columns}, minmax(${CELL_MIN_SIZE}px, ${CELL_MAX_SIZE}px))`,
            gridAutoRows: "auto",
            gap: 4,
            width: "100%",
            // 칸이 최대 크기에서 멈추고 나면 남는 폭은 가운데로 몰아줘요.
            justifyContent: "center",
          }}
        >
          {zones.map((zone, zoneIndex) => (
            <div
              key={zone}
              style={{
                gridColumn: 1,
                gridRow: zoneIndex + 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              {zone}
            </div>
          ))}
          {zones.flatMap((zone, zoneIndex) =>
            Array.from({ length: columns }, (_, i) => i + 1).map((number) => {
              const booth = booths.find(
                (b) => b.zone === zone && b.number === number,
              );
              const state: CellState = !booth
                ? "undecided"
                : booth.blocked
                  ? "blocked"
                  : booth.teamId
                    ? "occupied"
                    : "available";
              return (
                <button
                  key={`${zone}-${number}`}
                  type="button"
                  title={
                    state === "occupied" && booth?.teamId
                      ? (teams.find((team) => team.id === booth.teamId)?.name ??
                        undefined)
                      : undefined
                  }
                  onClick={() => handleCellClick(zone, number)}
                  style={{
                    gridColumn: number + 1,
                    gridRow: zoneIndex + 1,
                    aspectRatio: "1 / 1",
                    width: "100%",
                    // 셀 자체를 컨테이너로 삼아 폰트 크기를 그 셀의 실제
                    // 렌더링 폭(cqw)에 비례시켜요 — columns가 바뀌어 셀이
                    // 커지거나 작아져도 숫자가 항상 셀에 맞는 크기로 보여요.
                    containerType: "inline-size",
                    fontSize: "clamp(9px, 35cqw, 18px)",
                    borderRadius: 6,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    ...cellStyle(state),
                    ...(booth && selectedIds.has(booth.id)
                      ? {
                          outline:
                            "3px solid var(--seed-color-stroke-brand-solid)",
                          outlineOffset: -3,
                        }
                      : {}),
                  }}
                >
                  {number}
                </button>
              );
            }),
          )}
        </div>
      </Box>

      <SidePanelRoot open={panelOpen} onOpenChange={setPanelOpen}>
        <SidePanelContent
          title={selectedBooth ? formatBoothLocation(selectedBooth) : ""}
        >
          <SidePanelBody paddingX="x6">
            <VStack gap="x4" style={{ paddingTop: 20, paddingBottom: 20 }}>
              {selectedBooth && (
                <>
                  <Checkbox
                    label="이 자리는 사용할 수 없어요"
                    checked={selectedBooth.blocked}
                    onCheckedChange={(checked) => {
                      const blocked = checked === true;
                      setSelectedBooth((current) =>
                        current
                          ? {
                              ...current,
                              blocked,
                              teamId: blocked ? null : current.teamId,
                            }
                          : current,
                      );
                      blockMutation.mutate({
                        boothId: selectedBooth.id,
                        blocked,
                      });
                    }}
                  />
                  {selectedBooth.blocked ? (
                    <Text textStyle="t3Regular" color="fg.neutralSubtle">
                      막힌 자리에는 팀을 배정할 수 없어요
                    </Text>
                  ) : (
                    <SelectRoot
                      label="배정된 팀"
                      value={[selectedBooth.teamId ?? UNASSIGNED]}
                      onValueChange={(values) => {
                        const teamId =
                          values[0] === UNASSIGNED ? null : (values[0] ?? null);
                        setSelectedBooth((current) =>
                          current ? { ...current, teamId } : current,
                        );
                        assignMutation.mutate({
                          boothId: selectedBooth.id,
                          teamId,
                        });
                      }}
                    >
                      <SelectTrigger placeholder="미배정" />
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value={UNASSIGNED} label="미배정" />
                          {teamOptions.map((team) => (
                            <SelectItem
                              key={team.id}
                              value={team.id}
                              label={team.name}
                            />
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </SelectRoot>
                  )}
                </>
              )}
            </VStack>
          </SidePanelBody>
          <SidePanelFooter>
            <ActionButton
              type="button"
              variant="criticalSolid"
              size="large"
              className="w-full"
              loading={deleteMutation.isPending}
              disabled={deleteMutation.isPending}
              onClick={() => setConfirmDelete(true)}
            >
              이 부스 삭제
            </ActionButton>
          </SidePanelFooter>
        </SidePanelContent>
      </SidePanelRoot>

      <AlertDialogRoot open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription>
              배정된 팀이 있다면 함께 해제돼요. 되돌릴 수 없어요.
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
                  if (selectedBooth) deleteMutation.mutate(selectedBooth.id);
                }}
              >
                삭제
              </AlertDialogAction>
            </ResponsivePair>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      <AlertDialogRoot
        open={pendingChange !== null}
        onOpenChange={(open) => {
          if (!open) setPendingChange(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              부스 {pendingChange?.hiddenCount}개가 매트릭스에서 안 보이게 돼요
            </AlertDialogTitle>
            <AlertDialogDescription>
              구역/번호 범위를 줄이면 그 밖의 부스는 화면에서 안 보여요.
              삭제되는 건 아니고, 다시 늘리면 그대로 보여요. 계속할까요?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ResponsivePair gap="x2">
              <AlertDialogAction
                variant="neutralWeak"
                onClick={() => setPendingChange(null)}
              >
                취소
              </AlertDialogAction>
              <AlertDialogAction
                variant="criticalSolid"
                onClick={() => {
                  if (pendingChange) {
                    configMutation.mutate({
                      zones: pendingChange.zones,
                      columns: pendingChange.columns,
                    });
                  }
                  setPendingChange(null);
                }}
              >
                줄이기
              </AlertDialogAction>
            </ResponsivePair>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogRoot>

      <AlertDialogRoot
        open={confirmBulkDelete}
        onOpenChange={setConfirmBulkDelete}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              선택한 부스 {selectedIds.size}개를 삭제할까요?
            </AlertDialogTitle>
            <AlertDialogDescription>
              배정된 팀이 있다면 함께 해제돼요. 되돌릴 수 없어요.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <ResponsivePair gap="x2">
              <AlertDialogAction
                variant="neutralWeak"
                onClick={() => setConfirmBulkDelete(false)}
              >
                취소
              </AlertDialogAction>
              <AlertDialogAction
                variant="criticalSolid"
                onClick={() => {
                  setConfirmBulkDelete(false);
                  bulkDeleteMutation.mutate([...selectedIds]);
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
