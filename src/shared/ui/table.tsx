import { Text } from "@seed-design/react";
import type { ReactNode } from "react";
import { cn } from "@/shared/lib/cn";

const BORDER = "var(--seed-color-stroke-neutral-weak)";
const HEAD_BG = "var(--seed-color-bg-neutral-weak)";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div
      className="w-full overflow-x-auto"
      style={{
        borderRadius: "var(--seed-radius-r3)",
        border: `1px solid ${BORDER}`,
      }}
    >
      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: 0,
        }}
      >
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0" style={{ background: HEAD_BG, zIndex: 1 }}>
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody>{children}</tbody>;
}

export function TableFoot({ children }: { children: ReactNode }) {
  return <tfoot>{children}</tfoot>;
}

export function TableRow({
  interactive = false,
  onClick,
  children,
}: {
  interactive?: boolean;
  onClick?: () => void;
  children: ReactNode;
}) {
  return (
    <tr
      onClick={onClick}
      className={cn(
        interactive &&
          "cursor-pointer transition-colors hover:bg-[var(--seed-color-bg-neutral-weak)]",
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeadCell({
  children,
  align = "left",
  onClick,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  onClick?: () => void;
}) {
  return (
    <th
      onClick={onClick}
      style={{
        padding: "var(--seed-dimension-x2) var(--seed-dimension-x5)",
        textAlign: align,
        borderBottom: `1px solid ${BORDER}`,
        cursor: onClick ? "pointer" : undefined,
        userSelect: onClick ? "none" : undefined,
      }}
    >
      <Text textStyle="t3Bold" color="fg.neutralSubtle">
        {children}
      </Text>
    </th>
  );
}

export function TableCell({
  children,
  align = "left",
  colSpan,
}: {
  children: ReactNode;
  align?: "left" | "right" | "center";
  colSpan?: number;
}) {
  return (
    <td
      colSpan={colSpan}
      style={{
        padding: "var(--seed-dimension-x4) var(--seed-dimension-x5)",
        textAlign: align,
        borderBottom: `1px solid ${BORDER}`,
      }}
    >
      <Text textStyle="t4Regular">{children}</Text>
    </td>
  );
}
