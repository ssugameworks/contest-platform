"use client";

import { useQuery } from "@tanstack/react-query";
import type { Participant } from "@/entities/participant";
import { listParticipantsAction } from "@/entities/participant/model/actions";
import { listTeamsAction } from "@/entities/team/model/actions";
import { ManageParticipantForm } from "@/features/manage-participant";
import { deleteParticipantAction } from "@/features/manage-participant/model/actions";
import { AdminCrudTable } from "@/shared/ui/admin-crud-table";

const QUERY_KEY = ["admin-participants"];

export function AdminParticipantTable() {
  const { data: teams = [] } = useQuery({
    queryKey: ["teams"],
    queryFn: listTeamsAction,
  });
  const teamName = (teamId: string | null) => {
    if (!teamId) return "미배정";
    return teams.find((team) => team.id === teamId)?.name ?? "-";
  };

  return (
    <AdminCrudTable<Participant>
      queryKey={QUERY_KEY}
      queryFn={listParticipantsAction}
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
