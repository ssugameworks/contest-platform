import IconArrowDownLineVerticalArrowUpSquareFill from "@karrotmarket/react-monochrome-icon/IconArrowDownLineVerticalArrowUpSquareFill";
import IconBarchartBoardFill from "@karrotmarket/react-monochrome-icon/IconBarchartBoardFill";
import IconBracketLeftArrowRightLine from "@karrotmarket/react-monochrome-icon/IconBracketLeftArrowRightLine";
import IconCameraFill from "@karrotmarket/react-monochrome-icon/IconCameraFill";
import IconCompassFill from "@karrotmarket/react-monochrome-icon/IconCompassFill";
import IconILowercaseSerifCircleFill from "@karrotmarket/react-monochrome-icon/IconILowercaseSerifCircleFill";
import IconMalesymbolFemalesymbolLine from "@karrotmarket/react-monochrome-icon/IconMalesymbolFemalesymbolLine";
import IconStarFill from "@karrotmarket/react-monochrome-icon/IconStarFill";
import IconStepsFill from "@karrotmarket/react-monochrome-icon/IconStepsFill";
import type { ComponentType, SVGProps } from "react";
import type { BoothMarkerKind } from "../model/pure";

export const BOOTH_MARKER_META: Record<
  BoothMarkerKind,
  { label: string; Icon: ComponentType<SVGProps<SVGSVGElement>> }
> = {
  info: { label: "안내", Icon: IconILowercaseSerifCircleFill },
  photo: { label: "포토존", Icon: IconCameraFill },
  stairs: { label: "계단", Icon: IconStepsFill },
  elevator: {
    label: "엘리베이터",
    Icon: IconArrowDownLineVerticalArrowUpSquareFill,
  },
  sponsor: { label: "스폰서", Icon: IconStarFill },
  direction: { label: "방향", Icon: IconCompassFill },
  restroom: { label: "화장실", Icon: IconMalesymbolFemalesymbolLine },
  scoreboard: { label: "스코어보드", Icon: IconBarchartBoardFill },
  door: { label: "출입문", Icon: IconBracketLeftArrowRightLine },
};
