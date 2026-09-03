"use client";

import IconXmarkLine from "@karrotmarket/react-monochrome-icon/IconXmarkLine";
import { HStack, Text, VStack } from "@seed-design/react";
import {
  type Dispatch,
  type KeyboardEvent,
  type SetStateAction,
  useState,
} from "react";
import { TextField, TextFieldInput } from "seed-design/ui/text-field";

// Enter/쉼표로 태그를 확정하고, 빈 입력에서 Backspace를 누르면 마지막 태그를
// 지움 — 대부분의 태그 입력 UI가 따르는 관례라 별도 안내 없이도 직관적임.
export function TagInputField({
  label,
  description,
  tags,
  onTagsChange,
  placeholder = "태그를 입력하고 Enter를 눌러주세요",
}: {
  label: string;
  description?: string;
  tags: string[];
  onTagsChange: Dispatch<SetStateAction<string[]>>;
  placeholder?: string;
}) {
  const [inputValue, setInputValue] = useState("");

  const commitTag = () => {
    const tag = inputValue.trim();
    setInputValue("");
    if (!tag) return;
    onTagsChange((current) =>
      current.includes(tag) ? current : [...current, tag],
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commitTag();
      return;
    }
    if (event.key === "Backspace" && inputValue === "" && tags.length > 0) {
      onTagsChange((current) => current.slice(0, -1));
    }
  };

  return (
    <VStack gap="x2" width="full">
      <TextField label={label} description={description}>
        <TextFieldInput
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commitTag}
          placeholder={placeholder}
        />
      </TextField>

      {tags.length > 0 && (
        <HStack gap="x2" wrap>
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={tag}
              onRemove={() =>
                onTagsChange((current) => current.filter((t) => t !== tag))
              }
            />
          ))}
        </HStack>
      )}
    </VStack>
  );
}

function TagChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <HStack
      gap="x1"
      align="center"
      bg="bg.neutralWeak"
      borderRadius="full"
      paddingX="x3"
      paddingY="x1"
    >
      <Text textStyle="t3Regular">{label}</Text>
      <button
        type="button"
        aria-label={`${label} 태그 삭제`}
        onClick={onRemove}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 16,
          height: 16,
          border: "none",
          background: "transparent",
          color: "var(--seed-color-fg-neutral-subtle)",
          cursor: "pointer",
          padding: 0,
        }}
      >
        <IconXmarkLine width={12} height={12} />
      </button>
    </HStack>
  );
}
