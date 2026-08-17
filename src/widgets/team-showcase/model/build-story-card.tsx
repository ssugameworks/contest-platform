import { toBlob } from "html-to-image";
import { createRoot } from "react-dom/client";
import type { Booth } from "@/entities/booth/model/pure";
import {
  STORY_CARD_HEIGHT,
  STORY_CARD_WIDTH,
  StoryCardTemplate,
} from "../ui/story-card-template";

// 인스타그램 스토리 규격(1080x1920, 9:16) = 카드 실제 크기(360x640) x 3배.
const PIXEL_RATIO = 3;

export async function buildStoryCard(props: {
  teamName: string;
  tags: string[];
  description: string;
  logoUrl: string | null;
  participantNames: string;
  booths: Booth[];
  teamId: string;
}): Promise<Blob> {
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = "0";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const root = createRoot(container);
  try {
    await new Promise<void>((resolve) => {
      root.render(<StoryCardTemplate {...props} />);
      // 커밋된 DOM이 레이아웃/페인트까지 끝난 뒤 캡처하도록 한 프레임 더 기다려요.
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });

    const node = container.firstElementChild;
    if (!(node instanceof HTMLElement)) {
      throw new Error("카드 DOM을 찾을 수 없어요");
    }

    const blob = await toBlob(node, {
      width: STORY_CARD_WIDTH,
      height: STORY_CARD_HEIGHT,
      pixelRatio: PIXEL_RATIO,
      cacheBust: true,
      // 로고가 없을 때 SEED Avatar가 항상 렌더링하는 빈 <img src=""> 때문에
      // html-to-image가 그 이미지를 현재 페이지 URL로 오인해 embed를
      // 시도하다 실패해요. src 없는 <img>만 클론 대상에서 제외해요.
      filter: (domNode) =>
        !(domNode instanceof HTMLImageElement && !domNode.getAttribute("src")),
    });
    if (!blob) throw new Error("이미지 생성에 실패했어요");
    return blob;
  } finally {
    root.unmount();
    container.remove();
  }
}
