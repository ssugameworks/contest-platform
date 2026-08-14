import type { ReactNode } from "react";
import { Footer } from "@/shared/ui/footer";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
