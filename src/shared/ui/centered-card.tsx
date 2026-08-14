import { Box, VStack } from "@seed-design/react";
import type { ReactNode } from "react";

export function CenteredCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <Box
      display="flex"
      flexGrow={1}
      width="full"
      alignItems="center"
      justifyContent="center"
      padding={{ base: "x4", sm: "x6", md: "x8" }}
    >
      <Box
        width="full"
        maxWidth={{ base: "full", sm: "400px" }}
        padding={{ base: 0, sm: "x6" }}
        borderRadius="r2"
      >
        <VStack gap="spacingY.componentDefault" width="full">
          <VStack gap="x2" width="full">
            <h1 className="text-xl font-semibold">{title}</h1>
            {description && (
              <p className="text-sm text-zinc-500">{description}</p>
            )}
          </VStack>
          {children}
        </VStack>
      </Box>
    </Box>
  );
}
