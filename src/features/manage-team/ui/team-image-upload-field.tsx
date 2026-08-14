"use client";

import { Box, Field, HStack, VStack } from "@seed-design/react";
import type {
  FileEntry,
  FileStatusDetails,
} from "@seed-design/react/primitive";
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
  onUrlsChange: (urls: string[]) => void;
}) {
  const remaining = Math.max(0, maxFiles - urls.length);

  const handleFileAccept = (
    entries: FileEntry[],
    helpers: {
      updateFileEntryStatus: (id: string, details: FileStatusDetails) => void;
    },
  ) => {
    for (const entry of entries) {
      helpers.updateFileEntryStatus(entry.id, { status: "uploading" });
      const formData = new FormData();
      formData.set("file", entry.file);
      uploadTeamImageAction(formData)
        .then((url) => {
          helpers.updateFileEntryStatus(entry.id, { status: "success" });
          onUrlsChange([...urls, url]);
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
      {urls.length > 0 && (
        <HStack gap="x2" wrap>
          {urls.map((url) => (
            <Box key={url} position="relative">
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
                onClick={() => onUrlsChange(urls.filter((u) => u !== url))}
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
          ))}
        </HStack>
      )}
      {remaining > 0 && (
        <AttachmentField
          maxFiles={remaining}
          accept={["image/png", "image/jpeg", "image/webp", "image/gif"]}
          onFileAccept={handleFileAccept}
        >
          <AttachmentInput>{() => null}</AttachmentInput>
        </AttachmentField>
      )}
    </VStack>
  );
}
