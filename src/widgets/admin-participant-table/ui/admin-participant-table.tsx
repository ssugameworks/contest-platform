"use client";

import type { Participant } from "@/entities/participant";
import { listParticipantsAction } from "@/entities/participant/model/actions";
import { listTeamsAction } from "@/entities/team/model/actions";
import { ManageParticipantForm } from "@/features/manage-participant";
import { deleteParticipantAction } from "@/features/manage-participant/model/actions";
import { useSuspenseQueries } from "@/shared/lib/query/use-suspense-query";
import { AdminCrudTable } from "@/shared/ui/admin-crud-table";
import { SuspenseQueryBoundary } from "@/shared/ui/suspense-query-boundary";

const QUERY_KEY = ["admin-participants"];

export function AdminParticipantTable() {
  return (
    <SuspenseQueryBoundary>
      <AdminParticipantTableContent />
    </SuspenseQueryBoundary>
  );
}

function AdminParticipantTableContent() {
  // Batched with useSuspenseQueries so the teams lookup and the
  // participants list (otherwise fetched separately inside AdminCrudTable)
  // fire in parallel instead of one after the other.
  const [{ data: teams }, { data: participants }] = useSuspenseQueries({
    queries: [
      { queryKey: ["teams"], queryFn: listTeamsAction },
      { queryKey: QUERY_KEY, queryFn: listParticipantsAction },
    ],
  });
  const teamName = (teamId: string | null) => {
    if (!teamId) return "미배정";
    return teams.find((team) => team.id === teamId)?.name ?? "-";
  };

  return (
    <AdminCrudTable<Participant>
      items={participants}
      queryKey={QUERY_KEY}
      getId={(participant) => participant.studentId}
      searchLabel="참가자 검색"
      searchPlaceholder="이름 또는 학번으로 검색"
      searchPredicate={(participant, query) =>
        participant.name.includes(query) ||
        participant.studentId.includes(query)
      }
      addButtonLabel="새 참가자 추가"
      panelTitle={{ create: "참가자 추가", edit: "참가자 수정" }}
      formId="manage-participant-form"
      deleteAction={deleteParticipantAction}
      columns={[
        { header: "학번", cell: (participant) => participant.studentId },
        { header: "이름", cell: (participant) => participant.name },
        {
          header: "소속 팀",
          cell: (participant) => teamName(participant.teamId),
        },
      ]}
      renderForm={(participant, onSaved) => (
        <ManageParticipantForm
          key={participant?.studentId ?? "create"}
          participant={participant}
          onSaved={onSaved}
        />
      )}
    />
  );
}
