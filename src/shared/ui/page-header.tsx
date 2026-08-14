import { Text, VStack } from "@seed-design/react";

export function PageHeader({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <VStack gap="x1" width="full">
      <Text textStyle="screenTitle">{title}</Text>
      {description && (
        <Text textStyle="t5Regular" color="fg.neutralSubtle">
          {description}
        </Text>
      )}
    </VStack>
  );
}
