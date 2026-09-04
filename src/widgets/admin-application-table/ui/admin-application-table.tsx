"use client";

import IconDocumentTrayLine from "@karrotmarket/react-monochrome-icon/IconDocumentTrayLine";
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
  type Application,
  type ApplicationStatus,
  deleteApplicationAction,
  listApplicationsAction,
  ROLE_OPTIONS,
  updateApplicationStatusAction,
} from "@/entities/application";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from "@/shared/ui/table";

const QUERY_KEY = ["admin-applications"];

const ROLE_LABELS: Record<Application["role"], string> = Object.fromEntries(
  ROLE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<Application["role"], string>;

const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: "submitted", label: "접수됨" },
  { value: "reviewing", label: "검토중" },
  { value: "accepted", label: "합격" },
  { value: "rejected", label: "불합격" },
];
const STATUS_LABELS = Object.fromEntries(
  STATUS_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ApplicationStatus, string>;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

const CSV_HEADER = [
  "이름",
  "학번",
  "단과대",
  "학과",
  "전화번호",
  "생년월일",
  "역할",
  "지원 방식",
  "상태",
  "제출일",
  "팀원",
];

// Applicant-controlled text (name, college, ...) lands in this CSV verbatim
// — a name starting with =, +, -, or @ opens as a live formula in Excel/
// Sheets once an admin double-clicks the file, not as plain text.
function sanitizeForCsv(value: string): string {
  if (/^[=+\-@\t\r]/.test(value)) return `'${value}`;
  return value;
}

// Wrap in quotes (doubling any internal quotes) only when the value actually
// needs it — a comma, quote, or newline would otherwise split the field or
// break the row when the CSV is opened in a spreadsheet app.
function toCsvField(value: string): string {
  const safe = sanitizeForCsv(value);
  if (!/[",\n]/.test(safe)) return safe;
  return `"${safe.replace(/"/g, '""')}"`;
}

function applicationToCsvRow(application: Application): string[] {
  return [
    application.name,
    application.studentId,
    application.college,
    application.department,
    application.phone,
    application.birthDate,
    ROLE_LABELS[application.role],
    application.applicationType === "team" ? "팀 지원" : "개인 지원",
    STATUS_LABELS[application.status],
    formatDate(application.createdAt),
    application.teamMembers
      .map((member) => `${member.name}(${member.college}/${member.department})`)
      .join("; "),
  ];
}

function applicationsToCsv(applications: Application[]): string {
  const rows = [CSV_HEADER, ...applications.map(applicationToCsvRow)];
  return rows.map((row) => row.map(toCsvField).join(",")).join("\r\n");
}

// Excel doesn't assume UTF-8 for a downloaded .csv without a BOM — plain
// UTF-8 text renders Hangul as garbled characters when double-clicked open.
const UTF8_BOM = String.fromCharCode(0xfeff);

function downloadCsv(csv: string, filename: string): void {
  const blob = new Blob([UTF8_BOM + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function AdminApplicationTable() {
  const queryClient = useQueryClient();
  const adapter = useSnackbarAdapter();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Application | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: applications = [], isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: listApplicationsAction,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ApplicationStatus }) =>
      updateApplicationStatusAction(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSelected((current) => (current ? { ...current, status } : current));
      adapter.create({
        onClose: () => {},
        render: () => (
          <Snackbar variant="positive" message="상태를 변경했어요" />
        ),
      });
    },
    onError: (error) => {
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar message={error.message} />,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteApplicationAction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setSelected(undefined);
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar variant="positive" message="삭제했어요" />,
      });
    },
    onError: (error) => {
      adapter.create({
        onClose: () => {},
        render: () => <Snackbar message={error.message} />,
      });
    },
  });

  const rows = applications.filter(
    (application) =>
      application.name.includes(query) || application.studentId.includes(query),
  );

  const handleExport = () => {
    const csv = applicationsToCsv(rows);
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `지원서_${today}.csv`);
  };

  return (
    <VStack gap="x4" width="full">
      <HStack gap="x2" width="full" justify="space-between" align="flex-end">
        <TextField label="지원자 검색">
          <TextFieldInput
            placeholder="이름 또는 학번으로 검색"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </TextField>
        <ActionButton
          type="button"
          variant="neutralOutline"
          size="large"
          disabled={rows.length === 0}
          onClick={handleExport}
        >
          <IconDocumentTrayLine width={16} height={16} />
          CSV로 내보내기
        </ActionButton>
      </HStack>

      <Table>
        <TableHead>
          <TableRow>
            <TableHeadCell>이름</TableHeadCell>
            <TableHeadCell>학번</TableHeadCell>
            <TableHeadCell>단과대/학과</TableHeadCell>
            <TableHeadCell>역할</TableHeadCell>
            <TableHeadCell>지원 방식</TableHeadCell>
            <TableHeadCell>상태</TableHeadCell>
            <TableHeadCell>제출일</TableHeadCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isError && rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={7}>목록을 불러오지 못했어요</TableCell>
            </TableRow>
          )}
          {rows.length === 0 && !isError && (
            <TableRow>
              <TableCell colSpan={7}>아직 지원서가 없어요</TableCell>
            </TableRow>
          )}
          {rows.map((application) => (
            <TableRow
              key={application.id}
              interactive
              onClick={() => {
                setConfirmDelete(false);
                setSelected(application);
              }}
            >
              <TableCell>{application.name}</TableCell>
              <TableCell>{application.studentId}</TableCell>
              <TableCell>
                {application.college} / {application.department}
              </TableCell>
              <TableCell>{ROLE_LABELS[application.role]}</TableCell>
              <TableCell>
                {application.applicationType === "team"
                  ? "팀 지원"
                  : "개인 지원"}
              </TableCell>
              <TableCell>{STATUS_LABELS[application.status]}</TableCell>
              <TableCell>{formatDate(application.createdAt)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <SidePanelRoot
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) setSelected(undefined);
        }}
      >
        <SidePanelContent title={selected ? `${selected.name} 지원서` : ""}>
          <SidePanelBody paddingX="x6">
            {selected && (
              <VStack gap="spacingY.componentDefault" width="full">
                <DetailRow label="이름" value={selected.name} />
                <DetailRow label="학번" value={selected.studentId} />
                <DetailRow
                  label="단과대/학과"
                  value={`${selected.college} / ${selected.department}`}
                />
                <DetailRow label="전화번호" value={selected.phone} />
                <DetailRow label="생년월일" value={selected.birthDate} />
                <DetailRow label="역할" value={ROLE_LABELS[selected.role]} />
                <DetailRow
                  label="지원 방식"
                  value={
                    selected.applicationType === "team"
                      ? "팀 지원"
                      : "개인 지원"
                  }
                />
                <DetailRow
                  label="제출일"
                  value={formatDate(selected.createdAt)}
                />

                {selected.applicationType === "team" && (
                  <VStack gap="x2" width="full">
                    <Text textStyle="t4Regular" color="fg.neutralSubtle">
                      팀원 ({selected.teamMembers.length}명, 본인 제외)
                    </Text>
                    {selected.teamMembers.length === 0 ? (
                      <Text textStyle="t4Regular" color="fg.neutralSubtle">
                        입력된 팀원이 없어요
                      </Text>
                    ) : (
                      selected.teamMembers.map((member, index) => (
                        <Box
                          // biome-ignore lint/suspicious/noArrayIndexKey: static per-selected-application list, never reordered
                          key={index}
                          bg="bg.neutralWeak"
                          borderRadius="r2"
                          padding="x3"
                          width="full"
                        >
                          <Text textStyle="t4Regular">
                            {member.name} · {member.college} /{" "}
                            {member.department}
                          </Text>
                        </Box>
                      ))
                    )}
                  </VStack>
                )}

                <SelectRoot
                  label="상태"
                  value={[selected.status]}
                  onValueChange={(values) => {
                    const status = values[0] as ApplicationStatus | undefined;
                    if (status)
                      statusMutation.mutate({ id: selected.id, status });
                  }}
                >
                  <SelectTrigger />
                  <SelectContent>
                    <SelectGroup>
                      {STATUS_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          label={option.label}
                        />
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </SelectRoot>
              </VStack>
            )}
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
              삭제
            </ActionButton>
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
                  if (selected) deleteMutation.mutate(selected.id);
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

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <VStack gap="x1" width="full">
      <Text textStyle="t4Regular" color="fg.neutralSubtle">
        {label}
      </Text>
      <Text textStyle="t3Regular">{value}</Text>
    </VStack>
  );
}
