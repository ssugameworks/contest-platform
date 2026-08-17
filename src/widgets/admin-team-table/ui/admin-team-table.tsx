"use client";

import { ManageTeamForm } from "@/features/manage-team";
import { deleteTeamAction } from "@/features/manage-team/model/actions";
import { AdminCrudTable } from "@/shared/ui/admin-crud-table";
import { type AdminTeamRow, listAdminTeamRows } from "../model/actions";

const QUERY_KEY = ["admin-team-rows"];

export function AdminTeamTable() {
  return (
    <AdminCrudTable<AdminTeamRow>
      queryKey={QUERY_KEY}
      queryFn={listAdminTeamRows}
      getId={(row) => row.team.id}
      searchLabel="팀 검색"
      searchPlaceholder="팀 이름으로 검색"
      searchPredicate={(row, query) => row.team.name.includes(query)}
      addButtonLabel="새 팀 추가"
      panelTitle={{ create: "팀 추가", edit: "팀 수정" }}
      formId="manage-team-form"
      deleteAction={deleteTeamAction}
      columns={[
        { header: "팀명", cell: (row) => row.team.name },
        {
          header: "모금액",
          align: "right",
          cell: (row) => `${row.amount.toLocaleString()}원`,
          sortValue: (row) => row.amount,
        },
        {
          header: "투자자 수",
          align: "right",
          cell: (row) => `${row.investorCount}명`,
        },
        { header: "부스 위치", cell: (row) => row.boothLabel },
      ]}
      renderForm={(row, onSaved) => (
        <ManageTeamForm
          key={row?.team.id ?? "create"}
          team={row?.team}
          onSaved={onSaved}
        />
      )}
    />
  );
}
