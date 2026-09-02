/**
 * @file ui:avatar
 * @requires @seed-design/react@^2.0.0
 * @requires @seed-design/css@^2.0.0
 **/

"use client";

import { Avatar as SeedAvatar } from "@seed-design/react";
import * as React from "react";

export interface AvatarProps extends SeedAvatar.RootProps {
  src?: string;

  alt?: string;

  /** 캔버스로 캡처해야 하는 이미지(예: 스토리 카드)에는 "anonymous"를 넘겨서 CORS 요청으로 로드해요. */
  crossOrigin?: React.ImgHTMLAttributes<HTMLImageElement>["crossOrigin"];

  fallback?: React.ReactNode;
}

/**
 * @see https://seed-design.io/react/components/avatar
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, crossOrigin, fallback, children, ...otherProps }, ref) => {
    return (
      <SeedAvatar.Root ref={ref} {...otherProps}>
        <SeedAvatar.Fallback>{fallback}</SeedAvatar.Fallback>
        <SeedAvatar.Image src={src} alt={alt} crossOrigin={crossOrigin} />
        {children}
      </SeedAvatar.Root>
    );
  },
);
Avatar.displayName = "Avatar";

export interface AvatarBadgeProps extends SeedAvatar.BadgeProps {}

export const AvatarBadge = SeedAvatar.Badge;

export interface AvatarStackProps extends SeedAvatar.StackProps {}

export const AvatarStack = SeedAvatar.Stack;

/**
 * This file is a snippet from SEED Design, helping you get started quickly with @seed-design/* packages.
 * You can extend this snippet however you want.
 */
