import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // 기본 1MB로는 팀 로고/제품 스크린샷 업로드(최대 10MB)가 항상 막혀서
    // 늘림. multipart 경계/헤더 오버헤드 여유분 포함.
    serverActions: {
      bodySizeLimit: "11mb",
    },
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
