import { Text, type TextProps, VStack } from "@seed-design/react";

export function PageHeader({
  title,
  description,
  titleTextStyle = "screenTitle",
}: {
  title: string;
  description?: string;
  titleTextStyle?: TextProps["textStyle"];
}) {
  return (
    <VStack gap="x1" width="full">
      <Text textStyle={titleTextStyle}>{title}</Text>
      {description && (
        <Text textStyle="t5Regular" color="fg.neutralSubtle">
          {description}
        </Text>
      )}
    </VStack>
  );
}
