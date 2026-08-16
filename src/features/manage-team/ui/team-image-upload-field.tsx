"use client";

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
import { uploadTeamImageAction } from "../model/actions";

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
      const formData = new FormData();
      formData.set("file", entry.file);
      uploadTeamImageAction(formData)
        .then((url) => {
          helpers.updateFileEntryStatus(entry.id, { status: "success" });
          onUrlsChange((current) => [...current, url]);
        })
        .catch(() => {
          helpers.updateFileEntryStatus(entry.id, { status: "error" });
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
  const { ref } = useSortable({ id: url, index });

  return (
    <Box
      ref={ref}
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
          background: "var(--seed-color-bg-neutral-solid)",
          color: "var(--seed-color-fg-neutral-inverted)",
          cursor: "pointer",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </Box>
  );
}
