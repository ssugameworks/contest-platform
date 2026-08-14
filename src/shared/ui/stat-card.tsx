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
    <Box bg="bg.neutralWeak" borderRadius="r2" paddingX="x6" paddingY="x6">
      <VStack gap="x2">
        <Text textStyle="t3Regular" color="fg.neutralSubtle">
          {label}
        </Text>
        <Text textStyle="t7Bold">{value}</Text>
        {extra}
      </VStack>
    </Box>
  );
}
