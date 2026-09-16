import { Box, ProgressCircle } from "@seed-design/react";

export function LoadingSpinner({
  size = "24",
  tone = "neutral",
}: {
  size?: "24" | "40" | "inherit";
  tone?: "neutral" | "brand" | "staticWhite" | "inherit";
}) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="full"
      paddingY="x6"
    >
      <ProgressCircle.Root size={size} tone={tone}>
        <ProgressCircle.Track />
        <ProgressCircle.Range />
      </ProgressCircle.Root>
    </Box>
  );
}
