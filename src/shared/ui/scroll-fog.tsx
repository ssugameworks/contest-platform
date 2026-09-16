"use client";

import { Box, ScrollFog as SeedScrollFog } from "@seed-design/react";
import type { ComponentProps, CSSProperties } from "react";

type SeedScrollFogProps = ComponentProps<typeof SeedScrollFog>;
type Placement = "top" | "bottom" | "left" | "right";

// Matches ScrollFog's own default `size` prop.
const DEFAULT_FOG_SIZE = 20;

const GRADIENT_DIRECTION: Record<Placement, string> = {
  top: "to bottom",
  bottom: "to top",
  left: "to right",
  right: "to left",
};

const EDGE_STYLE: Record<Placement, CSSProperties> = {
  top: { top: 0, left: 0, right: 0 },
  bottom: { bottom: 0, left: 0, right: 0 },
  left: { top: 0, bottom: 0, left: 0 },
  right: { top: 0, bottom: 0, right: 0 },
};

/**
 * Wraps seed-design's ScrollFog with a plain gradient overlay in a fixed
 * reveal color, painted on top, instead of relying on ScrollFog's own
 * mask-image to fade content onto whatever sits behind it.
 *
 * mask-image's alpha-vs-luminance handling (and mask-composite) differs
 * enough between Chromium and WebKit that the color strip approach came out
 * as a hard-edged rectangle in Chrome and a plain white band in Safari — a
 * linear-gradient overlay has no such ambiguity and renders identically
 * everywhere. Sits above ScrollFog (later in DOM order) with
 * pointer-events: none so it never blocks scrolling/clicks.
 */
export function ScrollFog({
  placement = ["top", "bottom"],
  size = DEFAULT_FOG_SIZE,
  children,
  ...props
}: SeedScrollFogProps) {
  const sizePx = typeof size === "number" ? `${size}px` : size;

  return (
    <Box position="relative" height="full" width="full">
      <SeedScrollFog placement={placement} size={size} {...props}>
        {children}
      </SeedScrollFog>
      {placement.map((side) => (
        <Box
          key={side}
          position="absolute"
          style={{
            ...EDGE_STYLE[side],
            [side === "top" || side === "bottom" ? "height" : "width"]: sizePx,
            background: `linear-gradient(${GRADIENT_DIRECTION[side]}, var(--seed-color-bg-scroll-fog), transparent)`,
            pointerEvents: "none",
          }}
        />
      ))}
    </Box>
  );
}
