import { toBlob } from "html-to-image";
import { createRoot } from "react-dom/client";
import type {
  Booth,
  BoothMarker,
  BoothMatrixConfig,
} from "@/entities/booth/model/pure";
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
  markers?: BoothMarker[];
  matrixConfig?: BoothMatrixConfig;
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
      // cacheBust를 켜면 매번 로고를 새로 네트워크에서 받아와서, 헤더 아바타가
      // crossOrigin="anonymous"로 이미 데워둔 브라우저 캐시를 못 쓰게 돼요.
      // 그러면 캡처가 느려져서 navigator.share()의 user activation이
      // 만료되기 쉬워지니 캐시를 그대로 재사용해요.
      cacheBust: false,
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
