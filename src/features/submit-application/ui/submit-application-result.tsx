import IconCheckmarkCircleFill from "@karrotmarket/react-monochrome-icon/IconCheckmarkCircleFill";
import { Box, Icon, Text, VStack } from "@seed-design/react";

export function SubmitApplicationResult() {
  return (
    <Box bg="bg.neutralWeak" borderRadius="r2" padding="x6" width="full">
      <VStack gap="x3" width="full" align="center">
        <Icon
          svg={<IconCheckmarkCircleFill width={40} height={40} />}
          color="fg.positive"
        />
        <Text textStyle="t3Bold">지원이 접수됐어요</Text>
        <Text
          textStyle="t4Regular"
          color="fg.neutralSubtle"
          style={{ textAlign: "center" }}
        >
          검토 후 등록하신 연락처로 개별 안내드릴게요
        </Text>
      </VStack>
    </Box>
  );
}
