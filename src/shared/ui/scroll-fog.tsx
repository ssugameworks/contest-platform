"use client";

import { Box, ScrollFog as SeedScrollFog } from "@seed-design/react";
import type { ComponentProps } from "react";

type SeedScrollFogProps = ComponentProps<typeof SeedScrollFog>;

// Matches ScrollFog's own default `size` prop.
const DEFAULT_FOG_SIZE = 20;

/**
 * Wraps seed-design's ScrollFog with an explicit reveal color instead of
 * whatever happens to sit behind the scroll container. ScrollFog only fades
 * its own content's opacity near the edges — the color that shows through
 * is whatever paints behind it — so this adds two strips, sized to exactly
 * the fog band and colored with --seed-color-bg-scroll-fog (globals.css:
 * dark in light mode, light in dark mode, deliberately inverted from the
 * page background so the fade reads as a shadow). They sit behind ScrollFog
 * in DOM order, so they're fully hidden under its opaque middle and only
 * show through the faded edges.
 */
export function ScrollFog({
  placement = ["top", "bottom"],
  size = DEFAULT_FOG_SIZE,
  children,
  ...props
}: SeedScrollFogProps) {
  const stripSize = typeof size === "number" ? `${size}px` : size;

  return (
    <Box position="relative" height="full" width="full">
      {placement.includes("top") && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          style={{
            height: stripSize,
            background: "var(--seed-color-bg-scroll-fog)",
          }}
        />
      )}
      {placement.includes("bottom") && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          style={{
            height: stripSize,
            background: "var(--seed-color-bg-scroll-fog)",
          }}
        />
      )}
      <SeedScrollFog placement={placement} size={size} {...props}>
        {children}
      </SeedScrollFog>
    </Box>
  );
}
