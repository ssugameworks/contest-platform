const MAX_DIMENSION = 1600;
const LOSSY_QUALITY = 0.85;

/**
 * 업로드 전에 큰 사진(주로 폰 카메라 원본)을 줄여요. 이미 충분히 작으면
 * 그대로 두고, GIF는 애니메이션이 깨지니 손대지 않아요. 포맷은 원본 그대로
 * 유지해서(PNG는 무손실 리사이즈만) 투명 배경 로고가 깨지지 않게 해요.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(
    1,
    MAX_DIMENSION / Math.max(bitmap.width, bitmap.height),
  );
  if (scale === 1) {
    bitmap.close();
    return file;
  }

  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const quality = file.type === "image/png" ? undefined : LOSSY_QUALITY;
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, file.type, quality),
  );
  if (!blob || blob.size >= file.size) return file;

  // toBlob이 요청한 file.type으로 인코딩하지 못하면 다른 포맷으로 조용히
  // 폴백할 수 있어서(예: 지원 안 되는 타입 → PNG), 실제 인코딩된 blob.type을
  // 신뢰해야 파일 확장자/내용과 선언된 타입이 어긋나지 않아요.
  return new File([blob], file.name, { type: blob.type || file.type });
}
