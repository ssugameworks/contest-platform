"use client";

import { RestrictToHorizontalAxis } from "@dnd-kit/abstract/modifiers";
import { Accessibility, AutoScroller } from "@dnd-kit/dom";
import { arrayMove } from "@dnd-kit/helpers";
import { DragDropProvider } from "@dnd-kit/react";
import { isSortable, useSortable } from "@dnd-kit/react/sortable";
import { Box, Field, HStack, VStack } from "@seed-design/react";
import type {
  FileEntry,
  FileStatusDetails,
} from "@seed-design/react/primitive";
import type { Dispatch, SetStateAction } from "react";
import {
  AttachmentField,
  AttachmentInput,
} from "seed-design/ui/attachment-field";
import { Snackbar, useSnackbarAdapter } from "seed-design/ui/snackbar";
import { compressImageFile } from "@/shared/lib/image/compress-image";
import { uploadTeamImageAction } from "../model/actions";

// Same dnd-kit setup seed-design's own AttachmentInputReorderable uses
// (screen-reader announcements + keyboard move support) — can't reuse that
// component directly since it manages File-backed FileEntry items end to
// end, and these thumbnails are already-uploaded URLs, not local Files.
const autoScrollerPlugin = AutoScroller.configure({
  threshold: { x: 0.2, y: 0 },
});
const accessibilityPlugin = Accessibility.configure({
  screenReaderInstructions: {
    draggable:
      "항목을 집어 항목 순서 변경을 시작하려면 스페이스 바를 누르세요. 방향키를 사용하여 순서를 변경한 뒤 스페이스 바를 다시 눌러 순서 변경을 종료하거나 Esc 키로 순서 변경을 취소할 수 있어요.",
  },
});

// ponytail: no inline upload-progress UI — the picker just stays enabled
// while an upload is in flight. Add a spinner/progress bar if uploads turn
// out slow enough that this feels unresponsive.
export function TeamImageUploadField({
  label,
  maxFiles = 1,
  urls,
  onUrlsChange,
}: {
  label: string;
  maxFiles?: number;
  urls: string[];
  onUrlsChange: Dispatch<SetStateAction<string[]>>;
}) {
  const remaining = Math.max(0, maxFiles - urls.length);
  const adapter = useSnackbarAdapter();

  const handleFileAccept = (
    entries: FileEntry[],
    helpers: {
      updateFileEntryStatus: (id: string, details: FileStatusDetails) => void;
    },
  ) => {
    // Functional updates, not `[...urls, url]` off the closed-over `urls` —
    // selecting several files at once fires one resolved promise per file,
    // and each would otherwise overwrite the others' result with the same
    // stale snapshot.
    for (const entry of entries) {
      helpers.updateFileEntryStatus(entry.id, { status: "uploading" });
      compressImageFile(entry.file)
        .then((file) => {
          const formData = new FormData();
          formData.set("file", file);
          return uploadTeamImageAction(formData);
        })
        .then((url) => {
          helpers.updateFileEntryStatus(entry.id, { status: "success" });
          onUrlsChange((current) => [...current, url]);
        })
        .catch((error) => {
          helpers.updateFileEntryStatus(entry.id, { status: "error" });
          const message =
            error instanceof Error && error.message
              ? error.message
              : "업로드에 실패했어요";
          adapter.create({
            onClose: () => {},
            render: () => <Snackbar variant="critical" message={message} />,
          });
        });
    }
  };

  return (
    <VStack gap="x2" width="full">
      <Field.Root>
        <Field.Header>
          <Field.Label>{label}</Field.Label>
        </Field.Header>
      </Field.Root>
      <DragDropProvider
        plugins={(defaults) => [
          ...defaults,
          autoScrollerPlugin,
          accessibilityPlugin,
        ]}
        onDragEnd={(event) => {
          const { source } = event.operation;
          if (event.canceled || !isSortable(source)) return;
          onUrlsChange((current) =>
            arrayMove(
              current,
              source.sortable.initialIndex,
              source.sortable.index,
            ),
          );
        }}
      >
        <HStack gap="x2" wrap align="center">
          {urls.map((url, index) => (
            <ImageThumbnail
              key={url}
              url={url}
              index={index}
              onRemove={() =>
                onUrlsChange((current) => current.filter((u) => u !== url))
              }
            />
          ))}
          {remaining > 0 && (
            <AttachmentField
              maxFiles={remaining}
              accept={["image/png", "image/jpeg", "image/webp", "image/gif"]}
              onFileAccept={handleFileAccept}
              rootProps={{ style: { width: "auto" } }}
            >
              <AttachmentInput>{() => null}</AttachmentInput>
            </AttachmentField>
          )}
        </HStack>
      </DragDropProvider>
    </VStack>
  );
}

function ImageThumbnail({
  url,
  index,
  onRemove,
}: {
  url: string;
  index: number;
  onRemove: () => void;
}) {
  const { ref } = useSortable({
    id: url,
    index,
    modifiers: [RestrictToHorizontalAxis],
    data: { name: url },
  });

  return (
    <Box
      ref={ref}
      tabIndex={0}
      aria-roledescription="draggable"
      position="relative"
      style={{ touchAction: "none", cursor: "grab" }}
    >
      {/* biome-ignore lint/performance/noImgElement: user-uploaded, not a local static asset */}
      <img
        src={url}
        alt=""
        style={{
          width: 72,
          height: 72,
          objectFit: "cover",
          borderRadius: 8,
        }}
      />
      <button
        type="button"
        aria-label="이미지 삭제"
        onClick={onRemove}
        onPointerDown={(event) => event.stopPropagation()}
        style={{
          position: "absolute",
          top: -6,
          right: -6,
          width: 20,
          height: 20,
          borderRadius: "50%",
          border: "none",
          // Same token pairing seed-design's own AttachmentInputItem remove
          // button uses (attachment-input-item.css) — bg.layer-default is
          // the current surface color (not an "inverted" one), so it
          // contrasts against both the theme and an arbitrary photo
          // underneath, in either light or dark mode.
          background: "var(--seed-color-bg-layer-default)",
          boxShadow: "inset 0 0 0 1px var(--seed-color-stroke-neutral-weak)",
          color: "var(--seed-color-fg-neutral)",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </Box>
  );
}
