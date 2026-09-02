const SDK_URL = "https://t1.kakaocdn.net/kakao_js_sdk/2.7.5/kakao.min.js";

interface KakaoLink {
  mobileWebUrl: string;
  webUrl: string;
}

interface KakaoFeedTemplate {
  objectType: "feed";
  content: {
    title: string;
    description?: string;
    imageUrl: string;
    link: KakaoLink;
  };
  buttons?: Array<{ title: string; link: KakaoLink }>;
}

interface KakaoTextTemplate {
  objectType: "text";
  text: string;
  link: KakaoLink;
  buttons?: Array<{ title: string; link: KakaoLink }>;
}

export type KakaoShareTemplate = KakaoFeedTemplate | KakaoTextTemplate;

export interface KakaoSdk {
  init(jsKey: string): void;
  isInitialized(): boolean;
  Share: {
    sendDefault(options: KakaoShareTemplate): void;
  };
}

declare global {
  interface Window {
    Kakao?: KakaoSdk;
  }
}

let loadPromise: Promise<KakaoSdk> | null = null;

/** 카카오 JS SDK를 한 번만 불러와 초기화해요. 실패하면 다음 호출에서 다시 시도해요. */
export function loadKakaoSdk(): Promise<KakaoSdk> {
  if (typeof window === "undefined") {
    return Promise.reject(
      new Error("카카오 SDK는 브라우저에서만 불러올 수 있어요"),
    );
  }

  const jsKey = process.env.NEXT_PUBLIC_KAKAO_JS_KEY;
  if (!jsKey) {
    return Promise.reject(
      new Error("카카오 JavaScript 키가 설정되지 않았어요"),
    );
  }

  if (loadPromise) return loadPromise;

  loadPromise = new Promise<KakaoSdk>((resolve, reject) => {
    const ready = () => {
      const kakao = window.Kakao;
      if (!kakao) {
        reject(new Error("카카오 SDK 로드에 실패했어요"));
        return;
      }
      if (!kakao.isInitialized()) {
        kakao.init(jsKey);
      }
      resolve(kakao);
    };

    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${SDK_URL}"]`,
    );
    if (existing) {
      window.Kakao
        ? ready()
        : existing.addEventListener("load", ready, { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("카카오 SDK 로드에 실패했어요")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = ready;
    script.onerror = () => reject(new Error("카카오 SDK 로드에 실패했어요"));
    document.head.appendChild(script);
  }).catch((error) => {
    loadPromise = null;
    throw error;
  });

  return loadPromise;
}
