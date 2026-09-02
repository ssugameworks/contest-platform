import { loadKakaoSdk } from "@/shared/lib/kakao/load-kakao-sdk";

/**
 * 카카오톡 공유하기를 시도해요.
 *
 * 팀 로고가 있으면 이미지가 보이는 피드 템플릿으로, 없으면 텍스트
 * 템플릿으로 보내요 — 카카오 피드 템플릿은 imageUrl이 필수라 대체할
 * 사이트 대표 이미지가 없는 지금은 이렇게 나눠요.
 */
export async function shareToKakaoTalk({
  teamName,
  description,
  imageUrl,
  url,
}: {
  teamName: string;
  description: string;
  imageUrl: string | null;
  url: string;
}): Promise<void> {
  const kakao = await loadKakaoSdk();
  const link = { mobileWebUrl: url, webUrl: url };
  const buttons = [{ title: "팀 페이지 보기", link }];

  if (imageUrl) {
    kakao.Share.sendDefault({
      objectType: "feed",
      content: { title: teamName, description, imageUrl, link },
      buttons,
    });
    return;
  }

  kakao.Share.sendDefault({
    objectType: "text",
    text: description ? `${teamName}\n${description}` : teamName,
    link,
    buttons,
  });
}
