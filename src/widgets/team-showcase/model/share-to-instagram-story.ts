import type {
  Booth,
  BoothMarker,
  BoothMatrixConfig,
} from "@/entities/booth/model/pure";
import { buildStoryCard } from "./build-story-card";

export type ShareOutcome = "share-sheet" | "downloaded";

export interface StoryShareProgress {
  percent: number;
  message: string;
}

export interface PreparedStoryShare {
  file: File;
  teamName: string;
  url: string;
}

/**
 * 인스타그램 스토리 공유를 시도해요.
 *
 * Web Share API로 OS 공유 시트를 띄워요 — 인스타그램을 고르면 스토리
 * 배경까지 정상적으로 채워지는, 웹에서 갈 수 있는 유일하게 안정적인 경로예요.
 *
 * (`instagram-stories://` 커스텀 스킴으로 바로 진입하는 방법도 시도해봤지만,
 * 스토리 배경 이미지는 네이티브 전용 pasteboard 포맷
 * `com.instagram.sharedSticker.backgroundImage`으로만 넘길 수 있고 브라우저
 * Clipboard API는 표준 포맷(`image/png`)만 지원해서 앱은 열려도 배경이
 * 항상 빈 화면으로 떠요. 웹에서 고칠 수 없는 플랫폼 한계라 걷어냈어요.)
 *
 * Web Share API가 없으면 이미지를 다운로드시켜서 수동 공유를 유도해요.
 */
export async function prepareInstagramStory({
  teamName,
  tags,
  description,
  logoUrl,
  url,
  participantNames,
  booths,
  markers = [],
  matrixConfig,
  teamId,
  onProgress,
}: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  url: string;
  participantNames: string;
  booths: Booth[];
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
  teamId: string;
  onProgress?: (progress: StoryShareProgress) => void;
}): Promise<PreparedStoryShare> {
  const blob = await buildStoryCard(
    {
      teamName,
      tags,
      description,
      logoUrl,
      participantNames,
      booths,
      markers,
      matrixConfig,
      teamId,
    },
    (percent, message) => onProgress?.({ percent, message }),
  );

  const file = new File([blob], `${teamName}-story.png`, {
    type: "image/png",
  });
  onProgress?.({ percent: 100, message: "공유 화면을 열고 있어요" });

  return { file, teamName, url };
}

export async function sharePreparedInstagramStory({
  file,
  teamName,
  url,
}: PreparedStoryShare): Promise<ShareOutcome> {
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: teamName, url });
    return "share-sheet";
  }

  const downloadUrl = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = `${teamName}-story.png`;
  link.click();
  URL.revokeObjectURL(downloadUrl);
  return "downloaded";
}
