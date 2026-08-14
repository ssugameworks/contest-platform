"use client";

import {
  Box,
  HStack,
  Icon,
  Footer as SeedFooter,
  Text,
  VStack,
} from "@seed-design/react";
import { IconInstagram } from "seed-design/icon/icon-instagram";
import { IconKakaoTalk } from "seed-design/icon/icon-kakaotalk";
import { ActionButton } from "seed-design/ui/action-button";
import { Logo } from "@/shared/ui/logo";

export function Footer() {
  return (
    <Box as="footer" width="full" paddingX="x8" paddingY="x10">
      <VStack gap="x4" align="flex-start">
        <Logo />

        <HStack gap="x6" wrap align="center">
          <SeedFooter.LinkText size="medium" href="#">
            이용약관
          </SeedFooter.LinkText>
          <SeedFooter.LinkText size="medium" href="#">
            개인정보처리방침
          </SeedFooter.LinkText>
        </HStack>

        <HStack
          justify="space-between"
          align="center"
          width="full"
          wrap
          gap="x4"
        >
          <Text textStyle="t3Regular" color="fg.neutralSubtle">
            학부 소모임 대회 플랫폼 | 문의는 운영진에게 카카오톡으로
            연락해주세요
          </Text>

          <HStack gap="x4">
            <ActionButton
              variant="ghost"
              size="large"
              layout="iconOnly"
              bleedX="asPadding"
              aria-label="카카오톡"
            >
              <Icon svg={<IconKakaoTalk />} />
            </ActionButton>
            <ActionButton
              variant="ghost"
              size="large"
              layout="iconOnly"
              bleedX="asPadding"
              aria-label="인스타그램"
            >
              <Icon svg={<IconInstagram />} />
            </ActionButton>
          </HStack>
        </HStack>
      </VStack>
    </Box>
  );
}
