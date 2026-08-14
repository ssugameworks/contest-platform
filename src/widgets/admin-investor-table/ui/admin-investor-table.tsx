"use client";

import type { Investor } from "@/entities/investor";
import { ManageInvestorForm } from "@/features/manage-investor";
import {
  deleteInvestorAction,
  listInvestorsAction,
} from "@/features/manage-investor/model/actions";
import { AdminCrudTable } from "@/shared/ui/admin-crud-table";

const QUERY_KEY = ["admin-investors"];

export function AdminInvestorTable() {
  return (
    <AdminCrudTable<Investor>
      queryKey={QUERY_KEY}
      queryFn={listInvestorsAction}
      getId={(investor) => investor.id}
      searchLabel="투자자 검색"
      searchPlaceholder="이름 또는 학번으로 검색"
      searchPredicate={(investor, query) =>
        investor.name.includes(query) || investor.studentId.includes(query)
      }
      addButtonLabel="새 투자자 추가"
      panelTitle={{ create: "투자자 추가", edit: "투자자 수정" }}
      formId="manage-investor-form"
      deleteAction={deleteInvestorAction}
      columns={[
        { header: "이름", cell: (investor) => investor.name },
        { header: "학번", cell: (investor) => investor.studentId },
        {
          header: "보유 예산",
          align: "right",
          cell: (investor) => `${investor.totalBudget.toLocaleString()}원`,
          sortValue: (investor) => investor.totalBudget,
        },
      ]}
      renderForm={(investor, onSaved) => (
        <ManageInvestorForm
          key={investor?.id ?? "create"}
          investor={investor}
          onSaved={onSaved}
        />
      )}
    />
  );
}
