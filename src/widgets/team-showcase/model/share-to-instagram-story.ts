import { buildStoryCard } from "./build-story-card";

export type ShareOutcome = "instagram-direct" | "share-sheet" | "downloaded";

function isIOS() {
  // iPadOS 13+는 데스크톱 Safari로 위장해서 UA에 iPad가 안 잡히니,
  // 터치 지원 여부로 한 번 더 걸러요.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

/**
 * 인스타그램 스토리 공유를 시도해요.
 *
 * - iOS + Facebook App ID가 설정된 경우: 클립보드에 이미지를 쓰고
 *   `instagram-stories://` 스킴으로 스토리 작성 화면을 바로 엽니다.
 *   (공식 pasteboard 스티커 API가 아니라 general pasteboard에 이미지를
 *   얹어두는 방식이라, 인스타그램/iOS 업데이트로 깨질 수 있는 비공식 동작이에요.)
 * - 그 외에는 Web Share API로 OS 공유 시트를 띄워요. 안드로이드는 이 경로가
 *   웹에서 갈 수 있는 사실상 최선이에요 — 인스타그램에 파일을 직접
 *   content:// 로 꽂아 넣는 건 네이티브 앱/파일 프로바이더 없이는 불가능해요.
 *   ponytail: 안드로이드 "바로 진입"은 없음, 인스타그램 앱 설치 시
 *   공유 시트에서 인스타그램 선택 → 스토리 추가로 한 단계만 더 거침.
 * - Web Share API도 없으면 이미지를 다운로드시켜서 수동 공유를 유도해요.
 */
export async function shareToInstagramStory({
  teamName,
  tags,
  description,
  logoUrl,
  url,
}: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  url: string;
}): Promise<ShareOutcome> {
  const linkLabel = new URL(url).host + new URL(url).pathname;
  const blob = await buildStoryCard({
    teamName,
    tags,
    description,
    logoUrl,
    linkLabel,
  });

  const appId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;
  if (isIOS() && appId) {
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    window.location.href = `instagram-stories://share?source_application=${appId}`;
    return "instagram-direct";
  }

  const file = new File([blob], `${teamName}-story.png`, {
    type: "image/png",
  });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: teamName, url });
    return "share-sheet";
  }

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${teamName}-story.png`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
  return "downloaded";
}
