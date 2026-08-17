import { Box, Text, VStack } from "@seed-design/react";
import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  extra,
}: {
  label: string;
  value: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <Box bg="bg.neutralWeak" borderRadius="r2" paddingX="x3" paddingY="x3">
      <VStack gap="x1">
        <Text textStyle="t3Regular" color="fg.neutralSubtle">
          {label}
        </Text>
        <Text textStyle="t7Bold">{value}</Text>
        {extra}
      </VStack>
    </Box>
  );
}
